import {h,go,useState,useEffect} from '../lib/helpers.js';
import {IMAGES} from '../data/catalog.js';
export function Assets(){const[res,setRes]=useState({});
useEffect(()=>{let live=true;IMAGES.forEach(m=>{const i=new Image();i.onload=()=>live&&setRes(r=>({...r,[m.path]:1}));i.onerror=()=>live&&setRes(r=>({...r,[m.path]:0}));i.src=m.path});return()=>{live=false}},[]);
const ok=IMAGES.filter(m=>res[m.path]===1),miss=IMAGES.filter(m=>res[m.path]===0),wait=IMAGES.length-ok.length-miss.length;
return h('div',{className:'wrap sec'},h('h1',{style:{fontSize:34}},'Image checklist'),h('p',null,`${IMAGES.length} required · ${ok.length} present · ${miss.length} missing`+(wait?` · ${wait} checking`:'')),h('p',{className:'mut'},'Add each missing file under the public folder at the exact path shown. Also run npm run images:check.'),
miss.length===0&&!wait&&h('div',{className:'tag'},'All required photos are in place.'),
miss.map(m=>h('div',{key:m.path,className:'card pad',style:{marginBottom:8}},h('div',{className:'row sp'},h('b',null,m.label),h('span',{className:'tag'},m.kind)),h('code',null,'public'+m.path),h('div',{className:'mut'},m.hint))),
h('button',{className:'chip',style:{marginTop:12},onClick:()=>go('/')},'Back to home'))}
