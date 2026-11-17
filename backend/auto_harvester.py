"""Kalan gerçek Süper Lig maçlarını kota korumalı olarak yavaş yavaş indiren ve siteyi güncelleyen toplayıcı."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import time
from pathlib import Path
from typing import Any

from highlightly_client import BRONZE_DIR, HighlightlyClient
from sync_highlightly import (
    WEB_DIR,
    find_super_lig_league_info,
    merge_bronze_into_gold,
    unwrap_data,
)


def list_harvest_progress() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Önbellekteki oynanmış (Finished) maçları indirilenler ve bekleyenler olarak ayırır."""
    matches_dir = BRONZE_DIR / "matches"
    details_dir = BRONZE_DIR / "match_details"
    lineups_dir = BRONZE_DIR / "lineups"

    finished_by_id: dict[int, dict[str, Any]] = {}
    if matches_dir.exists():
        for fpath in sorted(matches_dir.glob("*.json")):
            raw = json.loads(fpath.read_text(encoding="utf-8"))
            for m in unwrap_data(raw):
                if isinstance(m, dict) and m.get("id") is not None:
                    if (m.get("state") or {}).get("description") == "Finished":
                        finished_by_id[int(m["id"])] = m

    sorted_finished = sorted(
        finished_by_id.values(),
        key=lambda m: str(m.get("date") or ""),
        reverse=True,
    )

    completed: list[dict[str, Any]] = []
    pending: list[dict[str, Any]] = []
    for m in sorted_finished:
        mid = int(m["id"])
        has_detail = (details_dir / f"match_{mid}.json").exists()
        has_lineup = (lineups_dir / f"lineup_{mid}.json").exists()
        if has_detail and has_lineup:
            completed.append(m)
        else:
            pending.append(m)

    return completed, pending


def refresh_live_round_feeds(client: HighlightlyClient, season: str) -> None:
    """Zamanlanmış otomatik çalışmada güncel puan durumu, fikstür ve video özetlerini yeniler."""
    country = os.environ.get("SUPER_LIG_COUNTRY", "Turkey")
    league_hint = os.environ.get("SUPER_LIG_LEAGUE_NAME", "Süper Lig")
    league_id, detected_season = find_super_lig_league_info(client, country, league_hint)
    if not league_id:
        return
    active_season = detected_season or season

    client.get(
        "/standings",
        params={"leagueId": league_id, "season": active_season},
        cache_group="standings",
        cache_name=f"standings_{league_id}_{active_season}",
        force_refresh=True,
    )
    page0 = client.get(
        "/matches",
        params={"leagueId": league_id, "season": active_season},
        cache_group="matches",
        cache_name=f"matches_{league_id}_{active_season}",
        force_refresh=True,
    )
    total_count = 0
    if isinstance(page0, dict) and isinstance(page0.get("pagination"), dict):
        total_count = int(page0["pagination"].get("totalCount") or 0)
    for offset in (100, 200):
        if client.budget_stopped or (total_count and offset >= total_count):
            break
        client.get(
            "/matches",
            params={"leagueId": league_id, "season": active_season, "offset": offset},
            cache_group="matches",
            cache_name=f"matches_{league_id}_{active_season}_offset{offset}",
            force_refresh=True,
        )
    client.get(
        "/highlights",
        params={"leagueId": league_id, "season": active_season},
        cache_group="highlights",
        cache_name=f"highlights_{league_id}_{active_season}",
        force_refresh=True,
    )


def run_batch(
    batch_budget: int,
    refresh_feeds: bool,
    run_build: bool,
    season: str,
) -> tuple[int, int]:
    client = HighlightlyClient(max_requests_per_run=batch_budget)

    if refresh_feeds:
        refresh_live_round_feeds(client, season)

    completed, pending = list_harvest_progress()
    print(
        f"[AutoHarvester] İlerleme: {len(completed)}/{len(completed) + len(pending)} "
        f"oynanmış maç tamamlandı | Bekleyen: {len(pending)} | Kalan Güvenli Kota: {client.total_remaining_safe_quota()}"
    )

    for m in pending:
        if client.budget_stopped:
            break
        mid = int(m["id"])
        client.get(f"/matches/{mid}", cache_group="match_details", cache_name=f"match_{mid}")
        if client.budget_stopped:
            break
        client.get(f"/lineups/{mid}", cache_group="lineups", cache_name=f"lineup_{mid}")

    merge_res = merge_bronze_into_gold()
    completed_after, pending_after = list_harvest_progress()
    print(
        f"[AutoHarvester] Tur Bitti -> Harcanan API: {client.requests_made_this_run}, "
        f"Tamamlanan Maç: {len(completed_after)}/{len(completed_after) + len(pending_after)}, "
        f"Gold: {merge_res}"
    )

    if run_build and client.requests_made_this_run > 0:
        print("[AutoHarvester] Live Server / statik HTML (npm run build) güncelleniyor...")
        subprocess.run("npm run build", cwd=WEB_DIR, shell=True, check=True)

    return len(completed_after), len(pending_after)


def main() -> None:
    parser = argparse.ArgumentParser(description="SiperLig Otomatik Kademeli Veri Toplayıcı")
    parser.add_argument("--status", action="store_true", help="İlerleme ve kalan kota durumunu göster")
    parser.add_argument("--batch-budget", type=int, default=10, help="Her partide en fazla kaç API isteği atılsın")
    parser.add_argument("--interval-seconds", type=int, default=180, help="--loop modunda partiler arası bekleme süresi (sn)")
    parser.add_argument("--loop", action="store_true", help="Bekleyen maçlar bitene veya kota dolana kadar arka planda çalıştır")
    parser.add_argument("--refresh-feeds", action="store_true", help="Güncel puan durumu, fikstür ve özet listesini de yenile")
    parser.add_argument("--build", action="store_true", help="Yeni veri indiğinde web/ npm run build çalıştır")
    parser.add_argument("--season", type=str, default=os.environ.get("SUPER_LIG_SEASON", "2026"))

    args = parser.parse_args()

    if args.status:
        client = HighlightlyClient(max_requests_per_run=0)
        completed, pending = list_harvest_progress()
        print(f"Tamamlanan Maç Detayı : {len(completed)} / {len(completed) + len(pending)}")
        print(f"Bekleyen Maç Detayı   : {len(pending)}")
        print(f"Kayıtlı API Anahtarı  : {len(client.keys)}")
        print(f"Bugün Kalan Kota      : {client.total_remaining_safe_quota()}")
        return

    if not args.loop:
        run_batch(
            batch_budget=args.batch_budget,
            refresh_feeds=args.refresh_feeds,
            run_build=args.build,
            season=args.season,
        )
        return

    print(f"[AutoHarvester] Sürekli kademeli toplama başlatıldı (parti={args.batch_budget} istek, aralık={args.interval_seconds} sn)...")
    while True:
        client_check = HighlightlyClient(max_requests_per_run=0)
        if client_check.total_remaining_safe_quota() <= 0:
            print("[AutoHarvester] Günlük güvenli kota tamamlandı; yarın devam etmek üzere duruluyor.")
            break

        _, pending_count = run_batch(
            batch_budget=args.batch_budget,
            refresh_feeds=args.refresh_feeds,
            run_build=args.build,
            season=args.season,
        )
        if pending_count == 0:
            print("[AutoHarvester] Tüm oynanmış Süper Lig maçlarının detayları başarıyla tamamlandı!")
            break

        print(f"[AutoHarvester] {args.interval_seconds} saniye bekleniyor (Durdurmak için Ctrl+C)...")
        time.sleep(args.interval_seconds)


if __name__ == "__main__":
    main()
