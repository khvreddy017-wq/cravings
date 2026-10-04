// Downloads a photo for every missing image in the manifest from Pexels (free licence).
// Usage: npm run images:download -- YOUR_PEXELS_KEY     (add --force to replace existing files)
import fs from 'node:fs';
import path from 'node:path';
import {IMAGES} from '../src/data/catalog.js';
const key=process.argv.slice(2).find(a=>!a.startsWith('--'))||process.env.PEXELS_API_KEY;
const force=process.argv.includes('--force');
if(!key){console.log('Get a free key at https://www.pexels.com/api/ then run:\n  npm run images:download -- YOUR_KEY');process.exit(1)}
const term=m=>m.kind==='hero'?'indian food spread table':m.kind==='restaurant'?m.hint.replace(/^.*?: /,''):m.kind==='state'?m.label+' traditional food India':m.label+' indian food';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const credits=['# Photo credits (Pexels)\n'],failed=[];let done=0;
for(const m of IMAGES){
  const file='public'+m.path;
  if(fs.existsSync(file)&&!force){done++;continue}
  try{
    const q=encodeURIComponent(term(m));
    const r=await fetch(`https://api.pexels.com/v1/search?query=${q}&per_page=1&orientation=landscape`,{headers:{Authorization:key}});
    if(!r.ok)throw new Error('search '+r.status);
    const p=(await r.json()).photos?.[0];if(!p)throw new Error('no result');
    const img=await fetch(m.kind==='hero'?p.src.large2x:p.src.large);if(!img.ok)throw new Error('download '+img.status);
    fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from(await img.arrayBuffer()));
    credits.push(`- ${m.label}: ${p.photographer} (${p.url})`);done++;console.log(`ok   ${m.path}`);
  }catch(e){failed.push(m);console.log(`FAIL ${m.path} (${e.message})`)}
  await sleep(350);
}
fs.writeFileSync('PHOTO_CREDITS.md',credits.join('\n')+'\n');
console.log(`\n${done}/${IMAGES.length} photos in place.`+(failed.length?` ${failed.length} failed: run the command again, or add those files by hand (see IMAGE_MANIFEST.md).`:' All done. Check the photos in the app; replace any that do not match the dish.'));
