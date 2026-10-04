import {
  React,
  h,
  C,
  $, 
  go,
  A,
  useLS,
  useHash,
  useState,
  useEffect,
  useContext
} from './lib/helpers.js';

import {
  CATS,
  LOCS,
  STATES,
  sn,
  F,
  R,
  COUP,
  OFFERS,
  doSearch,
  calc,
  catImg
} from './data/catalog.js';

import { heroUri } from './components/art.js';

import {
  Home,
  Discover,
  Menu,
  Rest,
  Regional,
  State,
  Search,
  Offers,
  Cart,
  Checkout,
  Order,
  Auth,
  Profile,
  Favs,
  Admin,
  NF,
  EB
} from './pages/pages.js';

import { Nav, Footer } from './components/Layout.js';
import { Assets } from './pages/Assets.js';

import {
  getFoods,
  loginUser,
  registerUser,
  createOrder
} from './services/api.js';

function MissingBanner() {
  const [n, setN] = useState(0);

  useEffect(() => {
    const f = () => setN(window.__missing ? window.__missing.size : 0);
    addEventListener('cr-missing', f);
    f();
    return () => removeEventListener('cr-missing', f);
  }, []);

  return import.meta.env && import.meta.env.DEV && n
    ? A('/assets', { className: 'mbar' }, n + ' photo' + (n > 1 ? 's' : '') + ' missing on this page. Open the image checklist.')
    : null;
}

function App() {
  const path = useHash();

  const [cart, setCart] = useLS('cr2_cart', { rid: 0, items: {} });
  const [favs, setFavs] = useLS('cr2_fav', { r: [], f: [] });
  const [user, setUser] = useLS('cr2_user', null);
  const [orders, setOrders] = useLS('cr2_orders', []);
  const [coupon, setCoupon] = useLS('cr2_coupon', '');
  const [loc, setLoc] = useLS('cr2_loc', 'Bengaluru');
  const [theme, setTheme] = useLS('cr2_theme', 'light');
  const [toast, setToast] = useState('');
  const [sp, setSp] = useState(0);
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    getFoods()
      .then(response => setFoods(Array.isArray(response.data) ? response.data : []))
      .catch(error => console.error('Failed to load foods from backend:', error));
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('cravings_token');
    const savedUser = localStorage.getItem('cr2_user');
    if (savedToken && savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const a = setTimeout(() => setSp(1), 1800);
    const b = setTimeout(() => setSp(2), 2300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const [, tk] = useState(0);
  useEffect(() => {
    const i = setInterval(() => tk(x => x + 1), 3000);
    return () => clearInterval(i);
  }, []);

  const notify = m => {
    setToast(m);
    setTimeout(() => setToast(''), 1800);
  };

  const add = (f, r) => {
    if (!r.open) return notify('Restaurant unavailable');
    if (cart.rid && cart.rid !== r.id && Object.keys(cart.items).length && !confirm('Your cart has items from another restaurant. Replace them?')) return;
    setCart(c => {
      const base = c.rid === r.id ? c.items : {};
      return { rid: r.id, items: { ...base, [f.id]: (base[f.id] || 0) + 1 } };
    });
    notify(f.n + ' added to cart');
  };

  const chg = (id, d) => setCart(c => {
    const q = (c.items[id] || 0) + d;
    const items = { ...c.items };
    if (q <= 0) delete items[id]; else items[id] = q;
    return { rid: Object.keys(items).length ? c.rid : 0, items };
  });

  const fav = (k, id) => {
    setFavs(x => ({ ...x, [k]: x[k].includes(id) ? x[k].filter(i => i !== id) : [...x[k], id] }));
    notify(favs[k].includes(id) ? 'Removed from favourites' : 'Saved to favourites');
  };

  const applyCoupon = c => {
    c = c.trim().toUpperCase();
    if (!COUP[c]) return notify('Invalid coupon code');
    setCoupon(c);
    notify(c + ' applied!');
  };

  const login = async (id, pw) => {
    try {
      const response = await loginUser({ email: id, password: pw });
      const data = response.data;
      if (!data.user || !data.token) return 'Login failed.';
      localStorage.setItem('cravings_token', data.token);
      localStorage.setItem('cr2_user', JSON.stringify(data.user));
      setUser(data.user);
      go(data.user.role === 'admin' ? '/admin' : '/profile');
    } catch (error) {
      return error.response?.data?.message || 'Invalid email or password.';
    }
  };

  const register = async f => {
    if (!f.name.trim()) return 'Enter your name.';
    if (!/\S+@\S+\.\S+/.test(f.email)) return 'Enter a valid email.';
    if (!/^\d{10}$/.test(f.phone)) return 'Enter a 10-digit phone number.';
    if (f.pw.length < 6) return 'Password must be 6+ characters.';
    if (f.pw !== f.pw2) return 'Passwords do not match.';
    try {
      const response = await registerUser({ name: f.name, email: f.email, password: f.pw, phone: f.phone });
      const data = response.data;
      if (!data.user) return 'Registration failed.';
      if (data.token) localStorage.setItem('cravings_token', data.token);
      localStorage.setItem('cr2_user', JSON.stringify(data.user));
      setUser(data.user);
      go('/profile');
    } catch (error) {
      return error.response?.data?.message || 'Registration failed.';
    }
  };

  const placeOrder = async (addr, pay, b) => {
    const token = localStorage.getItem('cravings_token');
    if (!token || !user) {
      notify('Please login before placing the order');
      go('/login');
      return;
    }

    const restaurant = R[cart.rid - 1] || { name: 'CRAVINGS Restaurant', time: 30 };
    const payload = {
      items: b.lines.map(l => ({
        food: typeof l.f.id === 'string' && l.f.id.length === 24 ? l.f.id : undefined,
        name: l.f.n,
        quantity: l.q,
        price: l.f.p
      })),
      totalAmount: b.total,
      deliveryAddress: typeof addr === 'string' ? addr : Object.values(addr || {}).filter(Boolean).join(', '),
      paymentMethod: pay === 'UPI' ? 'UPI' : pay === 'Card' ? 'Card' : 'COD'
    };

    try {
      const response = await createOrder(payload, token);
      const saved = response.data.order;
      const o = {
        id: saved?._id || ('CRV' + Date.now().toString().slice(-8)),
        rest: restaurant.name,
        rid: cart.rid,
        lines: b.lines.map(l => ({ fid: l.f.id, n: l.f.n, q: l.q, p: l.f.p })),
        total: b.total,
        addr,
        pay,
        at: Date.now(),
        eta: restaurant.time + 10,
        status: saved?.orderStatus || 'Placed',
        mongo: true
      };
      setOrders(x => [o, ...x]);
      setCart({ rid: 0, items: {} });
      setCoupon('');
      go('/order/' + o.id);
    } catch (error) {
      notify(error.response?.data?.message || 'Failed to place order');
    }
  };

  const logout = () => {
    localStorage.removeItem('cravings_token');
    localStorage.removeItem('cr2_user');
    setUser(null);
    go('/');
  };

  const count = Object.values(cart.items).reduce((a, b) => a + b, 0);
  const [p, a] = path.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);

  const P = {
    undefined: () => h(Home),
    menu: () => h(Menu),
    restaurants: () => h(Discover, { title: 'Restaurants near you', base: R }),
    category: () => CATS.includes(a) ? h(Discover, { title: a + ' Near You', base: R.filter(r => r.cats.includes(a)) }) : h(NF),
    restaurant: () => h(Rest, { id: +a }),
    regional: () => h(Regional),
    state: () => h(State, { id: a }),
    search: () => h(Search, { q: a || '' }),
    offers: () => h(Offers),
    cart: () => h(Cart),
    checkout: () => h(Checkout),
    order: () => h(Order, { id: a }),
    login: () => h(Auth),
    register: () => h(Auth, { reg: 1 }),
    profile: () => h(Profile),
    favorites: () => h(Favs),
    admin: () => h(Admin),
    assets: () => h(Assets)
  };

  const reorder = o => {
    if (!o.rid || !o.lines) return notify('This order cannot be reordered from the current restaurant data.');
    setCart({ rid: o.rid, items: Object.fromEntries(o.lines.map(l => [l.fid, l.q])) });
    go('/cart');
  };

  const ctx = {
    theme, setTheme, reorder, cart, setCart, add, chg, favs, fav, user, logout,
    orders, coupon, setCoupon, applyCoupon, loc, setLoc, count, login, register,
    placeOrder, foods, notify
  };

  return h(
    C.Provider,
    { value: ctx },
    sp < 2 && h('div', {
      className: 'splash' + (sp ? ' out' : ''),
      style: {
        backgroundImage: 'linear-gradient(rgba(10,42,31,.86),rgba(10,42,31,.86)),url("' + heroUri() + '")',
        backgroundSize: 'cover', backgroundPosition: 'center'
      }
    }, h('div', null, h('div', { className: 'plate' }), h('div', { className: 'logo' }, 'CRAVINGS'), h('p', null, 'Satisfy Your Hunger'), h('div', { className: 'bar' }, h('i')))),
    h(MissingBanner),
    h(Nav, { path: '/' + (p || '') }),
    h(EB, { key: path }, (P[p] || (() => h(NF)))()),
    h(Footer),
    (() => {
      const lo = orders[0];
      const st = lo ? Math.floor((Date.now() - lo.at) / 6000) : 9;
      return lo && st < 3 && p !== 'order' && A('/order/' + lo.id, { className: 'trk' }, 'Order ' + lo.id + ' · ' + ['Confirmed', 'Preparing', 'Out for delivery'][st] + ' · Track →');
    })(),
    count > 0 && p !== 'cart' && p !== 'checkout' && A('/cart', { className: 'sticky' }, `🛒 ${count} item${count > 1 ? 's' : ''} · View Cart`),
    toast && h('div', { className: 'toast', role: 'status' }, toast),
    h('div', { className: 'bn' }, [['/', '🏠', 'Home'], ['/menu', '🍴', 'Menu'], ['/regional', '🗺', 'Regional'], ['/cart', '🛒', 'Cart'], [user ? '/profile' : '/login', user ? '👤' : '🔐', user ? 'Profile' : 'Login'], ...(user?.role === 'admin' ? [['/admin', '⚙️', 'Admin']] : [])].map(([u, i, n]) => A(u, { key: u }, h('span', null, i), h('small', null, n))))
  );
}

export default App;
