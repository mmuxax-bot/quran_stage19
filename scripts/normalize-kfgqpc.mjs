import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const rawPath=path.join(root,'scripts','_raw','hafs_smart_v8.json');
if(!fs.existsSync(rawPath)) throw new Error('Run fetch-kfgqpc-source.mjs first.');
const raw=JSON.parse(fs.readFileSync(rawPath,'utf8').replace(/^\uFEFF/,''));
const rows=Array.isArray(raw) ? raw : (raw.data || raw.ayahs || raw.verses || []);
const required=['sora_no','page','aya_no','aya_text','aya_text_emlaey','jozz'];
for(const r of rows) for(const k of required) if(r[k]===undefined || r[k]===null) throw new Error(`Missing ${k}`);
const by=new Map();
for(const r of rows){
 const n=Number(r.sora_no), a=Number(r.aya_no);
 if(!by.has(n)) by.set(n,{number:n,name_arabic:r.sora_name_ar,name_transliteration:r.sora_name_en,ayahs:[]});
 by.get(n).ayahs.push({number:a,text:r.aya_text,page:Number(r.page),juz:Number(r.jozz),line_start:Number(r.line_start),line_end:Number(r.line_end),search_text:r.aya_text_emlaey});
}
const surahs=[...by.values()].sort((a,b)=>a.number-b.number);
const total=surahs.reduce((n,s)=>n+s.ayahs.length,0);
if(surahs.length!==114 || total!==6236) throw new Error(`Invalid Quran counts: ${surahs.length} surahs / ${total} ayahs`);
for(const s of surahs){ for(let i=0;i<s.ayahs.length;i++) if(s.ayahs[i].number!==i+1) throw new Error(`Ayah sequence error ${s.number}:${i+1}`); }
const outDir=path.join(root,'public','data'); fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'quran.json'),JSON.stringify({source:'KFGQPC Hafs Smart v8',surahs},null,2));
console.log(`Normalized ${surahs.length} surahs / ${total} ayahs.`);
