import { React, h, C, go, useState, useEffect, useContext } from '../lib/helpers.js';

const API = 'http://localhost:5000/api';

function Admin() {
  const { user } = useContext(C);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name:'', price:'', category:'', image:'', description:'', isVeg:true, state:'Karnataka', restaurant:'CRAVINGS Restaurant', available:true });

  const token = () => localStorage.getItem('cravings_token');
  const headers = () => ({ 'Content-Type':'application/json', Authorization:`Bearer ${token()}` });

  const load = async () => {
    try {
      const [fr, or] = await Promise.all([
        fetch(`${API}/foods`),
        fetch(`${API}/orders/admin/all`, { headers: headers() })
      ]);
      const fd = await fr.json();
      const od = await or.json();
      if (!fr.ok) throw new Error(fd.message || 'Food load failed');
      if (!or.ok) throw new Error(od.message || 'Order load failed');
      setFoods(Array.isArray(fd) ? fd : []);
      setOrders(Array.isArray(od) ? od : []);
    } catch (e) { setMessage(e.message || 'Unable to load admin data.'); }
  };

  useEffect(() => { if (user?.role === 'admin') load(); }, [user]);

  if (!user) return h('div',{className:'wrap sec'},h('div',{className:'card pad'},h('h2',null,'Admin Login Required'),h('button',{className:'btn',onClick:()=>go('/login')},'Login')));
  if (user.role !== 'admin') return h('div',{className:'wrap sec'},h('div',{className:'warn'},'Admin access required.'),h('button',{className:'btn',onClick:()=>go('/')},'Back Home'));

  const reset = () => { setEditing(null); setForm({ name:'', price:'', category:'', image:'', description:'', isVeg:true, state:'Karnataka', restaurant:'CRAVINGS Restaurant', available:true }); };

  const saveFood = async () => {
    try {
      const payload = { ...form, price:Number(form.price) };
      const url = editing ? `${API}/foods/${editing}` : `${API}/foods`;
      const method = editing ? 'PUT' : 'POST';
      const r = await fetch(url,{method,headers:headers(),body:JSON.stringify(payload)});
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Food save failed');
      setMessage(editing ? 'Food updated successfully.' : 'Food added successfully.');
      reset(); await load();
    } catch(e){ setMessage(e.message || 'Food save failed.'); }
  };

  const removeFood = async id => {
    if (!window.confirm('Delete this food item?')) return;
    const r = await fetch(`${API}/foods/${id}`,{method:'DELETE',headers:headers()});
    const d = await r.json();
    setMessage(r.ok ? 'Food deleted.' : (d.message || 'Delete failed.'));
    await load();
  };

  const toggleFood = async f => {
    const r = await fetch(`${API}/foods/${f._id}`,{method:'PUT',headers:headers(),body:JSON.stringify({available:!f.available})});
    const d = await r.json();
    setMessage(r.ok ? 'Availability updated.' : (d.message || 'Update failed.'));
    await load();
  };

  const status = async (id, orderStatus) => {
    const r = await fetch(`${API}/orders/admin/${id}/status`,{method:'PUT',headers:headers(),body:JSON.stringify({orderStatus})});
    const d = await r.json();
    setMessage(r.ok ? `Order status changed to ${orderStatus}.` : (d.message || 'Status update failed.'));
    await load();
  };

  const input = (k,label,type='text') => h('div',null,h('label',null,label),h('input',{type,value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})}));

  return h('div',{className:'wrap sec'},
    h('div',{className:'row sp'},h('div',null,h('h1',{style:{fontSize:34,margin:0}},'CRAVINGS Admin Dashboard'),h('p',{className:'mut'},user.email)),h('button',{className:'btn out',onClick:()=>go('/')},'Back to Store')),
    message && h('div',{className:'tag',style:{margin:'14px 0',display:'block'}},message),
    h('div',{className:'tabs',style:{marginTop:16}},
      h('button',{className:'chip'+(tab==='orders'?' on':''),onClick:()=>setTab('orders')},`Orders (${orders.length})`),
      h('button',{className:'chip'+(tab==='foods'?' on':''),onClick:()=>setTab('foods')},`Food (${foods.length})`),
      h('button',{className:'chip',onClick:()=>{reset();setTab('foods');}},'Add Food')
    ),
    tab==='orders' ? h('div',{style:{marginTop:16}},
      orders.length ? orders.map(o=>h('div',{className:'card pad',style:{marginBottom:12},key:o._id},
        h('div',{className:'row sp'},h('b',null,`Order ${o._id}`),h('b',null,`₹${o.totalAmount}`)),
        h('p',{className:'mut'},(o.items||[]).map(i=>`${i.name} × ${i.quantity}`).join(', ')),
        h('p',null,'Customer: ',h('b',null,o.user?.name || o.user || 'User'),' · ',o.user?.email || ''),
        h('p',{className:'mut'},'Address: '+o.deliveryAddress),
        h('div',{className:'row g'},
          h('select',{value:o.orderStatus,onChange:e=>status(o._id,e.target.value)},['Placed','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'].map(s=>h('option',{key:s,value:s},s))),
          h('span',{className:'tag'},o.paymentMethod || 'COD')
        )
      )) : h('p',{className:'mut'},'No orders yet.')
    ) : h('div',{style:{marginTop:16}},
      h('div',{className:'card pad',style:{marginBottom:16}},
        h('h3',null,editing?'Edit Food':'Add Food'),
        h('div',{className:'f2'},input('name','Food name'),input('price','Price','number'),input('category','Category'),input('image','Image URL'),input('state','State'),input('restaurant','Restaurant'),input('description','Description')),
        h('label',null,h('input',{type:'checkbox',checked:!!form.isVeg,onChange:e=>setForm({...form,isVeg:e.target.checked})}),' Vegetarian'),
        h('label',null,h('input',{type:'checkbox',checked:!!form.available,onChange:e=>setForm({...form,available:e.target.checked})}),' Available'),
        h('div',{className:'row g'},h('button',{className:'btn',onClick:saveFood},editing?'Save Changes':'Add Food'),h('button',{className:'btn out',onClick:reset},'Clear'))
      ),
      foods.map(f=>h('div',{className:'card pad',style:{marginBottom:10},key:f._id},
        h('div',{className:'row sp'},h('b',null,f.name),h('b',null,`₹${f.price}`)),
        h('p',{className:'mut'},`${f.category || 'Food'} · ${f.isVeg?'Veg':'Non-Veg'} · ${f.state || ''}`),
        h('div',{className:'row g'},
          h('button',{className:'chip',onClick:()=>{setEditing(f._id);setForm({name:f.name||'',price:f.price||'',category:f.category||'',image:f.image||'',description:f.description||'',isVeg:!!f.isVeg,state:f.state||'Karnataka',restaurant:f.restaurant||'CRAVINGS Restaurant',available:f.available!==false});window.scrollTo({top:0,behavior:'smooth'});}},'Edit'),
          h('button',{className:'chip',onClick:()=>toggleFood(f)},f.available===false?'Mark Available':'Mark Out of Stock'),
          h('button',{className:'chip',onClick:()=>removeFood(f._id)},'Delete')
        )
      ))
    )
  );
}

export { Admin };
