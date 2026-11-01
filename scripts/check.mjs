import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../dist/',import.meta.url);
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(new URL('data.js',root),'utf8'),context);
vm.runInContext(fs.readFileSync(new URL('pictures.js',root),'utf8'),context);
const units=context.window.WORD_TOWN_DATA;
assert.equal(units.length,10);
assert.equal(units.flatMap(u=>u.words).length,142);
assert.equal(new Set(units.flatMap(u=>u.words.map(w=>w.id))).size,142);
for(const u of units){
 for(const w of u.words){
  const html=context.window.renderWordPicture(w);
  assert(html.includes('visual-stage'),w.word);
  assert(!html.includes('undefined'),w.word);
  assert(w.example && w.ipa && w.visual,w.word);
 }
 for(const p of u.pins)assert(u.words.some(w=>w.word===p[0]),p[0]);
}
const index=fs.readFileSync(new URL('index.html',root),'utf8');
const learningOnly=index.replace(/<(header|section)\b[^>]*data-bilingual[^>]*>[\s\S]*?<\/\1>/g,'');
assert(!/[\p{Script=Han}]/u.test(learningOnly),'Chinese must stay inside the bilingual top sections');
for(const name of ['app.js','data.js','pictures.js','style.css']){
 assert(!/[\p{Script=Han}]/u.test(fs.readFileSync(new URL(name,root),'utf8')),`${name} contains Chinese`);
}
// Exercise the real app controller with a small DOM adapter and a controlled clock.
// A one-word fixture makes review selection deterministic without replacing the learning logic.
let now=Date.UTC(2026,10,1,9),saved=new Map(),handlers={};
const nodes=new Map();
const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',value:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(){},focus(){}});return nodes.get(key);};
const fixture=JSON.parse(JSON.stringify(units));fixture[0].words=fixture[0].words.slice(0,1);
const ctx=vm.createContext({window:{WORD_TOWN_DATA:fixture,renderWordPicture:context.window.renderWordPicture},document:{querySelector:node,querySelectorAll:()=>[],addEventListener:(event,fn)=>handlers[event]=fn},localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)},Date:{now:()=>now},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:fn=>fn()});
vm.runInContext(fs.readFileSync(new URL('app.js',root),'utf8'),ctx);
const click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}});
const action=name=>click({action:name});
const state=()=>JSON.parse(saved.get('word-town-progress-v1'))['u1-1'];
action('remember');assert.equal(state().level,1);assert.equal(state().due,now+86400000);
action('remember');assert.equal(state().level,1,'same-day self report cannot boost mastery');
action('forget');assert.equal(state().level,0);assert.equal(state().due,now);
handlers.change({target:{id:'quiz-scope',value:'due'}});action('begin-quiz');
click({answer:'wrong-answer'});assert.equal(state().level,0);assert(node('#view').innerHTML.includes('Let’s look at it once more.'));
action('quiz-next');assert(node('#view').innerHTML.includes('0<span> / 1 correct'));
action('retry');click({answer:'u1-1'});assert.equal(state().level,1);action('quiz-next');
now+=86400000;action('new-quiz');action('begin-quiz');click({answer:'u1-1'});assert.equal(state().level,2);assert.equal(state().due,now+3*86400000);
click({answer:'wrong-answer'});assert.equal(state().level,2,'duplicate submissions cannot change a result');
action('quiz-next');now+=3*86400000;action('new-quiz');action('begin-quiz');click({answer:'u1-1'});assert.equal(state().level,3);assert.equal(state().due,now+7*86400000);
console.log('PASS: 142 visual entries, all scene pins, English-only learning content with bilingual top sections, self-report limits, wrong-answer queue, retry, duplicate protection and 1/3/7-day review progression.');
