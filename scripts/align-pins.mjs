import fs from 'node:fs';
const url=new URL('../data/scenes.json',import.meta.url),scenes=JSON.parse(fs.readFileSync(url,'utf8'));
const pins=[
 [['classroom',40,38],['sports field',50,59],['school building',66,27],['bamboo',9,37]],
 [['helpful',67,59],['polite',30,43],['great',55,74],['lovely',88,40]],
 [['panda',26,73],['elephant',72,53],['polar bear',81,18],['monkey',27,27]],
 [['party',53,21],['share a cake',52,70],['letter',87,89],['bowl',32,83]],
 [['bakery',89,52],['bridge',40,48],['boat',64,79],['shop',17,40]],
 [['apple',29,27],['fly south',74,16],['farm',49,59],['pine tree',87,38]],
 [['porridge',27,60],['milk',42,26],['banana',60,48],['juice',70,35]],
 [['doll',51,53],['pot',33,77],['seed',58,87],['honest',26,44]],
 [['time',34,28],['hour hand',31,32],['the moon',90,20],['evening',51,73]],
 [['sunny',18,15],['rainy',80,27],['lamb',25,68],['tortoise',45,82]]
];
for(let i=0;i<scenes.length;i++) scenes[i].pins=pins[i];
fs.writeFileSync(url,JSON.stringify(scenes,null,2)+'\n');

