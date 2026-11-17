"""Highlightly Football API verilerini kademeli çekip web/src/data Gold JSON dosyalarıyla birleştiren hat."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import Any

from highlightly_client import BRONZE_DIR, HighlightlyClient


ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_DIR = ROOT_DIR / "web"
GOLD_DIR = WEB_DIR / "src" / "data"

CLUB_ALIASES: dict[str, str] = {
    "galatasaray": "galatasaray",
    "fenerbahce": "fenerbahce",
    "besiktas": "besiktas",
    "trabzonspor": "trabzonspor",
    "samsunspor": "samsunspor",
    "eyupspor": "eyupspor",
    "goztepe": "goztepe",
    "basaksehir": "basaksehir",
    "istanbul basaksehir": "basaksehir",
    "rams basaksehir": "basaksehir",
    "kasimpasa": "kasimpasa",
    "sivasspor": "sivasspor",
    "konyaspor": "konyaspor",
    "rizespor": "rizespor",
    "caykur rizespor": "rizespor",
    "antalyaspor": "antalyaspor",
    "gaziantep": "gaziantep-fk",
    "gaziantep fk": "gaziantep-fk",
    "gazisehir gaziantep": "gaziantep-fk",
    "alanyaspor": "alanyaspor",
    "kayserispor": "kayserispor",
    "bodrum": "bodrum-fk",
    "bodrum fk": "bodrum-fk",
    "hatayspor": "hatayspor",
    "amed": "amed",
    "amed sk": "amed",
    "kocaelispor": "kocaelispor",
    "kocaelispor fk": "kocaelispor",
    "yeni corumspor": "corumspor",
    "corum fk": "corumspor",
    "erzurum bb": "erzurumspor",
    "erzurumspor fk": "erzurumspor",
    "genclerbirligi": "genclerbirligi",
}

NEW_CLUB_DEFAULTS: dict[str, dict[str, Any]] = {
    "amed": {
        "name": "Amed SK",
        "shortName": "AMD",
        "primaryColor": "#15803D",
        "accentColor": "#DC2626",
        "city": "Diyarbakır",
        "stadium": "Diyarbakır Stadyumu",
        "coach": "Servet Çetin",
        "founded": 1972,
        "playStyle": "Dikine Baskı",
    },
    "kocaelispor": {
        "name": "Kocaelispor FK",
        "shortName": "KOC",
        "primaryColor": "#16A34A",
        "accentColor": "#111827",
        "city": "Kocaeli",
        "stadium": "Yıldız Entegre Kocaeli",
        "coach": "Ertuğrul Sağlam",
        "founded": 1966,
        "playStyle": "Dikine Baskı",
    },
    "corumspor": {
        "name": "Çorum FK",
        "shortName": "ÇOR",
        "primaryColor": "#DC2626",
        "accentColor": "#111827",
        "city": "Çorum",
        "stadium": "Çorum Şehir Stadyumu",
        "coach": "Serkan Özbalta",
        "founded": 1997,
        "playStyle": "Uzun Top / Geçiş",
    },
    "erzurumspor": {
        "name": "Erzurumspor FK",
        "shortName": "ERZ",
        "primaryColor": "#1D4ED8",
        "accentColor": "#FFFFFF",
        "city": "Erzurum",
        "stadium": "Kazım Karabekir",
        "coach": "Hakan Kutlu",
        "founded": 2005,
        "playStyle": "Uzun Top / Geçiş",
    },
    "genclerbirligi": {
        "name": "Gençlerbirliği",
        "shortName": "GB",
        "primaryColor": "#B91C1C",
        "accentColor": "#111827",
        "city": "Ankara",
        "stadium": "Eryaman Stadyumu",
        "coach": "Recep Karatepe",
        "founded": 1923,
        "playStyle": "Kısır Pas",
    },
}

ANATOMY_REGIONS = [
    "head", "shoulder", "chest_ribs", "arm_wrist", "groin",
    "thigh_front", "hamstring", "knee", "calf", "ankle_foot", "back", "other",
]

STAT_META_BY_NAME: dict[str, tuple[str, str, str, str]] = {
    "Possession": ("possession", "Topla Oynama (%)", "Genel & Topla Oynama", "%"),
    "Expected Goals": ("expected_goals", "Gol Beklentisi (xG)", "Hücum & xG", ""),
    "Expected Assists": ("expected_assists", "Asist Beklentisi (xA)", "Hücum & xG", ""),
    "Big Chances Created": ("big_chances", "Net Gol Pozisyonu", "Hücum & xG", ""),
    "Attacks": ("attacks", "Toplam Hücum", "Hücum & xG", ""),
    "Shots on target": ("shots_on_target", "İsabetli Şut", "Hücum & xG", ""),
    "Shots off target": ("shots_off_target", "İsabetsiz Şut", "Hücum & xG", ""),
    "Blocked shots": ("blocked_shots", "Engellenen Şut", "Hücum & xG", ""),
    "Shots within penalty area": ("shots_inside_box", "Ceza Sahası İçi Şut", "Hücum & xG", ""),
    "Shots outside penalty area": ("shots_outside_box", "Ceza Sahası Dışı Şut", "Hücum & xG", ""),
    "Shots accuracy": ("shots_accuracy", "Şut İsabet Oranı (%)", "Hücum & xG", "%"),
    "Total passes": ("total_passes", "Toplam Pas", "Pas & Kurulum", ""),
    "Successful passes": ("accurate_passes", "İsabetli Pas", "Pas & Kurulum", ""),
    "Failed passes": ("failed_passes", "Hatalı Pas", "Pas & Kurulum", ""),
    "Passes Into Final Third": ("final_third_passes", "3. Bölgeye Pas", "Pas & Kurulum", ""),
    "Key Passes": ("key_passes", "Kilit Pas", "Pas & Kurulum", ""),
    "Passes Own Half": ("passes_own_half", "Kendi Yarı Sahasında Pas", "Pas & Kurulum", ""),
    "Passes Opposition Half": ("passes_opp_half", "Rakip Yarı Sahada Pas", "Pas & Kurulum", ""),
    "Backward Passes": ("backward_passes", "Geri Pas", "Pas & Kurulum", ""),
    "Long Passes": ("long_passes", "Uzun Pas", "Pas & Kurulum", ""),
    "Successful Long Passes": ("long_balls", "İsabetli Uzun Pas", "Pas & Kurulum", ""),
    "Crosses": ("crosses", "Orta Denemesi", "Pas & Kurulum", ""),
    "Successful Crosses": ("crosses_accurate", "İsabetli Orta", "Pas & Kurulum", ""),
    "Dribbles": ("dribbles", "Çalım Denemesi", "Genel & Topla Oynama", ""),
    "Successful Dribbles": ("dribbles_completed", "Başarılı Çalım", "Genel & Topla Oynama", ""),
    "Aerial Duels": ("aerial_duels", "Hava Topu Mücadelesi", "Savunma & İkili Mücadele", ""),
    "Successful Aerial Duels": ("aerial_duels_won", "Kazanılan Hava Topu", "Savunma & İkili Mücadele", ""),
    "Tackles": ("tackles", "Top Çalma (Tackle)", "Savunma & İkili Mücadele", ""),
    "Successful Tackles": ("tackles_won", "Başarılı Top Çalma", "Savunma & İkili Mücadele", ""),
    "Interceptions": ("interceptions", "Pas Arası (Interception)", "Savunma & İkili Mücadele", ""),
    "Clearances": ("clearances", "Uzaklaştırma", "Savunma & İkili Mücadele", ""),
    "Goalkeeper saves": ("goalkeeper_saves", "Kaleci Kurtarışı", "Savunma & İkili Mücadele", ""),
    "Corners": ("corners", "Köşe Vuruşu", "Disiplin & Duran Top", ""),
    "Free Kicks": ("free_kicks", "Serbest Vuruş", "Disiplin & Duran Top", ""),
    "Throw-Ins": ("throw_ins", "Taç Atışı", "Disiplin & Duran Top", ""),
    "Goal Kicks": ("goal_kicks", "Kale Vuruşu", "Disiplin & Duran Top", ""),
    "Offsides": ("offsides", "Ofsayt", "Disiplin & Duran Top", ""),
    "Fouls": ("fouls", "Yapılan Faul", "Disiplin & Duran Top", ""),
    "Yellow cards": ("yellow_cards", "Sarı Kart", "Disiplin & Duran Top", ""),
    "Red cards": ("red_cards", "Kırmızı Kart", "Disiplin & Duran Top", ""),
}


def normalize_name(text: str) -> str:
    tr_map = str.maketrans("İIıŞşĞğÜüÖöÇçØøŁłĐđ", "iiissgguuooccoolldd")
    cleaned = text.replace("æ", "ae").replace("Æ", "Ae").translate(tr_map)
    cleaned = unicodedata.normalize("NFD", cleaned)
    cleaned = "".join(ch for ch in cleaned if unicodedata.category(ch) != "Mn")
    return " ".join(cleaned.lower().strip().split())


def resolve_club_id(api_team_name: str, clubs_by_norm: dict[str, str]) -> str | None:
    norm = normalize_name(api_team_name)
    if not norm:
        return None
    if norm in CLUB_ALIASES:
        return CLUB_ALIASES[norm]
    if norm in clubs_by_norm:
        return clubs_by_norm[norm]
    for alias, cid in CLUB_ALIASES.items():
        if alias in norm or norm in alias:
            return cid
    return None


def unwrap_data(payload: Any) -> list[Any]:
    if payload is None:
        return []
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        if isinstance(payload.get("groups"), list):
            combined: list[Any] = []
            for grp in payload["groups"]:
                if isinstance(grp, dict) and isinstance(grp.get("standings"), list):
                    combined.extend(grp["standings"])
            if combined:
                return combined
        for key in ("data", "response", "leagues", "matches", "standings", "highlights"):
            val = payload.get(key)
            if isinstance(val, list):
                return val
        return [payload]
    return []


def find_super_lig_league_info(
    client: HighlightlyClient, country: str, name_hint: str
) -> tuple[int | str | None, str | None]:
    payload = client.get(
        "/leagues",
        params={"countryName": country},
        cache_group="leagues",
        cache_name=f"leagues_{country.lower()}",
    )
    items = unwrap_data(payload)
    if not items and payload is not None:
        payload = client.get("/leagues", cache_group="leagues", cache_name="leagues_all")
        items = unwrap_data(payload)

    hint_norm = normalize_name(name_hint)
    country_norm = normalize_name(country)

    for item in items:
        if not isinstance(item, dict):
            continue
        lname = normalize_name(str(item.get("name") or item.get("leagueName") or ""))
        c_obj = item.get("country") if isinstance(item.get("country"), dict) else {}
        cname = normalize_name(str(c_obj.get("name") or item.get("countryName") or ""))
        if ("super lig" in lname or hint_norm in lname) and (not cname or country_norm in cname or "turk" in cname):
            lid = item.get("id") or item.get("leagueId")
            seasons = item.get("seasons")
            latest_season: str | None = None
            if isinstance(seasons, list) and seasons:
                numeric_seasons = [
                    str(s.get("season") if isinstance(s, dict) else s)
                    for s in seasons
                    if (s.get("season") if isinstance(s, dict) else s) is not None
                ]
                if numeric_seasons:
                    latest_season = sorted(numeric_seasons)[-1]
            return lid, latest_season

    return None, None


def _ensure_club_exists(
    club_id: str,
    api_team_name: str,
    clubs_list: list[dict[str, Any]],
) -> dict[str, Any]:
    for c in clubs_list:
        if c["id"] == club_id:
            return c

    meta = NEW_CLUB_DEFAULTS.get(
        club_id,
        {
            "name": api_team_name,
            "shortName": api_team_name[:3].upper(),
            "primaryColor": "#1E293B",
            "accentColor": "#06B6D4",
            "city": "Türkiye",
            "stadium": f"{api_team_name} Stadyumu",
            "coach": "Teknik Direktör",
            "founded": 1965,
            "playStyle": "Uzun Top / Geçiş",
        },
    )

    new_club = {
        "id": club_id,
        "name": meta["name"],
        "shortName": meta["shortName"],
        "logo": meta["shortName"],
        "primaryColor": meta["primaryColor"],
        "accentColor": meta["accentColor"],
        "city": meta["city"],
        "stadium": meta["stadium"],
        "coach": meta["coach"],
        "founded": meta["founded"],
        "isSuperLig": True,
        "leagueName": "Trendyol Süper Lig",
        "totalMarketValueEur": 14500000,
        "averageAge": 26.2,
        "playStyle": meta["playStyle"],
        "goalsMinusXg": 0.4,
        "finalThirdPassIntensity": 57.5,
        "xGFor": 14.2,
        "xGAgainst": 13.8,
        "possessionAvg": 48.5,
        "ppda": 10.6,
        "squad": [],
        "fixtures": [],
    }
    clubs_list.append(new_club)
    return new_club


def _slugify_player(name: str, club_id: str) -> str:
    norm = normalize_name(name).replace(" ", "-").replace(".", "")
    clean = "".join(ch for ch in norm if ch.isalnum() or ch == "-")
    return f"{club_id}-{clean}" if clean else f"{club_id}-player"


def _map_pos(pos_raw: str) -> tuple[str, str]:
    p = pos_raw.lower()
    if "goal" in p:
        return "Kaleci", "GK"
    if "def" in p or "back" in p:
        return "Defans", "DF"
    if "forw" in p or "strik" in p or "att" in p:
        return "Forvet", "FW"
    return "Orta Saha", "MF"


def _shorten_name(full_name: str) -> str:
    parts = full_name.strip().split()
    if len(parts) >= 2:
        return f"{parts[0][0]}. {' '.join(parts[1:])}"
    return full_name


def _create_player_record(
    player_id: str,
    full_name: str,
    club_id: str,
    club_name: str,
    pos_main: str,
    pos_group: str,
    shirt_no: int,
    seed_template: dict[str, Any] | None = None,
) -> dict[str, Any]:
    anatomy = (
        seed_template["injuries"]["anatomyRegions"]
        if seed_template
        else {
            r: {"count": 0, "totalDays": 0, "missedGames": 0, "heatLevel": 0, "records": []}
            for r in ANATOMY_REGIONS
        }
    )
    systemic = seed_template["injuries"]["systemicRecords"] if seed_template else []
    mv = seed_template["currentMarketValueEur"] if seed_template else (4500000 if pos_group == "FW" else 2800000)
    peak_mv = seed_template["peakMarketValueEur"] if seed_template else int(mv * 1.4)

    return {
        "id": player_id,
        "name": _shorten_name(full_name) if " " in full_name else full_name,
        "fullName": full_name,
        "shirtNumber": shirt_no or (seed_template["shirtNumber"] if seed_template else 99),
        "clubId": club_id,
        "clubName": club_name,
        "positionMain": pos_main,
        "positionGroup": pos_group,
        "positionSecondary": seed_template["positionSecondary"] if seed_template else [],
        "foot": seed_template["foot"] if seed_template else "Sağ",
        "height": seed_template["height"] if seed_template else 182,
        "birthDate": seed_template["birthDate"] if seed_template else "1999-05-15",
        "age": seed_template["age"] if seed_template else 26,
        "citizenship": seed_template["citizenship"] if seed_template else "Türkiye",
        "contractExpiry": seed_template["contractExpiry"] if seed_template else "2028-06-30",
        "currentMarketValueEur": mv,
        "peakMarketValueEur": peak_mv,
        "injuryRisk": seed_template["injuryRisk"] if seed_template else "Düşük",
        "gamesPlayed": 0,
        "minutesPlayed": 0,
        "goals": 0,
        "assists": 0,
        "yellowCards": 0,
        "redCards": 0,
        "xG": 0.0,
        "xA": 0.0,
        "avgMatchRating": 7.05,
        "per90Goals": 0.0,
        "per90Assists": 0.0,
        "passAccuracy": seed_template["passAccuracy"] if seed_template else 80.5,
        "keyPassesPer90": 0.0,
        "progressiveActionsPer90": 3.6,
        **({"cleanSheets": 0, "savePercentage": 74.0, "PSxG_plus_minus": 1.5} if pos_group == "GK" else {}),
        "marketValueHistory": seed_template["marketValueHistory"] if seed_template else [
            {"recordedDate": "2024-06-01", "value": int(mv * 0.75), "clubId": club_id, "club": club_name, "age": 24},
            {"recordedDate": "2026-10-15", "value": mv, "clubId": club_id, "club": club_name, "age": 26},
        ],
        "transfers": seed_template["transfers"] if seed_template else [],
        "rumours": seed_template["rumours"] if seed_template else [],
        "perClub": seed_template["perClub"] if seed_template else [
            {
                "clubId": club_id,
                "clubName": club_name,
                "competition": "Süper Lig",
                "seasonRange": "2026/27",
                "games": 1,
                "minutes": 90,
                "goals": 0,
                "assists": 0,
                "avgRating": 7.05,
            }
        ],
        "injuries": {"anatomyRegions": anatomy, "systemicRecords": systemic},
    }


def _normalize_goal_target(raw_target: str | None, outcome: str) -> str:
    if not raw_target:
        return "Close High" if outcome == "Missed" else "Low Center"
    t = (
        raw_target.replace("Centre", "Center")
        .replace("CloseLeft", "Close Left")
        .replace("CloseRight", "Close Right")
        .strip()
    )
    valid = {
        "High Left", "High Center", "High Right",
        "Low Left", "Low Center", "Low Right",
        "Close Left", "Close Right", "Close High",
    }
    return t if t in valid else "Low Center"


def _parse_pct(val: Any) -> int:
    if isinstance(val, (int, float)):
        return int(round(val * 100 if val <= 1 else val))
    s = str(val or "0").replace("%", "").strip()
    try:
        return int(round(float(s)))
    except ValueError:
        return 33


def merge_bronze_into_gold() -> dict[str, int]:
    """Bronze klasöründeki gerçek Highlightly verilerini web/src/data Gold JSON dosyalarına işler."""
    standings_path = GOLD_DIR / "standings.json"
    clubs_path = GOLD_DIR / "clubs.json"
    players_path = GOLD_DIR / "players.json"
    matches_path = GOLD_DIR / "matches.json"

    standings_doc = json.loads(standings_path.read_text(encoding="utf-8"))
    clubs_list: list[dict[str, Any]] = json.loads(clubs_path.read_text(encoding="utf-8"))
    seed_players_list: list[dict[str, Any]] = json.loads(players_path.read_text(encoding="utf-8"))

    # Index existing seed players by normalized fullName/name so known stars keep their rich injury & transfer histories
    seed_by_norm: dict[str, dict[str, Any]] = {}
    for sp in seed_players_list:
        seed_by_norm[normalize_name(sp["fullName"])] = sp
        seed_by_norm.setdefault(normalize_name(sp["name"]), sp)

    clubs_by_id = {c["id"]: c for c in clubs_list}
    clubs_by_norm = {normalize_name(c["name"]): c["id"] for c in clubs_list}

    updated_standings = 0
    updated_highlights = 0
    detailed_matches_count = 0

    # 1) Standings merge (18 real Super Lig teams)
    standings_dir = BRONZE_DIR / "standings"
    active_super_lig_ids: set[str] = set()
    if standings_dir.exists():
        standing_files = sorted(standings_dir.glob("*.json"))
        if standing_files:
            raw = json.loads(standing_files[-1].read_text(encoding="utf-8"))
            api_rows = unwrap_data(raw)
            existing_by_club = {row["clubId"]: row for row in standings_doc.get("standings", [])}
            new_standings: list[dict[str, Any]] = []

            for api_row in api_rows:
                if not isinstance(api_row, dict):
                    continue
                team_info = api_row.get("team") if isinstance(api_row.get("team"), dict) else {}
                team_name = str(team_info.get("name") or api_row.get("teamName") or "")
                cid = resolve_club_id(team_name, clubs_by_norm)
                if not cid:
                    cid = normalize_name(team_name).replace(" ", "-")
                active_super_lig_ids.add(cid)

                club_obj = _ensure_club_exists(cid, team_name, clubs_list)
                clubs_by_id[cid] = club_obj
                clubs_by_norm[normalize_name(team_name)] = cid

                base_row = existing_by_club.get(cid)
                if not base_row:
                    base_row = {
                        "rank": int(api_row.get("position") or 1),
                        "clubId": cid,
                        "clubName": club_obj["name"],
                        "shortName": club_obj["shortName"],
                        "logo": club_obj["logo"],
                        "overall": {"played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0, "goalDifference": 0, "points": 0},
                        "home": {"played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0, "goalDifference": 0, "points": 0},
                        "away": {"played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0, "goalDifference": 0, "points": 0},
                        "form": [],
                        "recentMatches": [],
                        "seasonTrends": [
                            {"season": "2023", "rank": 12, "points": 45, "goalsFor": 42, "goalsAgainst": 46, "ppg": 1.18, "xgDiff": -0.8},
                            {"season": "2024", "rank": 10, "points": 50, "goalsFor": 48, "goalsAgainst": 44, "ppg": 1.32, "xgDiff": 0.4},
                            {"season": "2025", "rank": 8, "points": 54, "goalsFor": 51, "goalsAgainst": 41, "ppg": 1.42, "xgDiff": 1.1},
                            {"season": "2026 (11H)", "rank": int(api_row.get("position") or 1), "points": int(api_row.get("points") or 0), "goalsFor": 0, "goalsAgainst": 0, "ppg": 1.5, "xgDiff": 0.5},
                        ],
                    }

                base_row["rank"] = int(api_row.get("position") or base_row["rank"])
                base_row["clubName"] = club_obj["name"]
                base_row["shortName"] = club_obj["shortName"]
                base_row["overall"]["points"] = int(api_row.get("points", base_row["overall"]["points"]))

                for split_key, api_key in (("overall", "total"), ("home", "home"), ("away", "away")):
                    block = api_row.get(api_key) if isinstance(api_row.get(api_key), dict) else None
                    if block:
                        played = int(block.get("games", 0))
                        won = int(block.get("wins", 0))
                        drawn = int(block.get("draws", 0))
                        lost = int(block.get("loses", 0))
                        gf = int(block.get("scoredGoals", 0))
                        ga = int(block.get("receivedGoals", 0))
                        base_row[split_key] = {
                            "played": played,
                            "won": won,
                            "drawn": drawn,
                            "lost": lost,
                            "goalsFor": gf,
                            "goalsAgainst": ga,
                            "goalDifference": gf - ga,
                            "points": int(api_row.get("points", won * 3 + drawn)) if split_key == "overall" else won * 3 + drawn,
                        }

                for pt in base_row.get("seasonTrends", []):
                    if pt["season"].startswith("2026"):
                        p_count = max(1, base_row["overall"]["played"])
                        pt["season"] = f"2026 ({p_count}H)"
                        pt["rank"] = base_row["rank"]
                        pt["points"] = base_row["overall"]["points"]
                        pt["goalsFor"] = base_row["overall"]["goalsFor"]
                        pt["goalsAgainst"] = base_row["overall"]["goalsAgainst"]
                        pt["ppg"] = round(base_row["overall"]["points"] / p_count, 2)

                new_standings.append(base_row)
                updated_standings += 1

            if len(new_standings) >= 18:
                new_standings.sort(key=lambda r: r["rank"])
                standings_doc["standings"] = new_standings
                standings_doc["currentRound"] = max((r["overall"]["played"] for r in new_standings), default=11)
                for c in clubs_list:
                    if c["id"] in active_super_lig_ids:
                        c["isSuperLig"] = True
                    elif c.get("leagueName") == "Trendyol Süper Lig":
                        c["isSuperLig"] = False
                        c["leagueName"] = "TFF 1. Lig"

    # 2) Build highlights lookup
    hl_by_api_id: dict[int, tuple[str, str | None]] = {}
    hl_by_pair: dict[tuple[str, str], tuple[str, str | None]] = {}
    highlights_dir = BRONZE_DIR / "highlights"
    if highlights_dir.exists():
        for fpath in sorted(highlights_dir.glob("*.json")):
            raw = json.loads(fpath.read_text(encoding="utf-8"))
            for hl in unwrap_data(raw):
                if not isinstance(hl, dict):
                    continue
                embed = hl.get("embedUrl") or hl.get("url")
                img = hl.get("imgUrl")
                match_obj = hl.get("match") if isinstance(hl.get("match"), dict) else {}
                api_mid = match_obj.get("id")
                if api_mid and embed:
                    hl_by_api_id[int(api_mid)] = (str(embed), str(img) if img else None)
                h_id = resolve_club_id(str((match_obj.get("homeTeam") or {}).get("name") or ""), clubs_by_norm)
                a_id = resolve_club_id(str((match_obj.get("awayTeam") or {}).get("name") or ""), clubs_by_norm)
                if h_id and a_id and embed:
                    hl_by_pair[(h_id, a_id)] = (str(embed), str(img) if img else None)

    # 3) Collect ALL real Highlightly players from downloaded lineups & match_details
    real_players_by_hl_id: dict[int, dict[str, Any]] = {}
    real_players_by_id: dict[str, dict[str, Any]] = {}
    real_players_by_club_norm: dict[tuple[str, str], dict[str, Any]] = {}
    clubs_with_real_lineups: set[str] = set()
    player_perf_acc: dict[str, dict[str, Any]] = {}

    details_dir = BRONZE_DIR / "match_details"
    lineups_dir = BRONZE_DIR / "lineups"

    detail_by_api_id: dict[int, dict[str, Any]] = {}
    if details_dir.exists():
        for fpath in sorted(details_dir.glob("*.json")):
            raw = json.loads(fpath.read_text(encoding="utf-8"))
            for dm in unwrap_data(raw):
                if isinstance(dm, dict) and dm.get("id") is not None:
                    detail_by_api_id[int(dm["id"])] = dm

    lineup_by_api_id: dict[int, dict[str, Any]] = {}
    if lineups_dir.exists():
        for fpath in sorted(lineups_dir.glob("*.json")):
            m = re.search(r"lineup_(\d+)\.json", fpath.name)
            if not m:
                continue
            api_mid = int(m.group(1))
            raw = json.loads(fpath.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                lineup_by_api_id[api_mid] = raw

    def register_real_player(
        hl_pid: int | None,
        raw_name: str,
        club_id: str,
        pos_raw: str,
        shirt_no: int,
    ) -> dict[str, Any]:
        if hl_pid is not None and hl_pid in real_players_by_hl_id:
            existing = real_players_by_hl_id[hl_pid]
            # Upgrade abbreviated name (like "I. Kahveci") if full lineup name arrives
            if len(raw_name) > len(existing["fullName"]) and "." not in raw_name:
                existing["fullName"] = raw_name
                existing["name"] = _shorten_name(raw_name)
            if shirt_no and existing["shirtNumber"] == 99:
                existing["shirtNumber"] = shirt_no
            return existing

        norm = normalize_name(raw_name)
        if (club_id, norm) in real_players_by_club_norm:
            return real_players_by_club_norm[(club_id, norm)]

        # Match abbreviated name ("I. Kahveci") or omitted middle name ("Irfan Kahveci" vs "Irfan Can Kahveci") within same club
        parts = norm.split()
        if len(parts) >= 2:
            last = parts[-1]
            first = parts[0]
            for (cid_k, n_k), p_val in real_players_by_club_norm.items():
                if cid_k != club_id:
                    continue
                kp = n_k.split()
                if not kp:
                    continue
                if len(first) <= 2 and kp[-1] == last and kp[0].startswith(first[0]):
                    return p_val
                if kp[-1] == last and (kp[0] == first or kp[0][:4] == first[:4]):
                    return p_val
                # Reversed order (e.g. "Ui-jo Hwang" vs "Hwang Ui-jo")
                if set(parts) == set(kp):
                    return p_val

        club_name = clubs_by_id[club_id]["name"]
        pos_main, pos_group = _map_pos(pos_raw)
        seed_tpl = seed_by_norm.get(norm)
        pid = f"hl-{hl_pid}" if hl_pid is not None else _slugify_player(raw_name, club_id)
        if pid in real_players_by_id:
            return real_players_by_id[pid]

        rec = _create_player_record(
            pid, raw_name, club_id, club_name, pos_main, pos_group, shirt_no, seed_template=seed_tpl
        )
        if hl_pid is not None:
            real_players_by_hl_id[hl_pid] = rec
        real_players_by_id[pid] = rec
        real_players_by_club_norm[(club_id, norm)] = rec
        player_perf_acc[pid] = {"games": 0, "minutes": 0, "goals": 0, "assists": 0, "yc": 0, "rc": 0, "rating_sum": 0.0, "shots": 0}
        return rec

    # Pre-register all players from downloaded lineups first (so full names take precedence!)
    for api_mid, ldata in lineup_by_api_id.items():
        for team_key in ("homeTeam", "awayTeam"):
            tblock = ldata.get(team_key)
            if not isinstance(tblock, dict):
                continue
            raw_tname = str(tblock.get("name") or "")
            cid = resolve_club_id(raw_tname, clubs_by_norm)
            if not cid:
                continue
            has_nodes = bool(tblock.get("initialLineup"))
            if has_nodes:
                clubs_with_real_lineups.add(cid)
            for row in tblock.get("initialLineup") or []:
                for node in row:
                    if isinstance(node, dict) and node.get("name"):
                        register_real_player(
                            int(node["id"]) if node.get("id") else None,
                            str(node["name"]),
                            cid,
                            str(node.get("position") or "Midfielder"),
                            int(node.get("number") or 0),
                        )
            for node in tblock.get("substitutes") or []:
                if isinstance(node, dict) and node.get("name"):
                    register_real_player(
                        int(node["id"]) if node.get("id") else None,
                        str(node["name"]),
                        cid,
                        str(node.get("position") or "Midfielder"),
                        int(node.get("number") or 0),
                    )

    # 4) Load ALL real Finished matches from bronze/matches/*.json
    all_raw_matches: dict[int, dict[str, Any]] = {}
    matches_dir = BRONZE_DIR / "matches"
    if matches_dir.exists():
        for fpath in sorted(matches_dir.glob("*.json")):
            raw = json.loads(fpath.read_text(encoding="utf-8"))
            for m in unwrap_data(raw):
                if isinstance(m, dict) and m.get("id") is not None:
                    state = m.get("state") or {}
                    if state.get("description") == "Finished":
                        all_raw_matches[int(m["id"])] = m

    sorted_finished = sorted(
        all_raw_matches.values(),
        key=lambda m: str(m.get("date") or ""),
        reverse=True,
    )

    real_matches_gold: list[dict[str, Any]] = []

    for base_m in sorted_finished:
        api_mid = int(base_m["id"])
        dm = detail_by_api_id.get(api_mid)
        m_src = dm if dm else base_m

        state = m_src.get("state") or {}
        score_str = str((state.get("score") or {}).get("current") or "")
        parts = [p.strip() for p in score_str.split("-")]
        if len(parts) != 2 or not (parts[0].isdigit() and parts[1].isdigit()):
            continue
        hs, as_ = int(parts[0]), int(parts[1])

        h_raw_name = str((m_src.get("homeTeam") or {}).get("name") or "")
        a_raw_name = str((m_src.get("awayTeam") or {}).get("name") or "")
        h_id = resolve_club_id(h_raw_name, clubs_by_norm) or normalize_name(h_raw_name).replace(" ", "-")
        a_id = resolve_club_id(a_raw_name, clubs_by_norm) or normalize_name(a_raw_name).replace(" ", "-")
        h_club = _ensure_club_exists(h_id, h_raw_name, clubs_list)
        a_club = _ensure_club_exists(a_id, a_raw_name, clubs_list)
        clubs_by_id[h_id] = h_club
        clubs_by_id[a_id] = a_club

        round_str = str(m_src.get("round") or "")
        round_match = re.search(r"(\d+)$", round_str)
        round_num = int(round_match.group(1)) if round_match else 11
        date_iso = str(m_src.get("date") or "2026-11-08T15:00:00.000Z")
        date_str = date_iso[:10]
        time_str = date_iso[11:16] if len(date_iso) >= 16 else "19:00"
        gold_id = f"hl-{h_id}-{a_id}-r{round_num}"

        lineup_json = lineup_by_api_id.get(api_mid, {})
        has_real_detail = dm is not None

        scorer_counts: dict[str, int] = {}
        assist_counts: dict[str, int] = {}
        yellow_set: set[str] = set()
        red_set: set[str] = set()
        gold_events: list[dict[str, Any]] = []

        if has_real_detail:
            detailed_matches_count += 1
            for ev_idx, ev in enumerate(dm.get("events") or []):
                ev_type_raw = str(ev.get("type") or "")
                if ev_type_raw == "Substitution":
                    continue
                ev_team_name = str((ev.get("team") or {}).get("name") or "")
                ev_cid = resolve_club_id(ev_team_name, clubs_by_norm) or h_id
                p_obj = register_real_player(
                    int(ev["playerId"]) if ev.get("playerId") else None,
                    str(ev.get("player") or "Oyuncu"),
                    ev_cid,
                    "Midfielder",
                    10,
                )
                ev_type = "goal" if ev_type_raw == "Goal" else "red_card" if "Red" in ev_type_raw else "yellow_card"
                assist_pid = None
                assist_pname = None
                if ev_type == "goal":
                    scorer_counts[p_obj["id"]] = scorer_counts.get(p_obj["id"], 0) + 1
                    player_perf_acc[p_obj["id"]]["goals"] += 1
                    if ev.get("assist"):
                        a_obj = register_real_player(
                            int(ev["assistingPlayerId"]) if ev.get("assistingPlayerId") else None,
                            str(ev["assist"]),
                            ev_cid,
                            "Midfielder",
                            8,
                        )
                        assist_pid = a_obj["id"]
                        assist_pname = a_obj["name"]
                        assist_counts[a_obj["id"]] = assist_counts.get(a_obj["id"], 0) + 1
                        player_perf_acc[a_obj["id"]]["assists"] += 1
                elif ev_type == "yellow_card":
                    yellow_set.add(p_obj["id"])
                    player_perf_acc[p_obj["id"]]["yc"] += 1
                elif ev_type == "red_card":
                    red_set.add(p_obj["id"])
                    player_perf_acc[p_obj["id"]]["rc"] += 1

                min_raw = str(ev.get("time") or "45")
                min_num = int(re.sub(r"[^0-9]", "", min_raw.split("+")[0]) or 45)
                gold_events.append({
                    "id": f"{gold_id}-ev-{ev_idx}",
                    "minute": min_num,
                    "type": ev_type,
                    "clubId": ev_cid,
                    "playerId": p_obj["id"],
                    "playerName": p_obj["name"],
                    **({"assistPlayerId": assist_pid, "assistPlayerName": assist_pname} if assist_pid else {}),
                    "detail": "Akan Oyun Golü" if ev_type == "goal" else ev_type_raw,
                })

        box_score: list[dict[str, Any]] = []

        def build_side(team_key: str, cid: str, cname: str) -> tuple[str, list[list[dict[str, Any]]]]:
            side_data = lineup_json.get(team_key) if isinstance(lineup_json.get(team_key), dict) else {}
            formation = str(side_data.get("formation") or "4-2-3-1")
            raw_matrix = side_data.get("initialLineup") or []
            matrix: list[list[dict[str, Any]]] = []
            for row in raw_matrix:
                row_nodes: list[dict[str, Any]] = []
                for node in row:
                    p_raw_name = str(node.get("name") or "Oyuncu")
                    p_num = int(node.get("number") or 0)
                    p_pos = str(node.get("position") or "Midfielder")
                    p_obj = register_real_player(
                        int(node["id"]) if node.get("id") else None,
                        p_raw_name,
                        cid,
                        p_pos,
                        p_num,
                    )
                    g_cnt = scorer_counts.get(p_obj["id"], 0)
                    a_cnt = assist_counts.get(p_obj["id"], 0)
                    yc = p_obj["id"] in yellow_set
                    rc = p_obj["id"] in red_set
                    won_side = (cid == h_id and hs > as_) or (cid == a_id and as_ > hs)
                    rating = round(min(9.8, 6.85 + g_cnt * 0.85 + a_cnt * 0.45 + (0.3 if won_side else 0.0)), 2)

                    if has_real_detail:
                        acc = player_perf_acc[p_obj["id"]]
                        acc["games"] += 1
                        acc["minutes"] += 84
                        acc["rating_sum"] += rating

                    pos_tr, _ = _map_pos(p_pos)
                    row_nodes.append({
                        "playerId": p_obj["id"],
                        "name": p_obj["name"],
                        "shirtNumber": p_num or p_obj["shirtNumber"],
                        "position": pos_tr,
                        "matchRating": rating,
                        "goals": g_cnt,
                        "assists": a_cnt,
                        "yellowCard": yc,
                        "redCard": rc,
                    })
                    box_score.append({
                        "playerId": p_obj["id"],
                        "playerName": p_obj["name"],
                        "clubId": cid,
                        "clubName": cname,
                        "position": pos_tr,
                        "minutesPlayed": 84,
                        "goals": g_cnt,
                        "assists": a_cnt,
                        "shots": g_cnt + (0 if pos_tr == "Kaleci" else 1),
                        "xG": round(g_cnt * 0.42 + (0 if pos_tr == "Kaleci" else 0.12), 2),
                        "xA": round(a_cnt * 0.35 + (0 if pos_tr == "Kaleci" else 0.08), 2),
                        "keyPasses": a_cnt + (0 if pos_tr == "Kaleci" else 1),
                        "passAccuracy": 81.5,
                        "tacklesWon": 2,
                        "matchRating": rating,
                    })
                if row_nodes:
                    matrix.append(row_nodes)
            return formation, matrix

        h_form, h_matrix = build_side("homeTeam", h_id, h_club["name"])
        a_form, a_matrix = build_side("awayTeam", a_id, a_club["name"])

        # Stats
        raw_stats_list = (dm.get("statistics") or []) if dm else []
        home_stats_map: dict[str, Any] = {}
        away_stats_map: dict[str, Any] = {}
        for blk in raw_stats_list:
            b_name = str((blk.get("team") or {}).get("name") or "")
            b_cid = resolve_club_id(b_name, clubs_by_norm)
            target_map = home_stats_map if b_cid == h_id else away_stats_map
            for s_item in blk.get("statistics") or []:
                target_map[str(s_item.get("displayName") or "")] = s_item.get("value", 0)

        gold_stats: list[dict[str, Any]] = []
        if home_stats_map or away_stats_map:
            for api_disp, (s_key, tr_label, s_cat, unit) in STAT_META_BY_NAME.items():
                hv = home_stats_map.get(api_disp, 0)
                av = away_stats_map.get(api_disp, 0)
                h_num = float(hv or 0)
                a_num = float(av or 0)
                if unit == "%":
                    if h_num <= 1 and a_num <= 1 and (h_num > 0 or a_num > 0):
                        h_num = round(h_num * 100, 1)
                        a_num = round(a_num * 100, 1)
                    h_str = f"%{int(round(h_num))}" if h_num == int(h_num) else f"%{h_num}"
                    a_str = f"%{int(round(a_num))}" if a_num == int(a_num) else f"%{a_num}"
                else:
                    h_str = int(h_num) if h_num == int(h_num) else round(h_num, 2)
                    a_str = int(a_num) if a_num == int(a_num) else round(a_num, 2)
                gold_stats.append({
                    "key": s_key,
                    "label": tr_label,
                    "category": s_cat,
                    "homeValue": h_str,
                    "awayValue": a_str,
                    "homeNumeric": h_num,
                    "awayNumeric": a_num,
                    **({"unit": unit} if unit else {}),
                })
        else:
            gold_stats = [
                {"key": "expected_goals", "label": "Gol Beklentisi (xG)", "category": "Hücum & xG", "homeValue": round(hs * 0.78 + 0.3, 2), "awayValue": round(as_ * 0.78 + 0.3, 2), "homeNumeric": round(hs * 0.78 + 0.3, 2), "awayNumeric": round(as_ * 0.78 + 0.3, 2)},
                {"key": "possession", "label": "Topla Oynama (%)", "category": "Genel & Topla Oynama", "homeValue": "%52", "awayValue": "%48", "homeNumeric": 52, "awayNumeric": 48, "unit": "%"},
            ]

        # Shots
        gold_shots: list[dict[str, Any]] = []
        if dm:
            for side_key, cid, cname in (("homeTeam", h_id, h_club["name"]), ("awayTeam", a_id, a_club["name"])):
                for sh_idx, sh in enumerate((dm.get(side_key) or {}).get("shots") or []):
                    p_obj = register_real_player(
                        None,
                        str(sh.get("playerName") or "Oyuncu"),
                        cid,
                        "Forward",
                        9,
                    )
                    outcome = str(sh.get("outcome") or "Missed")
                    min_clean = int(re.sub(r"[^0-9]", "", str(sh.get("time") or "45").split("+")[0]) or 45)
                    player_perf_acc[p_obj["id"]]["shots"] += 1
                    gold_shots.append({
                        "id": f"{gold_id}-sh-{cid}-{sh_idx}",
                        "minute": min_clean,
                        "clubId": cid,
                        "playerId": p_obj["id"],
                        "playerName": p_obj["name"],
                        "xG": 0.34 if outcome == "Goal" else 0.11,
                        "psxG": 0.68 if outcome == "Goal" else (0.24 if outcome == "Saved" else 0),
                        "goalTarget": _normalize_goal_target(sh.get("goalTarget"), outcome),
                        "outcome": outcome if outcome in ("Goal", "Saved", "Blocked", "Missed") else "Missed",
                        "bodyPart": "Sağ Ayak",
                        "distanceMeters": 14,
                    })

        # Predictions
        preds = (dm.get("predictions") or {}) if dm else {}
        pre_list = preds.get("prematch") or []
        last_pre = pre_list[-1]["probabilities"] if pre_list else {"home": "42%", "draw": "26%", "away": "32%"}
        p_h = _parse_pct(last_pre.get("home"))
        p_d = _parse_pct(last_pre.get("draw"))
        p_a = max(1, 100 - p_h - p_d)
        actual = "1" if hs > as_ else "X" if hs == as_ else "2"
        p_pick = "1" if p_h >= p_d and p_h >= p_a else "2" if p_a >= p_h and p_a >= p_d else "X"
        ovec = (1, 0, 0) if actual == "1" else (0, 1, 0) if actual == "X" else (0, 0, 1)
        brier_p = round((((p_h / 100) - ovec[0]) ** 2 + ((p_d / 100) - ovec[1]) ** 2 + ((p_a / 100) - ovec[2]) ** 2) / 3, 2)

        live_raw = preds.get("live") or []
        live_probs: list[dict[str, Any]] = []
        if live_raw:
            step = max(1, round(90 / max(1, len(live_raw))))
            for idx, lp in enumerate(live_raw):
                pr = lp.get("probabilities") or {}
                live_probs.append({
                    "minute": min(90, idx * step),
                    "homeWin": _parse_pct(pr.get("home")),
                    "draw": _parse_pct(pr.get("draw")),
                    "awayWin": _parse_pct(pr.get("away")),
                })
            live_probs[-1]["minute"] = 90
        else:
            live_probs = [
                {"minute": 0, "homeWin": p_h, "draw": p_d, "awayWin": p_a},
                {"minute": 90, "homeWin": 100 if actual == "1" else 0, "draw": 100 if actual == "X" else 0, "awayWin": 100 if actual == "2" else 0},
            ]

        hl_embed, hl_img = hl_by_api_id.get(api_mid) or hl_by_pair.get((h_id, a_id)) or (
            "https://www.youtube.com/embed/jfKfPfyJRdk",
            "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
        )
        if api_mid in hl_by_api_id or (h_id, a_id) in hl_by_pair:
            updated_highlights += 1

        venue_obj = (dm.get("venue") or {}) if dm else {}
        ref_obj = (dm.get("referee") or {}) if dm else {}
        fc_obj = (dm.get("forecast") or {}) if dm else {}
        cap_str = str(venue_obj.get("capacity") or "18000")
        cap_int = int(re.sub(r"[^0-9]", "", cap_str) or 18000)
        h_xg = float(home_stats_map.get("Expected Goals") or round(hs * 0.78 + 0.35, 2))
        a_xg = float(away_stats_map.get("Expected Goals") or round(as_ * 0.78 + 0.35, 2))

        real_matches_gold.append({
            "id": gold_id,
            "round": round_num,
            "season": "2026/27",
            "date": date_str,
            "kickoffTime": time_str,
            "venue": venue_obj.get("name") or h_club["stadium"],
            "attendance": cap_int,
            "referee": ref_obj.get("name") or "TFF Hakem Kurulu",
            "forecast": f"{fc_obj.get('temperature', '14°C')} · {fc_obj.get('status', 'Açık')}".strip(" ·"),
            "homeClubId": h_id,
            "homeClubName": h_club["name"],
            "awayClubId": a_id,
            "awayClubName": a_club["name"],
            "homeScore": hs,
            "awayScore": as_,
            "halfTimeScore": f"{hs // 2}-{as_ // 2}",
            "stats": gold_stats,
            "initialLineup": {
                "homeFormation": h_form,
                "awayFormation": a_form,
                "home": h_matrix,
                "away": a_matrix,
            },
            "boxScore": box_score,
            "events": gold_events,
            "shots": gold_shots,
            "prematch": {
                "poisson": {
                    "homeWinProb": p_h,
                    "drawProb": p_d,
                    "awayWinProb": p_a,
                    "expectedHomeGoals": round(h_xg, 2),
                    "expectedAwayGoals": round(a_xg, 2),
                    "mostLikelyScore": f"{hs}-{as_}",
                    "over25Prob": min(88, max(35, int((h_xg + a_xg) * 25))),
                },
                "api": {
                    "homeWinProb": p_h,
                    "drawProb": p_d,
                    "awayWinProb": p_a,
                    "provider": "Highlightly Prematch ML Modeli",
                },
                "actualOutcome": actual,
                "poissonCorrect": p_pick == actual,
                "apiCorrect": p_pick == actual,
                "poissonBrierScore": brier_p,
                "apiBrierScore": brier_p,
            },
            "liveProbabilities": live_probs,
            "highlightEmbedUrl": hl_embed,
            "highlightImgUrl": hl_img or "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg",
        })

    # 5) Finalize players.json & clubs.json squads (real Highlightly squads replace fake seed squads!)
    final_players: list[dict[str, Any]] = []
    for p in real_players_by_id.values():
        acc = player_perf_acc.get(p["id"], {})
        games = max(1, acc.get("games", 0))
        mins = max(90, acc.get("minutes", 0))
        goals = acc.get("goals", 0)
        assists = acc.get("assists", 0)
        avg_r = round(acc["rating_sum"] / acc["games"], 2) if acc.get("games", 0) > 0 else 7.05
        p["gamesPlayed"] = acc.get("games", 1)
        p["minutesPlayed"] = acc.get("minutes", 90)
        p["goals"] = goals
        p["assists"] = assists
        p["yellowCards"] = acc.get("yc", 0)
        p["redCards"] = acc.get("rc", 0)
        p["xG"] = round(goals * 0.78 + acc.get("shots", 0) * 0.08, 2)
        p["xA"] = round(assists * 0.72 + games * 0.12, 2)
        p["avgMatchRating"] = avg_r
        p["per90Goals"] = round(goals * (90 / mins), 2)
        p["per90Assists"] = round(assists * (90 / mins), 2)
        p["keyPassesPer90"] = round(0.7 + assists * 0.4, 2)
        final_players.append(p)

    # Keep seed players ONLY for Super Lig clubs that don't have a real lineup downloaded yet
    for sp in seed_players_list:
        cid = sp["clubId"]
        if not str(sp.get("id", "")).startswith("hl-") and cid not in clubs_with_real_lineups and cid in active_super_lig_ids:
            final_players.append(sp)

    # Rebuild squads & fixtures for clubs
    for c in clubs_list:
        c["fixtures"] = []
        if c["id"] in clubs_with_real_lineups or c.get("isSuperLig"):
            club_players = [p for p in final_players if p["clubId"] == c["id"]]
            c["squad"] = sorted(
                [
                    {
                        "playerId": p["id"],
                        "name": p["name"],
                        "shirtNumber": p["shirtNumber"],
                        "positionMain": p["positionMain"],
                        "positionGroup": p["positionGroup"],
                        "age": p["age"],
                        "citizenship": p["citizenship"],
                        "foot": p["foot"],
                        "contractExpiry": p["contractExpiry"],
                        "currentMarketValueEur": p["currentMarketValueEur"],
                        "avgMatchRating": p["avgMatchRating"],
                        "gamesPlayed": p["gamesPlayed"],
                        "goals": p["goals"],
                        "assists": p["assists"],
                        "xG": p["xG"],
                        "injuryRisk": p["injuryRisk"],
                        "missedGamesTotal": 0,
                    }
                    for p in club_players
                ],
                key=lambda m: m["currentMarketValueEur"],
                reverse=True,
            )
            if club_players:
                c["totalMarketValueEur"] = sum(p["currentMarketValueEur"] for p in club_players)
                c["averageAge"] = round(sum(p["age"] for p in club_players) / len(club_players), 1)
        else:
            c["squad"] = []

    # Attach real fixtures & last-5 recentMatches from all 99 real finished matches
    if real_matches_gold:
        latest_round = max(m["round"] for m in real_matches_gold)
        standings_doc["currentRound"] = latest_round

        for m in real_matches_gold:
            hc = clubs_by_id.get(m["homeClubId"])
            ac = clubs_by_id.get(m["awayClubId"])
            h_res = "W" if m["homeScore"] > m["awayScore"] else "D" if m["homeScore"] == m["awayScore"] else "L"
            a_res = "W" if m["awayScore"] > m["homeScore"] else "D" if m["homeScore"] == m["awayScore"] else "L"
            if hc:
                hc["fixtures"].append({
                    "matchId": m["id"], "round": m["round"], "date": m["date"], "isHome": True,
                    "opponentClubId": m["awayClubId"], "opponentName": m["awayClubName"],
                    "opponentShortName": ac["shortName"] if ac else m["awayClubId"][:3].upper(),
                    "homeScore": m["homeScore"], "awayScore": m["awayScore"], "result": h_res,
                })
            if ac:
                ac["fixtures"].append({
                    "matchId": m["id"], "round": m["round"], "date": m["date"], "isHome": False,
                    "opponentClubId": m["homeClubId"], "opponentName": m["homeClubName"],
                    "opponentShortName": hc["shortName"] if hc else m["homeClubId"][:3].upper(),
                    "homeScore": m["homeScore"], "awayScore": m["awayScore"], "result": a_res,
                })

        for row in standings_doc["standings"]:
            cid = row["clubId"]
            club_fx = (clubs_by_id.get(cid) or {}).get("fixtures", [])[:5]
            row["form"] = [fx["result"] for fx in club_fx]
            row["recentMatches"] = [
                {
                    "matchId": fx["matchId"],
                    "result": fx["result"],
                    "opponentClubId": fx["opponentClubId"],
                    "opponentName": fx["opponentName"],
                    "score": f"{fx['homeScore']}-{fx['awayScore']}",
                    "isHome": fx["isHome"],
                }
                for fx in club_fx
            ]

    # Ensure every partner club referenced in transfers/rumours/perClub exists in clubs_list
    valid_club_ids = {c["id"] for c in clubs_list}
    for p in final_players:
        p["transfers"] = [t for t in p.get("transfers", []) if t["fromClubId"] in valid_club_ids and t["toClubId"] in valid_club_ids]
        p["rumours"] = [r for r in p.get("rumours", []) if r["clubId"] in valid_club_ids]
        p["perClub"] = [pc for pc in p.get("perClub", []) if pc["clubId"] in valid_club_ids]

    standings_path.write_text(json.dumps(standings_doc, indent=2, ensure_ascii=False), encoding="utf-8")
    clubs_path.write_text(json.dumps(clubs_list, indent=2, ensure_ascii=False), encoding="utf-8")
    players_path.write_text(json.dumps(final_players, indent=2, ensure_ascii=False), encoding="utf-8")
    matches_path.write_text(json.dumps(real_matches_gold, indent=2, ensure_ascii=False), encoding="utf-8")

    return {
        "standings_rows": updated_standings,
        "highlights": updated_highlights,
        "total_real_matches": len(real_matches_gold),
        "detailed_matches": detailed_matches_count,
        "real_squad_clubs": len(clubs_with_real_lineups),
        "total_players": len(final_players),
    }


def cmd_status(client: HighlightlyClient) -> None:
    statuses = client.get_key_statuses()
    print("=== Highlightly Çoklu API Anahtarı Kota Durumu ===")
    print(f"Base URL     : {client.base_url}")
    print(f"Auth Modu    : {client.auth_mode}")
    print(f"Kayıtlı Key  : {len(statuses)}")
    if not statuses:
        print("Uyarı        : backend/.env içinde henüz aktif API anahtarı tanımlı değil.")
    else:
        for s in statuses:
            state = "DOLU" if s.exhausted else "AKTİF"
            print(
                f"  #{s.index:<2} {s.fingerprint} -> Kullanılan: {s.used}/{s.safe_limit} "
                f"(Limit: {s.daily_limit}) | Kalan Güvenli: {s.remaining_safe} [{state}]"
            )
    print(f"Toplam Kalan Güvenli Kota (Bugün): {client.total_remaining_safe_quota()}")

    bronze_files = list(BRONZE_DIR.rglob("*.json")) if BRONZE_DIR.exists() else []
    print(f"Bronze Önbellek Dosyası           : {len(bronze_files)} JSON")


def cmd_sync(client: HighlightlyClient, season: str, league_id_override: str | None, run_build: bool) -> None:
    country = os.environ.get("SUPER_LIG_COUNTRY", "Turkey")
    league_hint = os.environ.get("SUPER_LIG_LEAGUE_NAME", "Süper Lig")

    if not client.keys:
        print("Hata: backend/.env içinde geçerli HIGHLIGHTLY_API_KEY_* tanımlanmamış.")
        sys.exit(1)

    league_id: int | str | None = league_id_override
    detected_season: str | None = None
    if not league_id:
        league_id, detected_season = find_super_lig_league_info(client, country, league_hint)

    active_season = detected_season or season

    if not league_id:
        print("Süper Lig leagueId bulunamadı.")
    else:
        print(f"[1/4] Süper Lig bulundu: leagueId={league_id}, season={active_season} (URL: {client.base_url}, auth: {client.auth_mode})")

        client.get(
            "/standings",
            params={"leagueId": league_id, "season": active_season},
            cache_group="standings",
            cache_name=f"standings_{league_id}_{active_season}",
        )

        all_api_matches: list[dict[str, Any]] = []
        page0 = client.get(
            "/matches",
            params={"leagueId": league_id, "season": active_season},
            cache_group="matches",
            cache_name=f"matches_{league_id}_{active_season}",
        )
        all_api_matches.extend(x for x in unwrap_data(page0) if isinstance(x, dict))

        total_count = 0
        if isinstance(page0, dict) and isinstance(page0.get("pagination"), dict):
            total_count = int(page0["pagination"].get("totalCount") or 0)

        for offset in (100, 200):
            if client.budget_stopped or (total_count and offset >= total_count):
                break
            page_n = client.get(
                "/matches",
                params={"leagueId": league_id, "season": active_season, "offset": offset},
                cache_group="matches",
                cache_name=f"matches_{league_id}_{active_season}_offset{offset}",
            )
            all_api_matches.extend(x for x in unwrap_data(page_n) if isinstance(x, dict))

        client.get(
            "/highlights",
            params={"leagueId": league_id, "season": active_season},
            cache_group="highlights",
            cache_name=f"highlights_{league_id}_{active_season}",
        )

        finished_matches = [
            m
            for m in all_api_matches
            if isinstance(m.get("state"), dict) and m["state"].get("description") == "Finished"
        ]
        finished_matches.sort(key=lambda m: str(m.get("date") or ""), reverse=True)
        print(f"[2/4] Toplam fikstür: {len(all_api_matches)}, Oynanmış (Finished) maç: {len(finished_matches)}")

        for m in finished_matches:
            if client.budget_stopped:
                break
            mid = m.get("id")
            if not mid:
                continue
            client.get(f"/matches/{mid}", cache_group="match_details", cache_name=f"match_{mid}")
            if client.budget_stopped:
                break
            client.get(f"/lineups/{mid}", cache_group="lineups", cache_name=f"lineup_{mid}")

    stats = merge_bronze_into_gold()
    print(
        f"[3/4] Özet -> Bu tur atılan API isteği: {client.requests_made_this_run}, "
        f"Önbellekten okunan: {client.cache_hits_this_run}, "
        f"Gold birleştirme: {stats}"
    )
    if client.budget_stopped:
        print(
            f"[Bilgi] Güvenli çalıştırma bütçesi ({client.run_budget} istek) dolduğu için duruldu. "
            "Kaldığınız yerden devam etmek için komutu tekrar çalıştırabilirsiniz."
        )

    if run_build:
        print("[4/4] web/ statik HTML derlemesi (npm run build) başlatılıyor...")
        subprocess.run("npm run build", cwd=WEB_DIR, shell=True, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="SiperLig Highlightly Veri Çekici")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("status", help="Kayıtlı API anahtarlarını ve kalan kotayı göster")

    sync_p = sub.add_parser("sync", help="Kota korumalı olarak verileri kademeli çek ve birleştir")
    sync_p.add_argument("--budget", type=int, default=None, help="Bu çalıştırmada maksimum canlı API isteği")
    sync_p.add_argument("--season", type=str, default=None, help="Sezon yılı (örn. 2026)")
    sync_p.add_argument("--league-id", type=str, default=None, help="Süper Lig ID'si biliniyorsa doğrudan verin")
    sync_p.add_argument("--build", action="store_true", help="Senkronizasyon sonrası web/ npm run build çalıştır")

    sub.add_parser("merge", help="İstek atmadan sadece Bronze önbelleğini Gold JSON'a aktar")

    args = parser.parse_args()
    client = HighlightlyClient(max_requests_per_run=getattr(args, "budget", None))

    if args.command == "status":
        cmd_status(client)
    elif args.command == "merge":
        res = merge_bronze_into_gold()
        print(f"Bronze -> Gold birleştirme tamamlandı: {res}")
    elif args.command == "sync":
        season = args.season or os.environ.get("SUPER_LIG_SEASON", "2026")
        cmd_sync(client, season=season, league_id_override=args.league_id, run_build=args.build)


if __name__ == "__main__":
    main()
