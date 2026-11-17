import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../out');
const repoRoot = path.resolve(__dirname, '../..');

if (!fs.existsSync(outDir)) {
  console.error(`Hata: ${outDir} bulunamadı. Önce next build çalıştırın.`);
  process.exit(1);
}

let copiedCount = 0;

function mirrorIndexAsDotHtml(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '_next') continue;

    const subDir = path.join(currentDir, entry.name);
    const indexHtml = path.join(subDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      const siblingHtml = path.join(currentDir, `${entry.name}.html`);
      fs.copyFileSync(indexHtml, siblingHtml);
      copiedCount += 1;
    }
    mirrorIndexAsDotHtml(subDir);
  }
}

mirrorIndexAsDotHtml(outDir);

// Create a root index.html redirector in case Live Server is launched from repo root
const rootRedirectHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=./web/out/index.html" />
  <title>Süper Lig İstihbarat Portalı</title>
  <style>
    body { background: #090D16; color: #F8FAFC; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    a { color: #06B6D4; }
  </style>
</head>
<body>
  <p>Portal açılıyor... Yönlendirme başlamazsa <a href="./web/out/index.html">buraya tıklayın</a>.</p>
</body>
</html>
`;

fs.writeFileSync(path.join(repoRoot, 'index.html'), rootRedirectHtml, 'utf-8');

console.log(
  `Live Server hazırlığı tamamlandı: ${copiedCount} adet .html rota kopyası üretildi ve kök index.html güncellendi.`
);
