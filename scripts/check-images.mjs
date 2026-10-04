import fs from 'node:fs';
import {IMAGES} from '../src/data/catalog.js';
const miss=[],tiny=[];
for(const m of IMAGES){const p='public'+m.path;if(!fs.existsSync(p))miss.push(m);else if(fs.statSync(p).size<8000)tiny.push(m)}
console.log(`${IMAGES.length-miss.length}/${IMAGES.length} photos present`);
miss.forEach(m=>console.log('MISSING  public'+m.path+'   ('+m.label+')'));
tiny.forEach(m=>console.log('SUSPECT  public'+m.path+'   (under 8 KB, probably not a real photo)'));
process.exit(miss.length||tiny.length?1:0);
