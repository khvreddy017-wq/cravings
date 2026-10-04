import fs from 'node:fs';
import {IMAGES} from '../src/data/catalog.js';
fs.writeFileSync('images-manifest.json',JSON.stringify(IMAGES,null,2));
const by={};IMAGES.forEach(m=>{const d=m.path.split('/').slice(0,-1).join('/');(by[d]=by[d]||[]).push(m)});
let md=`# CRAVINGS image manifest\n\n${IMAGES.length} required photos. Save each as JPG at the exact path under \`public/\` (recommended 1200px wide, 4:3 or 16:10, under 300 KB). Run \`npm run images:check\` to see what is still missing.\n`;
for(const d of Object.keys(by).sort()){md+=`\n## public${d}/ (${by[d].length})\n\n`;by[d].forEach(m=>{md+=`- [ ] \`${m.path.split('/').pop()}\` : ${m.label}. ${m.hint}\n`})}
fs.writeFileSync('IMAGE_MANIFEST.md',md);console.log('Wrote images-manifest.json and IMAGE_MANIFEST.md for '+IMAGES.length+' images');
