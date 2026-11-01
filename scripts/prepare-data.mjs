import fs from 'node:fs';
import {visuals,scenesEnglish} from '../data/visuals.mjs';
const source=fs.readFileSync(new URL('../data/source.md',import.meta.url),'utf8');
const scenes=JSON.parse(fs.readFileSync(new URL('../data/scenes.json',import.meta.url),'utf8'));
const memories=fs.readFileSync(new URL('../data/memories.txt',import.meta.url),'utf8').split(/\r?\n/).filter(l=>l.trim()&&!l.startsWith('#')).map(l=>l.split('|'));
const sections=source.split(/^## Unit /m).slice(1);
let cursor=0;
const units=sections.map((section,idx)=>{
 const rows=section.split(/^## 整理口径/m)[0].split(/\r?\n/).filter(l=>l.startsWith('| ')&&!l.startsWith('| 英文')&&!l.startsWith('| ---'));
 const words=rows.map((r,i)=>{
  const [word,ipa,zh]=r.split('|').slice(1,-1).map(t=>t.trim());
  const mem=memories[cursor++];
  if(!mem||mem.length!==4) throw new Error(`Invalid memory: ${word}`);
  if(!visuals[word]) throw new Error(`Missing visual: ${word}`);
  return {id:`u${idx+1}-${i+1}`,unit:idx+1,word,ipa,example:mem[0],symbol:mem[3],visual:visuals[word]};
 });
 const [title,en,headline,story,place]=scenesEnglish[idx];
 return {...scenes[idx],title,en,headline,story,place,id:idx+1,words};
});
if(cursor!==142||memories.length!==142)throw new Error(`Expected 142 words and memories: ${cursor}/${memories.length}`);
fs.writeFileSync(new URL('../dist/data.js',import.meta.url),'window.WORD_TOWN_DATA = '+JSON.stringify(units)+';\n');
console.log(`Prepared ${units.length} scenes and ${cursor} illustrated word memories.`);
