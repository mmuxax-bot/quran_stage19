import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const root = process.cwd();
const outDir = path.join(root, 'scripts', '_raw');
const out = path.join(outDir, 'hafs_smart_v8.json');
const urls = [
  'https://raw.githubusercontent.com/thetruetruth/quran-data-kfgqpc/main/hafs-smart/data/hafs_smart_v8.json',
  'https://cdn.jsdelivr.net/gh/thetruetruth/quran-data-kfgqpc@main/hafs-smart/data/hafs_smart_v8.json'
];
fs.mkdirSync(outDir, { recursive: true });
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'quran-hifz-source-fetcher/1.0' } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) return get(r.headers.location).then(resolve, reject);
      if (r.statusCode !== 200) return reject(new Error(`HTTP ${r.statusCode}`));
      const chunks=[]; r.on('data', c=>chunks.push(c)); r.on('end',()=>resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}
for (const url of urls) {
  try {
    const body = await get(url);
    JSON.parse(body.toString('utf8').replace(/^\uFEFF/, ''));
    fs.writeFileSync(out, body);
    console.log(`Downloaded: ${url}`);
    console.log(`Saved: ${out}`);
    process.exit(0);
  } catch (e) { console.warn(`Source failed: ${url} — ${e.message}`); }
}
console.error('Could not download the KFGQPC source in this environment.');
process.exit(2);
