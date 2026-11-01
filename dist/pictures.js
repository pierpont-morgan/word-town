(() => {
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const svg=content=>`<svg class="picture-svg" aria-hidden="true" viewBox="0 0 300 160" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
 const text=(x,y,t,size=28,fill='#47654f')=>`<text x="${x}" y="${y}" font-family="Nunito,Segoe UI Emoji,sans-serif" font-size="${size}" fill="${fill}" text-anchor="middle">${esc(t)}</text>`;
 const line=(x1,y1,x2,y2,color='#729269',width=4)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
 const arrow=(x,y)=>text(x,y,'→',29,'#9cad88');
 const frames=items=>`<div class="picture-sequence">${items.map((p,i)=>`${i?'<span class="picture-arrow" aria-hidden="true">→</span>':''}<span class="picture-frame" aria-hidden="true">${esc(p)}</span>`).join('')}</div>`;
 function clock(v) {
  const cx=150,cy=79; let body='<circle cx="150" cy="79" r="67" fill="#fffdf0" stroke="#d9b77c" stroke-width="6"/>';
  for(let n=1;n<=12;n++){const a=(n*30-90)*Math.PI/180;body+=text(cx+Math.cos(a)*51,cy+Math.sin(a)*51+4,n,12);}
  const hand=(a,l,c,w)=>{a=(a-90)*Math.PI/180;return line(cx,cy,cx+Math.cos(a)*l,cy+Math.sin(a)*l,c,w);};
  body+=hand((v.hour%12)*30+v.minute/2,32,v.highlight==='hour'?'#d28c57':'#456b51',6);
  body+=hand(v.minute*6,45,v.highlight==='minute'?'#d28c57':'#456b51',4);
  body+='<circle cx="150" cy="79" r="5" fill="#d1a15e"/>';
  if(v.highlight!=='both')body+=text(v.highlight==='hour'?213:199,v.highlight==='hour'?98:28,'←',27,'#c5804a');
  return svg(body);
 }
 function render(v) {
  if(v.type==='crop') { const x=Math.max(50/v.z,Math.min(100-50/v.z,v.x)),y=Math.max(50/v.z,Math.min(100-50/v.z,v.y));return `<div class="crop-frame"><div class="crop-art" style="background-position:${((v.scene-1)%5)*25}% ${v.scene>5?100:0}%;transform:translate(${50-x*v.z}%,${50-y*v.z}%) scale(${v.z})"></div></div>`; }
  if(v.type==='sequence')return frames(v.frames);
  if(v.type==='speech')return `<div class="picture-speech"><span class="speech-cloud">${esc(v.bubble)}</span><span class="speech-actors" aria-hidden="true">${esc(v.picture)}</span></div>`;
  if(v.type==='clock')return clock(v);
  if(v.type==='colour')return svg(`<rect x="105" y="24" width="90" height="90" rx="28" fill="${v.fill}" stroke="#d5dbc9" stroke-width="2"/>${text(220,103,v.picture,40)}`);
  if(v.type==='calendar')return `<div class="picture-calendar"><div class="calendar-top">${v.whole?'← &nbsp; 7 days &nbsp; →':v.picture}</div><div class="calendar-row">${['M','T','W','T','F','S','S'].map((day,i)=>`<span><small>${day}</small><b class="${v.active.includes(i)?'yes':''}">${v.active.includes(i)?'✓':'·'}</b></span>`).join('')}</div></div>`;
  switch(v.type){
   case 'start':return svg(`${line(40,120,260,120)}${line(85,42,85,126,'#d19a61',3)}${text(53,34,'3, 2, 1…',16)}${text(124,100,'🏃',64)}${arrow(217,95)}`);
   case 'tall':return svg(`${text(106,121,'🌳',101)}${text(226,123,'🌱',29)}${line(45,34,45,124,'#d1a15e',3)}${text(45,37,'↑',27,'#d1a15e')}${text(45,137,'↓',27,'#d1a15e')}`);
   case 'duck':return svg(`${line(30,65,270,65,'#b89668',5)}${text(78,62,'🧒',46)}${arrow(140,104)}<circle cx="211" cy="92" r="14" fill="#d8ac7d"/>${line(204,109,183,124)}${line(183,124,204,141)}${line(183,124,165,140)}${text(213,48,'↓',28,'#c68d5a')}`);
   case 'elephant':return svg(`${text(142,128,'🐘',116)}<ellipse cx="212" cy="104" rx="20" ry="30" fill="none" stroke="#cf995a" stroke-width="3" stroke-dasharray="4 4"/>${text(257,97,'←',30,'#cf995a')}`);
   case 'tail':return svg(`${text(150,130,'🐒',108)}<ellipse cx="191" cy="110" rx="29" ry="28" fill="none" stroke="#cf995a" stroke-width="3" stroke-dasharray="4 4"/>${text(244,105,'←',30,'#cf995a')}`);
   case 'africa':return svg(`<path d="M98 29 130 20 153 25 170 35 183 36 191 52 214 58 206 77 188 84 182 106 171 123 158 145 142 137 135 114 126 95 106 89 86 69 81 53Z" fill="#d2b27a" stroke="#a58c5f" stroke-width="3"/><path d="m202 107 7 3-3 20-7 9-3-11Z" fill="#d2b27a"/>${text(146,86,'🐘',37)}`);
   case 'pole':return svg(`${text(150,131,'🌍',106)}<ellipse cx="150" cy="43" rx="27" ry="9" fill="#fff" stroke="#a5c4cc" stroke-width="2"/>${line(150,10,150,31,'#c38a54',3)}${text(150,34,'↓',23,'#c38a54')}${text(212,42,'❄',28)}`);
   case 'tradition':return svg(`${text(62,44,'2024',15)}${text(150,44,'2025',15)}${text(240,44,'2026',15)}${text(62,100,'🍜',44)}${text(150,100,'🍜',44)}${text(240,100,'🍜',44)}${arrow(106,93)}${arrow(196,93)}${text(150,139,'🎂   🎂   🎂',24)}`);
   case 'transfer':return svg(`${text(50,104,'👧',56)}${text(249,104,'🧒',56)}${text(149,75,v.item,44)}${text(150,117,v.reverse?'←':'→',47,'#c39963')}${v.reverse?text(149,32,'Yesterday → today',13):text(249,139,'Here!',13)}`);
   case 'cinema':return svg(`<rect x="56" y="14" width="188" height="92" rx="8" fill="#354c44"/><rect x="65" y="23" width="170" height="72" rx="3" fill="#b8d3d1"/>${text(150,72,'🌄',47)}${text(150,149,'👤 👤 👤 👤',30)}${text(35,105,'🍿',28)}`);
   case 'around':return svg(`<ellipse cx="150" cy="80" rx="108" ry="55" fill="none" stroke="#bdcba8" stroke-width="3" stroke-dasharray="7 6"/>${text(149,61,'🏠',43)}${text(82,107,'🏪',38)}${text(216,105,'🌳',38)}${text(192,31,'👣 →',21)}`);
   case 'south':return svg(`${text(150,27,'N',14)}${line(150,39,150,126,'#a6b590',3)}${text(150,151,'S',20)}${text(150,128,'↓',28)}${text(105,75,'🪿',35)}${text(198,103,'🪿',35)}`);
   case 'land':return svg(`<path d="M0 90Q80 45 147 95T300 98V160H0Z" fill="#a9bd83"/><path d="M192 85Q221 94 208 123T210 160H300V95Z" fill="#9bc2d0"/>${text(91,94,'🌳',65)}${text(114,142,'↓',31,'#8c6b46')}`);
   case 'menu':return svg(`<rect x="95" y="9" width="110" height="143" rx="8" fill="#fffdf1" stroke="#d4c196" stroke-width="3"/>${text(149,42,'☰',22)}${text(150,77,'🥣  ···  3',22)}${text(150,108,'🥛  ···  2',22)}${text(150,139,'🍌  ···  1',22)}`);
   case 'tomorrow':return svg(`<rect x="29" y="24" width="94" height="114" rx="12" fill="#fffdf4"/><rect x="174" y="24" width="94" height="114" rx="12" fill="#e4edcf"/>${text(76,58,'TODAY',13)}${text(76,112,'12',42)}${arrow(148,91)}${text(221,107,'13',50)}${text(221,56,'☀',25)}`);
   case 'promise':return `<div class="picture-promise"><div><small>“I’ll return it.”</small><span>👧 📖 🧒</span></div><b>→</b><div><small>The next day</small><span>📖 ↩ ✓</span></div></div>`;
   case 'ontime':return svg(`${text(72,50,'8:00',25)}${text(228,50,'8:00',25)}${text(70,120,'🏫',62)}${text(228,118,'🧒',56)}${arrow(151,105)}${text(150,43,'✓',25,'#7d9d5e')}`);
   case 'truth':return `<div class="picture-promise"><div><small>“I didn’t do it.”</small><span>🤥 ✕</span></div><b>→</b><div><small>“I did it.”</small><span>🧒 ✓</span></div></div>`;
   case 'arm':return svg(`${text(150,133,'💪',115)}${text(243,84,'←',34,'#c59059')}`);
   case 'empty':return svg(`<path d="M102 58h96l-13 85h-70Z" fill="#d9a07a"/><ellipse cx="150" cy="58" rx="48" ry="15" fill="#b77a55"/><ellipse cx="150" cy="58" rx="38" ry="9" fill="#f2d8b5"/>${text(150,31,'↓',28,'#a47b47')}`);
   case 'month':return svg(`<rect x="81" y="8" width="140" height="145" rx="10" fill="#fffdf0" stroke="#d7c393" stroke-width="3"/><rect x="81" y="8" width="140" height="32" rx="8" fill="#b8cda4"/>${text(151,31,'JANUARY',12)}${Array.from({length:31},(_,i)=>text(100+(i%7)*17,63+Math.floor(i/7)*18,i+1,10)).join('')}`);
   case 'line':return svg(`${line(55,90,245,90,'#759367',6)}${text(250,78,'✏️',32)}`);
   case 'circle':return svg('<circle cx="150" cy="80" r="56" fill="none" stroke="#87a275" stroke-width="7"/>');
   case 'earth':return svg(`${text(100,105,'☀️',68)}<ellipse cx="157" cy="83" rx="105" ry="55" fill="none" stroke="#c2cea9" stroke-width="2" stroke-dasharray="5 5"/>${text(238,106,'🌍',61)}`);
   case 'moon':return svg(`${text(128,123,'🌍',90)}<ellipse cx="149" cy="83" rx="111" ry="53" fill="none" stroke="#c2cea9" stroke-width="2" stroke-dasharray="5 5"/>${text(251,80,'🌕',40)}`);
   case 'report':return svg(`<rect x="40" y="21" width="220" height="118" rx="11" fill="#fffdf2" stroke="#b1c6a0" stroke-width="3"/>${text(150,51,'MON     TUE     WED',15)}${text(150,97,'☀️    🌧️    ☁️',27)}${text(150,123,'20°C      16°C      18°C',13)}`);
   case 'degree':return svg(`${text(94,123,'🌡️',96)}${text(193,97,'20°C',44)}<ellipse cx="219" cy="70" rx="14" ry="14" fill="none" stroke="#c69259" stroke-width="3"/>`);
   case 'continue':return svg(`${text(60,93,'🏃',50)}${text(120,93,'Ⅱ',33,'#adbb99')}${arrow(173,90)}${text(237,93,'🏃',50)}${line(30,120,270,120,'#b5c5a3',3)}`);
   default:return frames(['👀','💭']);
  }
 }
 window.renderWordPicture = w => `<div class="visual-stage" role="group" aria-label="Picture story">${render(w.visual)}</div>`;
})();
