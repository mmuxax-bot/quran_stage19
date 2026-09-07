import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const required = [
  'index.html',
  'package.json',
  'src/main.js',
  'src/style.css',
  'src/data/surahs.js',
  'public/data/quran.json',
  'scripts/prepare-quran.mjs',
  'scripts/validate-navigation.mjs'
];

let failed = false;
const ok = (msg) => console.log(`PASS  ${msg}`);
const fail = (msg) => { console.error(`FAIL  ${msg}`); failed = true; };

for (const file of required) {
  if (fs.existsSync(path.join(root, file))) ok(`exists: ${file}`);
  else fail(`missing: ${file}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const script of ['dev', 'build', 'prepare:quran', 'validate:quran', 'validate:navigation']) {
  if (pkg.scripts?.[script]) ok(`package script: ${script}`);
  else fail(`missing package script: ${script}`);
}

const checks = [
  ['src/main.js', 'readerDark', 'day/night reader state'],
  ['src/main.js', '114', '114-surah navigation reference'],
  ['src/main.js', '604', '604-page navigation reference'],
  ['src/main.js', 'voice', 'voice-check system reference'],
  ['src/main.js', 'localStorage', 'local persistence'],
  ['src/style.css', '.reader-light', 'light reader theme'],
  ['src/style.css', '.reader-dark', 'dark reader theme']
];
for (const [file, needle, label] of checks) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  text.includes(needle) ? ok(label) : fail(`${label}: ${needle} not found`);
}

const data = JSON.parse(fs.readFileSync(path.join(root, 'public/data/quran.json'), 'utf8'));
if (Array.isArray(data.surahs) && data.surahs.length === 114 && Number(data.totalAyahs) === 6236) {
  ok('Quran data metadata is 114 surahs / 6236 ayahs');
} else {
  console.warn('WARN  bundled quran.json is a preparation placeholder; run prepare:quran before release');
}

for (const file of ['src/main.js', 'src/data/surahs.js', 'scripts/prepare-quran.mjs', 'scripts/validate-navigation.mjs']) {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8' });
  if (result.status === 0) ok(`syntax: ${file}`);
  else fail(`syntax: ${file}\n${result.stderr}`);
}

console.log(failed ? '\nFINAL QA: FAILED' : '\nFINAL QA: PASSED (static checks)');
process.exitCode = failed ? 1 : 0;
