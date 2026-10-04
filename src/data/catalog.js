const $=n=>'₹'+Math.round(n);
const slug=s=>s.toLowerCase().replace(/&/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const dishImg=(n,cat,st)=>st?`/images/regional/${st}/${slug(n)}.jpg`:`/images/${/noodle/i.test(n)?'noodles':slug(cat)}/${slug(n)}.jpg`;
const catImg=c=>`/images/categories/${slug(c)}.jpg`;
const CATS=['Biryani','Pizza','Burgers','Chicken','Shawarma','Dosa','South Indian','North Indian','Chinese','Momos','Rolls','Kebabs','Desserts','Cakes','Ice Cream','Tiffins','Thali','Beverages'];
const LOCS=['Bengaluru','Hyderabad','Chennai','Vijayawada','Mumbai','Delhi','Pune','Kochi'];
const STATES=`ap|Andhra Pradesh|South|Fiery curries, tangy gongura and generous banana-leaf meals.
tg|Telangana|South|Home of dum biryani, haleem and slow-cooked Deccan classics.
ka|Karnataka|South|Soft dosas, comforting bath and sweet Dharwad treats.
tn|Tamil Nadu|South|Crisp dosas, Chettinad spice and flaky parotta.
kl|Kerala|South|Coconut, seafood and soft appams by the backwaters.
mh|Maharashtra|West|Street-food royalty: misal, vada pav and pav bhaji.
pb|Punjab|North|Buttery curries, stuffed kulchas and hearty saag.
rj|Rajasthan|North|Royal desert fare: baati, gatte and fiery laal maas.
gj|Gujarat|West|Sweet-savoury thalis, dhokla and thepla.
wb|West Bengal|East|Fish, mishti and the legendary Kolkata biryani.
od|Odisha|East|Temple-style dalma, pakhala and chhena poda.
as|Assam|East|Light, tangy fish tenga, khar and pitha.`.split('\n').map(l=>{const[id,n,reg,d]=l.split('|');return{id,n,reg,d,img:'/images/states/'+slug(n)+'.jpg'}});
const sn=id=>(STATES.find(s=>s.id===id)||{}).n;
const F=`Chicken Biryani|Biryani|n|289
Mutton Biryani|Biryani|n|369
Veg Biryani|Biryani|v|219
Margherita Pizza|Pizza|v|249
Peri Peri Chicken Pizza|Pizza|n|329
Crispy Chicken Burger|Burgers|n|179
Paneer Burger|Burgers|v|159
Chicken 65|Chicken|n|229
Butter Naan|North Indian|v|49
Paneer Butter Masala|North Indian|v|259
Chicken Shawarma Roll|Shawarma|n|149
Chicken Momos|Momos|n|139
Veg Momos|Momos|v|119
Egg Roll|Rolls|n|119
Chicken Seekh Kebab|Kebabs|n|249
Schezwan Fried Rice|Chinese|v|189
Hakka Noodles|Chinese|v|179
Idli Vada Combo|Tiffins|v|99
Plain Dosa|Dosa|v|89
Chocolate Truffle Cake|Cakes|v|399
Vanilla Ice Cream|Ice Cream|v|99
Gulab Jamun|Desserts|v|99
Fresh Lime Soda|Beverages|v|69
Cold Coffee|Beverages|v|109
South Indian Meals|Thali|v|179
North Indian Thali|Thali|v|229
Andhra Chicken|Chicken|n|269|ap
Gongura Chicken|Chicken|n|289|ap
Pulihora|South Indian|v|129|ap
Andhra Meals|Thali|v|199|ap
Gutti Vankaya|South Indian|v|179|ap
Royyala Iguru|Chicken|n|329|ap
Hyderabadi Biryani|Biryani|n|299|tg
Haleem|Chicken|n|229|tg
Double Ka Meetha|Desserts|v|109|tg
Mirchi Ka Salan|North Indian|v|149|tg
Bisi Bele Bath|South Indian|v|139|ka
Mysore Masala Dosa|Dosa|v|119|ka
Ragi Mudde|Thali|v|159|ka
Dharwad Peda|Desserts|v|99|ka
Masala Dosa|Dosa|v|109|tn
Pongal|Tiffins|v|89|tn
Chettinad Chicken|Chicken|n|279|tn
Parotta|South Indian|v|69|tn
Appam|Tiffins|v|79|kl
Kerala Parotta|South Indian|v|69|kl
Malabar Biryani|Biryani|n|319|kl
Puttu|Tiffins|v|89|kl
Fish Curry|Chicken|n|289|kl
Misal Pav|Tiffins|v|119|mh
Vada Pav|Tiffins|v|49|mh
Pav Bhaji|North Indian|v|149|mh
Puran Poli|Desserts|v|99|mh
Butter Chicken|Chicken|n|329|pb
Amritsari Kulcha|North Indian|v|139|pb
Chole Bhature|North Indian|v|139|pb
Sarson Saag|North Indian|v|189|pb
Dal Baati Churma|Thali|v|219|rj
Gatte Ki Sabzi|North Indian|v|169|rj
Laal Maas|Chicken|n|349|rj
Ghevar|Desserts|v|129|rj
Dhokla|Tiffins|v|89|gj
Khandvi|Tiffins|v|99|gj
Thepla|North Indian|v|89|gj
Gujarati Thali|Thali|v|229|gj
Kolkata Biryani|Biryani|n|299|wb
Macher Jhol|Chicken|n|289|wb
Mishti Doi|Desserts|v|79|wb
Rasgulla|Desserts|v|89|wb
Dalma|Thali|v|159|od
Pakhala Bhata|Thali|v|129|od
Chhena Poda|Desserts|v|109|od
Odia Thali|Thali|v|219|od
Masor Tenga|Chicken|n|269|as
Khar|Thali|v|169|as
Assam Thali|Thali|v|229|as
Pitha|Desserts|v|89|as
Classic Burger|Burgers|n|169
Chicken Lollipop|Chicken|n|259
Paneer Tikka|Kebabs|v|229
Garlic Naan|North Indian|v|69
Chicken Fried Rice|Chinese|n|199
Brownie|Desserts|v|129
Lassi|Beverages|v|79
Chicken Tikka Pizza|Pizza|n|339
Pesarattu|Tiffins|v|99|ap
Sarva Pindi|Tiffins|v|99|tg`.split('\n').map((l,i)=>{const[n,cat,v,p,st]=l.split('|');return{id:i,n,cat,veg:v==='v',p:+p,st:st||'',img:dishImg(n,cat,st),d:`Freshly made ${n}${st?', a '+sn(st)+' favourite':''}, served hot.`,rt:(4+(i*3%10)/10).toFixed(1)}});
const R=`Royal Biryani House|Biryani, Mughlai|Biryani,Chicken,Kebabs,Beverages,Desserts
Hyderabad Spice Kitchen|Hyderabadi, Biryani|Biryani,Chicken,North Indian,Desserts,Beverages,Thali
Deccan Dum Biryani|Biryani, Andhra|Biryani,Chicken,Thali,South Indian,Beverages
Biryani Junction|Biryani, Fast Food|Biryani,Rolls,Burgers,Shawarma,Beverages
Nawabi Kitchen|North Indian, Mughlai|North Indian,Kebabs,Chicken,Biryani,Desserts,Thali
The Biryani Story|Biryani, Kebabs|Biryani,Kebabs,Chicken,Ice Cream
Dosa Darbar|South Indian, Tiffins|Dosa,South Indian,Tiffins,Thali,Beverages,Desserts
Slice & Co|Pizza, Burgers|Pizza,Burgers,Rolls,Ice Cream,Cakes,Beverages
Dragon Wok|Chinese, Momos|Chinese,Momos,Rolls,Beverages
Sweet Tooth Bakery|Desserts, Cakes|Desserts,Cakes,Ice Cream,Beverages`.split('\n').map((l,i)=>{const[name,cuisine,cs]=l.split('|'),cats=cs.split(','),menu=F.filter(f=>cats.includes(f.cat));return{id:i+1,img:'/images/restaurants/'+slug(name)+'.jpg',name,cuisine,cats,menu,pv:menu.every(f=>f.veg),nv:menu.some(f=>!f.veg),rating:+(4+(i*7%10)/10).toFixed(1),n:200+i*173,time:20+i*7%25,dist:+(1+i*3%8*.7).toFixed(1),two:250+i*60%350,offer:['20% OFF up to ₹120','Free delivery','','Buy 1 Get 1','Flat ₹75 OFF'][i%5],addr:`${12+i}, MG Road Cross`,open:i!==9}});
const COUP={CRAVE20:{t:'p',v:20,max:120,min:199},FIRSTCRAVE:{t:'f',v:75,min:149},FREEDELIVERY:{t:'d',min:0},WEEKEND15:{t:'p',v:15,max:150,min:299},B1G1:{t:'b',min:0}};
const OFFERS=[['CRAVE20','20% OFF','Up to ₹120 on orders above ₹199'],['FIRSTCRAVE','First Order Offer','Flat ₹75 OFF your first order above ₹149'],['FREEDELIVERY','Free Delivery','Zero delivery fee on any order'],['B1G1','Buy 1 Get 1','Cheapest item free when you order 2 or more'],['WEEKEND15','Weekend Specials','15% OFF up to ₹150 on orders above ₹299']];
const doSearch=q=>{q=q.toLowerCase().trim();const m=s=>s.toLowerCase().includes(q);return{cats:CATS.filter(m),states:STATES.filter(s=>m(s.n)||F.some(f=>f.st===s.id&&m(f.n))),dishes:F.filter(f=>m(f.n)||m(f.cat)||(f.st&&m(sn(f.st)))),rests:R.filter(r=>m(r.name)||m(r.cuisine)||r.cats.some(m))}};
function calc(cart,coupon){const lines=Object.entries(cart.items).map(([id,q])=>({f:F[id],q})),sub=lines.reduce((a,l)=>a+l.f.p*l.q,0),qn=lines.reduce((a,l)=>a+l.q,0),c=COUP[coupon];let disc=0,note='';
if(c&&sub){if(sub<c.min)note=`Add ${$(c.min-sub)} more to use ${coupon}`;else if(c.t==='p')disc=Math.min(sub*c.v/100,c.max);else if(c.t==='f')disc=c.v;else if(c.t==='b'){if(qn>=2)disc=Math.min(...lines.map(l=>l.f.p));else note='Add 2 items to use '+coupon}}
const del=!sub||sub>=499||(c&&c.t==='d')?0:40,tax=(sub-disc)*.05;return{lines,qn,sub,disc,del,tax,note,total:sub-disc+del+tax}}
const RH={'Royal Biryani House':'Chicken or mutton biryani served in a handi','Hyderabad Spice Kitchen':'Hyderabadi dum biryani with mirchi ka salan','Deccan Dum Biryani':'Dum biryani, sealed pot being opened','Biryani Junction':'Biryani with raita and a meal spread','Nawabi Kitchen':'Mughlai spread: kebabs, curry and naan','The Biryani Story':'Biryani with seekh kebabs','Dosa Darbar':'Dosa, idli and vada tiffin spread','Slice & Co':'Pizza and burger spread','Dragon Wok':'Momos and noodles','Sweet Tooth Bakery':'Cakes and Indian desserts'};
/* Every image the site needs. Used by the Assets page, scripts/check-images.mjs and IMAGE_MANIFEST.md */
const IMAGES=[{path:'/images/hero/hero-spread.jpg',kind:'hero',label:'Hero background',hint:'Wide landscape Indian food spread, at least 1920px wide'},
...CATS.map(c=>({path:catImg(c),kind:'category',label:c,hint:'Close-up of '+c})),
...STATES.map(s=>({path:s.img,kind:'state',label:s.n,hint:'Signature dish of '+s.n})),
...R.map(r=>({path:r.img,kind:'restaurant',label:r.name,hint:RH[r.name]})),
...F.map(f=>({path:f.img,kind:'dish',label:f.n,hint:'Appetising photo of '+f.n+(f.st?' ('+sn(f.st)+')':'')}))];
export {CATS,LOCS,STATES,sn,F,R,COUP,OFFERS,doSearch,calc,$,slug,catImg,IMAGES};
