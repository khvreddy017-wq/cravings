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
} from '../lib/helpers.js';

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
} from '../data/catalog.js';

import { artUri, heroUri } from '../components/art.js';

import {
  Photo,
  Dot,
  Rate,
  Sec,
  Empty,
  Add,
  FoodCard,
  Dish,
  RestCard,
  SearchBar
} from '../components/ui.js';


// Convert MongoDB food data into the format used by the existing UI
function mongoFood(f) {
  return {
    id: f._id,
    n: f.name,
    p: f.price,
    img: f.image,
    cat: f.category,
    veg: f.isVeg,
    st: f.state,
    restaurant: f.restaurant,
    d: f.description,
    available: f.available
  };
}


// HOME
function Home() {
  const {
    loc,
    setLoc,
    foods = []
  } = useContext(C);

  const mongoFoods = foods.map(mongoFood);

  const popularFoods =
    mongoFoods.length > 0
      ? mongoFoods.slice(0, 4)
      : ['Margherita Pizza', 'Chicken Biryani', 'Classic Burger', 'Masala Dosa']
          .map(n => F.find(f => f.n === n))
          .filter(Boolean);

  return h(
    'div',
    null,

    h(
      'section',
      {
        className: 'hero',
        style: {
          backgroundImage: 'url("' + heroUri() + '")'
        }
      },

      h(
        'div',
        { className: 'wrap' },

        h(
          'h1',
          null,
          'Cravings? We’ve got you covered.'
        ),

        h(
          'p',
          null,
          'Hyderabadi biryani, Udupi dosa, Gujarati thali — hot at your door in ' +
            loc +
            '.'
        ),

        h(
          'div',
          {
            className: 'row',
            style: { marginTop: 14 }
          },
          '📍',

          h(
            'select',
            {
              value: loc,
              'aria-label': 'Location',
              onChange: e => setLoc(e.target.value)
            },

            LOCS.map(l =>
              h(
                'option',
                { key: l },
                l
              )
            )
          )
        ),

        h(SearchBar),

        h(
          'div',
          {
            className: 'row g'
          },

          h(
            'button',
            {
              className: 'btn',
              onClick: () => go('/restaurants')
            },
            'Order Now'
          ),

          h(
            'button',
            {
              className: 'btn ghost',
              onClick: () => go('/menu')
            },
            'Explore Menu'
          ),

          h(
            'button',
            {
              className: 'btn ghost',
              onClick: () => {
                const f =
                  F[Math.floor(Math.random() * F.length)];

                const rs =
                  R.filter(
                    r =>
                      r.open &&
                      r.cats.includes(f.cat)
                  );

                const r =
                  rs[
                    Math.floor(
                      Math.random() * rs.length
                    )
                  ];

                if (r) {
                  go('/restaurant/' + r.id);
                }
              }
            },
            'Surprise Me'
          )
        )
      )
    ),

    h(
      Sec,
      { t: 'What are you craving?' },

      h(
        'div',
        { className: 'scroll' },

        CATS.map(c =>
          A(
            '/category/' + c,
            {
              key: c,
              className: 'cat'
            },

            h(
              Photo,
              {
                src: catImg(c),
                alt: c,
                cls: 'circ'
              }
            ),

            c
          )
        )
      )
    ),

    h(
      Sec,
      {
        t: 'Popular Near You',
        to: '/menu'
      },

      h(
        'div',
        { className: 'grid' },

        popularFoods.map(f =>
          h(
            Dish,
            {
              key: f.id,
              f
            }
          )
        )
      )
    ),

    h(
      Sec,
      {
        t: 'Top restaurants near you',
        to: '/restaurants'
      },

      h(
        'div',
        { className: 'grid' },

        R.slice(0, 6).map(r =>
          h(
            RestCard,
            {
              key: r.id,
              r
            }
          )
        )
      )
    ),

    h(
      Sec,
      {
        t: 'Regional Flavours',
        to: '/regional'
      },

      h(
        'div',
        { className: 'scroll' },

        STATES.map(s =>
          A(
            '/state/' + s.id,
            {
              key: s.id,
              className: 'cat'
            },

            h(
              Photo,
              {
                src: s.img,
                alt: s.n,
                cls: 'circ'
              }
            ),

            s.n
          )
        )
      )
    ),

    h(
      Sec,
      {
        t: 'Offers for you',
        to: '/offers'
      },

      h(
        'div',
        { className: 'grid' },

        OFFERS.slice(0, 3).map(o =>
          h(
            OfferCard,
            {
              key: o[0],
              o
            }
          )
        )
      )
    )
  );
}


// RESTAURANT DISCOVERY
function Discover({ title, sub, base }) {
  const [
    f,
    setF
  ] = useState({
    rating: 0,
    fast: 0,
    veg: 0,
    non: 0,
    offer: 0,
    near: 0,
    price: 0,
    cuisine: '',
    sort: 'rel'
  });

  const t = k =>
    setF({
      ...f,
      [k]: !f[k]
    });

  const cu = [
    ...new Set(
      base.flatMap(
        r => r.cuisine.split(', ')
      )
    )
  ];

  let l = base.filter(
    r =>
      (!f.rating || r.rating >= 4.3) &&
      (!f.fast || r.time <= 30) &&
      (!f.veg || r.pv) &&
      (!f.non || r.nv) &&
      (!f.offer || r.offer) &&
      (!f.near || r.dist <= 3) &&
      (!f.price || r.two <= +f.price) &&
      (!f.cuisine || r.cuisine.includes(f.cuisine))
  );

  l = [...l].sort(
    {
      rel: () => 0,
      rating: (a, b) => b.rating - a.rating,
      time: (a, b) => a.time - b.time,
      lo: (a, b) => a.two - b.two,
      hi: (a, b) => b.two - a.two
    }[f.sort]
  );

  const Ch = ([k, n]) =>
    h(
      'button',
      {
        key: k,
        className: 'chip' + (f[k] ? ' on' : ''),
        onClick: () => t(k)
      },
      n
    );

  return h(
    'div',
    {
      className: 'wrap sec'
    },

    h(
      'h1',
      { style: { fontSize: 36 } },
      title
    ),

    h(
      'p',
      { className: 'mut' },
      sub || l.length + ' restaurants'
    ),

    h(
      'div',
      { className: 'filters' },

      [
        ['rating', 'Rating 4.3+'],
        ['fast', 'Under 30 min'],
        ['veg', 'Pure Veg'],
        ['non', 'Non-Veg'],
        ['offer', 'Offers'],
        ['near', 'Within 3 km']
      ].map(Ch),

      h(
        'select',
        {
          'aria-label': 'Cuisine',
          value: f.cuisine,
          onChange: e =>
            setF({
              ...f,
              cuisine: e.target.value
            })
        },

        h(
          'option',
          { value: '' },
          'All cuisines'
        ),

        cu.map(c =>
          h(
            'option',
            {
              key: c
            },
            c
          )
        )
      ),

      h(
        'select',
        {
          'aria-label': 'Price',
          value: f.price,
          onChange: e =>
            setF({
              ...f,
              price: e.target.value
            })
        },

        h(
          'option',
          { value: 0 },
          'Any price'
        ),

        h(
          'option',
          { value: 300 },
          'Up to ₹300'
        ),

        h(
          'option',
          { value: 400 },
          'Up to ₹400'
        )
      ),

      h(
        'select',
        {
          'aria-label': 'Sort',
          value: f.sort,
          onChange: e =>
            setF({
              ...f,
              sort: e.target.value
            })
        },

        [
          ['rel', 'Relevance'],
          ['rating', 'Rating'],
          ['time', 'Delivery time'],
          ['lo', 'Price: Low to High'],
          ['hi', 'Price: High to Low']
        ].map(([v, n]) =>
          h(
            'option',
            {
              key: v,
              value: v
            },
            n
          )
        )
      )
    ),

    l.length
      ? h(
          'div',
          { className: 'grid' },
          l.map(r =>
            h(
              RestCard,
              {
                key: r.id,
                r
              }
            )
          )
        )
      : h(
          Empty,
          {
            t: 'No restaurants match',
            d: 'Try removing a filter.'
          }
        )
  );
}


// MENU
function Menu() {
  const {
    foods = []
  } = useContext(C);

  const [
    c,
    setC
  ] = useState('');

  const [
    v,
    setV
  ] = useState(false);

  const mongoFoods =
    foods.map(mongoFood);

  const sourceFoods =
    mongoFoods.length
      ? mongoFoods
      : F;

  const l =
    sourceFoods.filter(
      f =>
        (!c || f.cat === c) &&
        (!v || f.veg)
    );

  return h(
    'div',
    {
      className: 'wrap sec'
    },

    h(
      'h1',
      {
        style: { fontSize: 36 }
      },
      'Menu'
    ),

    h(
      'p',
      {
        className: 'mut'
      },
      'Pick a dish, then choose a restaurant.'
    ),

    h(
      'div',
      {
        className: 'filters'
      },

      h(
        'button',
        {
          className: 'chip' + (v ? ' on' : ''),
          onClick: () => setV(!v)
        },
        'Veg only'
      ),

      ['', ...CATS].map(x =>
        h(
          'button',
          {
            key: x,
            className: 'chip' + (c === x ? ' on' : ''),
            onClick: () => setC(x)
          },
          x || 'All'
        )
      )
    ),

    h(
      'div',
      {
        className: 'grid'
      },

      l.map(f =>
        h(
          Dish,
          {
            key: f.id,
            f
          }
        )
      )
    )
  );
}


// RESTAURANT
function Rest({ id }) {
  const {
    favs,
    fav,
    loc
  } = useContext(C);

  const r = R[id - 1];

  if (!r) {
    return h(NF);
  }

  const gs =
    CATS.filter(
      c => r.menu.some(f => f.cat === c)
    );

  return h(
    'div',
    null,

    h(
      Photo,
      {
        src: r.img,
        alt: r.name,
        cls: 'banner'
      }
    ),

    h(
      'div',
      {
        className: 'wrap sec'
      },

      h(
        'div',
        {
          className: 'row sp'
        },

        h(
          'h1',
          {
            style: { fontSize: 34 }
          },
          r.name
        ),

        h(
          'button',
          {
            className: 'btn sm out',
            onClick: () => fav('r', r.id)
          },
          favs.r.includes(r.id)
            ? '♥ Saved'
            : '♡ Favourite'
        )
      ),

      h(
        'div',
        {
          className: 'row'
        },

        h(Rate, {
          v: r.rating
        }),

        h(
          'span',
          {
            className: 'mut'
          },
          `${r.n} ratings · ${r.cuisine} · ${r.time} min · ${$(r.two)} for two`
        )
      ),

      h(
        'p',
        {
          className: 'mut'
        },
        '📍 ' +
          r.addr +
          ', ' +
          loc +
          ' · ' +
          (r.pv
            ? 'Pure veg'
            : 'Veg & non-veg')
      ),

      h(
        'p',
        null,
        `${r.name} serves ${r.cuisine.toLowerCase()} favourites, cooked fresh and delivered hot.`
      ),

      r.offer &&
        h(
          'span',
          {
            className: 'tag'
          },
          '🏷 ' + r.offer
        ),

      !r.open &&
        h(
          'div',
          {
            className: 'warn'
          },
          'This restaurant is currently unavailable. You can browse the menu but ordering is paused.'
        ),

      h(
        'div',
        {
          className: 'filters',
          style: { marginTop: 16 }
        },

        gs.map(c =>
          h(
            'button',
            {
              key: c,
              className: 'chip',
              onClick: () =>
                document
                  .getElementById('m-' + c)
                  .scrollIntoView()
            },
            c
          )
        )
      ),

      gs.map(c =>
        h(
          'div',
          {
            key: c,
            id: 'm-' + c
          },

          h(
            'h2',
            null,
            c.toUpperCase()
          ),

          h(
            'div',
            {
              className: 'grid',
              style: {
                marginBottom: 24
              }
            },

            r.menu
              .filter(f => f.cat === c)
              .map(f =>
                h(
                  FoodCard,
                  {
                    key: f.id,
                    f,
                    r
                  }
                )
              )
          )
        )
      )
    )
  );
}


// REGIONAL
function Regional() {
  const g = n =>
    h(
      'div',
      {
        className: 'grid'
      },

      STATES
        .filter(n)
        .map(s =>
          A(
            '/state/' + s.id,
            {
              key: s.id,
              className: 'card'
            },

            h(
              Photo,
              {
                src: s.img,
                alt: s.n
              }
            ),

            h(
              'div',
              {
                className: 'pad'
              },

              h(
                'h3',
                {
                  style: { margin: 0 }
                },
                s.n
              ),

              h(
                'p',
                {
                  className: 'mut'
                },
                s.d
              ),

              h(
                'div',
                {
                  className: 'row'
                },

                F
                  .filter(f => f.st === s.id)
                  .slice(0, 3)
                  .map(f =>
                    h(
                      'span',
                      {
                        key: f.id,
                        className: 'tag'
                      },
                      f.n
                    )
                  )
              )
            )
          )
        )
    );

  return h(
    'div',
    {
      className: 'wrap sec'
    },

    h(
      'h1',
      null,
      'Regional Flavours'
    ),

    h(
      'p',
      {
        className: 'mut'
      },
      'Choose a state → pick a dish → order from a restaurant.'
    ),

    h(
      'h2',
      {
        style: { marginTop: 20 }
      },
      'South India'
    ),

    g(s => s.reg === 'South'),

    h(
      'h2',
      {
        style: { marginTop: 28 }
      },
      'North, West & East'
    ),

    g(s => s.reg !== 'South')
  );
}


// STATE
function State({ id }) {
  const s =
    STATES.find(x => x.id === id);

  if (!s) {
    return h(NF);
  }

  return h(
    'div',
    {
      className: 'wrap sec'
    },

    A(
      '/regional',
      {
        className: 'mut'
      },
      '← All regions'
    ),

    h(
      'h1',
      null,
      s.n
    ),

    h(
      'p',
      {
        className: 'mut'
      },
      s.d
    ),

    h(
      'div',
      {
        className: 'grid',
        style: { marginTop: 16 }
      },

      F
        .filter(f => f.st === id)
        .map(f =>
          h(
            Dish,
            {
              key: f.id,
              f
            }
          )
        )
    )
  );
}


// SEARCH
function Search({ q = '' }) {
  const { foods = [] } = useContext(C);
  const k = q.trim().toLowerCase();
  const mongoFoods = foods.map(mongoFood);
  const mongoMatches = k
    ? mongoFoods.filter(f => [f.n, f.cat, f.st, f.restaurant, f.d].filter(Boolean).join(' ').toLowerCase().includes(k))
    : [];
  const s = k ? doSearch(q) : null;
  const dishes = [
    ...mongoMatches,
    ...(s?.dishes || []).filter(x => !mongoMatches.some(m => String(m.id) === String(x.id)))
  ];

  return h('div', { className: 'wrap sec' },
    h('h1', { style: { fontSize: 34 } }, k ? `Results for “${q}”` : 'Search'),
    h(SearchBar, { key: q, init: q }),

    !k && h('div', { className: 'filters', style: { marginTop: 20 } },
      ['Biryani', 'Pizza', 'Burgers', 'Dosa', 'Hyderabad', 'Thali'].map(x =>
        h('button', { key: x, className: 'chip', onClick: () => go('/search/' + x) }, x)
      )
    ),

    k && !dishes.length && !s?.rests?.length && !s?.cats?.length && !s?.states?.length
      ? h(Empty, { big: '🔍', t: 'No results found', d: 'Try a food name, category, state or restaurant.', to: '/menu', b: 'Browse Menu' })
      : k && h('div', { style: { marginTop: 20 } },
          (s?.cats?.length || s?.states?.length) && h('div', { className: 'filters' },
            (s?.cats || []).map(c => A('/category/' + c, { key: c, className: 'chip' }, 'Category: ' + c)),
            (s?.states || []).map(x => A('/state/' + x.id, { key: x.id, className: 'chip' }, 'Region: ' + x.n))
          ),
          s?.rests?.length > 0 && [
            h('h2', { key: 'rh' }, 'Restaurants'),
            h('div', { key: 'rg', className: 'grid' }, s.rests.map(r => h(RestCard, { key: r.id, r })))
          ],
          dishes.length > 0 && [
            h('h2', { key: 'dh', style: { marginTop: 24 } }, 'Dishes'),
            h('div', { key: 'dg', className: 'grid' }, dishes.slice(0, 24).map(f => h(Dish, { key: f.id, f })))
          ]
        )
  );
}

// OFFER CARD
function OfferCard({ o }) {
  const {
    applyCoupon,
    coupon
  } = useContext(C);

  return h(
    'div',
    {
      className: 'offer'
    },

    h(
      'h3',
      {
        style: { margin: 0 }
      },
      o[1]
    ),

    h(
      'p',
      null,
      o[2]
    ),

    h(
      'code',
      null,
      o[0]
    ),

    h(
      'button',
      {
        className: 'btn sm',
        onClick: () =>
          applyCoupon(o[0])
      },
      coupon === o[0]
        ? '✓ Applied'
        : 'Apply Offer'
    )
  );
}


// OFFERS
function Offers() {
  return h(
    'div',
    {
      className: 'wrap sec'
    },

    h(
      'h1',
      null,
      'Offers'
    ),

    h(
      'p',
      {
        className: 'mut'
      },
      'Apply a code and it will be used in your cart.'
    ),

    h(
      'div',
      {
        className: 'grid'
      },

      OFFERS.map(o =>
        h(
          OfferCard,
          {
            key: o[0],
            o
          }
        )
      )
    ),

    h(
      'div',
      {
        style: { marginTop: 20 }
      },

      h(
        'button',
        {
          className: 'btn',
          onClick: () => go('/cart')
        },
        'Go to Cart'
      )
    )
  );
}


// CART
function Cart() {
  const {
    cart,
    chg,
    setCart,
    coupon,
    applyCoupon,
    setCoupon
  } = useContext(C);

  const [
    c,
    setC
  ] = useState('');

  const b = calc(
    cart,
    coupon
  );

  const r =
    R[cart.rid - 1];

  if (!b.lines.length) {
    return h(
      Empty,
      {
        big: '🛒',
        t: 'Your cart is empty',
        d: 'Good food is always cooking. Go ahead, order some.',
        to: '/restaurants',
        b: 'Explore Food'
      }
    );
  }

  return h(
    'div',
    {
      className: 'wrap sec'
    },

    h(
      'h1',
      {
        style: { fontSize: 34 }
      },
      'Your Cart'
    ),

    h(
      'p',
      null,
      'from ',

      A(
        '/restaurant/' + r.id,
        {
          className: 'tag'
        },
        r.name
      )
    ),

    h(
      'div',
      {
        className: 'two'
      },

      h(
        'div',
        {
          className: 'card pad'
        },

        b.lines.map(
          ({ f, q }) =>
            h(
              'div',
              {
                className: 'line',
                key: f.id
              },

              h(
                Photo,
                {
                  src: f.img,
                  alt: f.n,
                  cls: 'sm'
                }
              ),

              h(
                'div',
                null,

                h(
                  'div',
                  {
                    className: 'row'
                  },

                  h(Dot, {
                    v: f.veg
                  }),

                  h(
                    'b',
                    null,
                    f.n
                  )
                ),

                h(
                  'div',
                  {
                    className: 'mut'
                  },
                  $(f.p)
                )
              ),

              h(
                'div',
                {
                  className: 'qty'
                },

                h(
                  'button',
                  {
                    onClick: () =>
                      chg(f.id, -1)
                  },
                  '−'
                ),

                h(
                  'b',
                  null,
                  q
                ),

                h(
                  'button',
                  {
                    onClick: () =>
                      chg(f.id, 1)
                  },
                  '+'
                )
              ),

              h(
                'b',
                null,
                $(f.p * q)
              ),

              h(
                'button',
                {
                  className: 'chip',
                  onClick: () =>
                    chg(f.id, -q)
                },
                'Remove'
              )
            )
        ),

        h(
          'button',
          {
            className: 'chip',
            style: { marginTop: 12 },
            onClick: () =>
              setCart({
                rid: 0,
                items: {}
              })
          },
          'Clear cart'
        )
      ),

      h(
        'div',
        {
          className: 'card pad bill'
        },

        h(
          'h3',
          {
            style: { margin: '0 0 8px' }
          },
          'Bill details'
        ),

        h(
          'div',
          {
            className: 'row'
          },

          h(
            'input',
            {
              placeholder: 'Coupon code',
              value: c,
              onChange: e =>
                setC(
                  e.target.value.toUpperCase()
                ),
              style: {
                flex: 1,
                minWidth: 0
              }
            }
          ),

          h(
            'button',
            {
              className: 'btn sm',
              onClick: () => {
                applyCoupon(c);
                setC('');
              }
            },
            'Apply'
          )
        ),

        coupon &&
          h(
            'div',
            null,

            h(
              'span',
              {
                className: 'tag'
              },
              coupon + ' applied'
            ),

            h(
              'button',
              {
                className: 'chip',
                onClick: () =>
                  setCoupon('')
              },
              '✕'
            )
          ),

        b.note &&
          h(
            'div',
            {
              className: 'err'
            },
            b.note
          ),

        h(
          'div',
          null,
          'Subtotal',
          h(
            'span',
            null,
            $(b.sub)
          )
        ),

        h(
          'div',
          null,
          'Delivery fee',
          h(
            'span',
            null,
            b.del
              ? $(b.del)
              : 'FREE'
          )
        ),

        h(
          'div',
          null,
          'Taxes (5%)',
          h(
            'span',
            null,
            $(b.tax)
          )
        ),

        h(
          'div',
          null,
          'Discount',
          h(
            'span',
            {
              style: {
                color: 'var(--ok)'
              }
            },
            '−' + $(b.disc)
          )
        ),

        h(
          'div',
          {
            className: 't'
          },
          'Total',
          h(
            'span',
            null,
            $(b.total)
          )
        ),

        h(
          'button',
          {
            className: 'btn full',
            onClick: () =>
              go('/checkout')
          },
          'Proceed to Checkout'
        )
      )
    )
  );
}


// CHECKOUT
function Checkout() {
  const {
    cart,
    coupon,
    user,
    placeOrder
  } = useContext(C);

  const b =
    calc(cart, coupon);

  const [
    a,
    setA
  ] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    house: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pin: ''
  });

  const [
    pay,
    setPay
  ] = useState(
    'Cash on Delivery'
  );

  const [
    er,
    setEr
  ] = useState({});

  if (!b.lines.length) {
    return h(
      Empty,
      {
        big: '🛒',
        t: 'Nothing to checkout',
        d: 'Add some food first.',
        to: '/restaurants',
        b: 'Explore Food'
      }
    );
  }

  const sub = () => {
    const e = {};

    [
      'name',
      'house',
      'street',
      'area',
      'city',
      'state'
    ].forEach(
      k =>
        !a[k].trim() &&
        (e[k] = 'Required')
    );

    if (!/^\d{10}$/.test(a.phone)) {
      e.phone =
        'Enter a 10-digit number';
    }

    if (!/^\d{6}$/.test(a.pin)) {
      e.pin =
        'Enter a 6-digit PIN';
    }

    setEr(e);

    if (!Object.keys(e).length) {
      placeOrder(
        a,
        pay,
        b
      );
    }
  };

  const I = (k, l, w) =>
    h(
      'div',
      {
        className: w ? 'w' : ''
      },

      h(
        'label',
        null,
        l
      ),

      h(
        'input',
        {
          value: a[k],
          onChange: e =>
            setA({
              ...a,
              [k]: e.target.value
            })
        }
      ),

      er[k] &&
        h(
          'div',
          {
            className: 'err'
          },
          er[k]
        )
    );

  return h(
    'div',
    {
      className: 'wrap sec'
    },

    h(
      'h1',
      {
        style: { fontSize: 34 }
      },
      'Checkout'
    ),

    h(
      'div',
      {
        className: 'two'
      },

      h(
        'div',
        null,

        h(
          'div',
          {
            className: 'card pad'
          },

          h(
            'h3',
            null,
            'Delivery address'
          ),

          h(
            'div',
            {
              className: 'f2'
            },

            I('name', 'Name'),
            I('phone', 'Phone'),
            I('house', 'House / Flat', 1),
            I('street', 'Street'),
            I('area', 'Area'),
            I('city', 'City'),
            I('state', 'State'),
            I('pin', 'PIN code')
          )
        ),

        h(
          'div',
          {
            className: 'card pad',
            style: {
              marginTop: 16
            }
          },

          h(
            'h3',
            null,
            'Payment method'
          ),

          [
            'Cash on Delivery',
            'UPI',
            'Credit / Debit Card',
            'Wallet'
          ].map(p =>
            h(
              'label',
              {
                key: p,
                style: {
                  padding: '6px 0',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }
              },

              h(
                'input',
                {
                  type: 'radio',
                  checked: pay === p,
                  onChange: () =>
                    setPay(p)
                }
              ),

              ' ' + p
            )
          ),

          h(
            'p',
            {
              className: 'mut'
            },
            'Demo only — no real payment is processed.'
          )
        )
      ),

      h(
        'div',
        {
          className: 'card pad bill'
        },

        h(
          'h3',
          {
            style: {
              margin: '0 0 8px'
            }
          },
          'Order summary'
        ),

        b.lines.map(
          ({ f, q }) =>
            h(
              'div',
              {
                key: f.id
              },

              f.n +
                ' × ' +
                q,

              h(
                'span',
                null,
                $(f.p * q)
              )
            )
        ),

        h(
          'div',
          null,
          'Delivery',
          h(
            'span',
            null,
            b.del
              ? $(b.del)
              : 'FREE'
          )
        ),

        h(
          'div',
          null,
          'Taxes',
          h(
            'span',
            null,
            $(b.tax)
          )
        ),

        h(
          'div',
          null,
          'Discount',
          h(
            'span',
            null,
            '−' + $(b.disc)
          )
        ),

        h(
          'div',
          {
            className: 't'
          },
          'To pay',
          h(
            'span',
            null,
            $(b.total)
          )
        ),

        h(
          'button',
          {
            className: 'btn full',
            onClick: sub
          },
          'Place Order'
        )
      )
    )
  );
}


// ORDER
function Order({ id }) {
  const { orders } = useContext(C);

  const [serverOrder, setServerOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      const token = localStorage.getItem('cravings_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/${id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Order not found');
        }

        setServerOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err.message || 'Unable to load order.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const localOrder = orders.find(
    x => String(x.id) === String(id)
  );

  const o = serverOrder || localOrder;

  if (loading && !o) {
    return h(
      'div',
      { className: 'wrap sec' },
      h(
        'div',
        { className: 'card pad' },
        'Loading your order...'
      )
    );
  }

  if (!o) {
    return h(
      Empty,
      {
        big: '?',
        t: 'Order not found',
        d: error || 'It may have been placed on another device.',
        to: '/profile',
        b: 'My Orders'
      }
    );
  }

  const isMongo = !!serverOrder;

  const status = isMongo
    ? serverOrder.orderStatus || 'Placed'
    : 'Placed';

  let st = 0;

  if (status === 'Confirmed') st = 0;
  if (status === 'Preparing') st = 1;
  if (status === 'Out for Delivery') st = 2;
  if (status === 'Delivered') st = 3;

  if (!isMongo && localOrder?.at) {
    st = Math.min(
      3,
      Math.floor((Date.now() - localOrder.at) / 6000)
    );
  }

  const S = [
    'Order Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered'
  ];

  const lines = isMongo
    ? (serverOrder.items || []).map(item => ({
        n: item.name,
        q: item.quantity,
        p: item.price
      }))
    : (localOrder.lines || []);

  const total = isMongo
    ? serverOrder.totalAmount
    : localOrder.total;

  const payment = isMongo
    ? serverOrder.paymentMethod
    : localOrder.pay;

  const address = isMongo
    ? serverOrder.deliveryAddress
    : localOrder.addr
      ? Object.values(localOrder.addr).slice(2).join(', ')
      : '';

  const orderId = isMongo
    ? serverOrder._id
    : localOrder.id;

  return h(
    'div',
    {
      className: 'wrap sec',
      style: { maxWidth: 760 }
    },

    h(
      'div',
      {
        className: 'empty',
        style: { padding: '20px 0' }
      },

      h(
        'div',
        { className: 'big' },
        '✓'
      ),

      h(
        'h1',
        { style: { fontSize: 34 } },
        'Order Details'
      ),

      h(
        'p',
        { className: 'mut' },
        'Order ID: ' + orderId
      )
    ),

    status === 'Cancelled' &&
      h(
        'div',
        {
          className: 'warn',
          style: { marginBottom: 16 }
        },
        'This order has been cancelled.'
      ),

    status !== 'Cancelled' &&
      h(
        'div',
        { className: 'steps' },

        S.map((s, i) =>
          h(
            'div',
            {
              key: s,
              className: i <= st ? 'on' : ''
            },

            h(
              'i',
              null,
              i <= st ? '✓' : i + 1
            ),

            s
          )
        )
      ),

    h(
      'div',
      {
        className: 'card pad bill'
      },

      h(
        'div',
        null,
        'Restaurant',
        h(
          'b',
          null,
          isMongo ? 'CRAVINGS Restaurant' : localOrder.rest
        )
      ),

      lines.map((l, i) =>
        h(
          'div',
          { key: i },
          l.n + ' × ' + l.q,
          h(
            'span',
            null,
            $(l.p * l.q)
          )
        )
      ),

      h(
        'div',
        { className: 't' },
        'Total (' + payment + ')',
        h(
          'span',
          null,
          $(total)
        )
      ),

      address &&
        h(
          'p',
          { className: 'mut' },
          'Deliver to: ' + address
        ),

      h(
        'p',
        null,
        'Status: ',
        h(
          'b',
          null,
          status
        )
      )
    ),

    h(
      'div',
      { className: 'row g' },

      h(
        'button',
        {
          className: 'btn',
          onClick: () => go('/restaurants')
        },
        'Order More'
      ),

      h(
        'button',
        {
          className: 'btn out',
          onClick: () => go('/profile')
        },
        'My Orders'
      )
    )
  );
}


// AUTH
function Auth({ reg }) {
  const { login, register } = useContext(C);

  const [f, setF] = useState({
    name: '',
    email: '',
    phone: '',
    pw: '',
    pw2: ''
  });

  const [e, setE] = useState('');
  const [loading, setLoading] = useState(false);

  const u = k =>
    h(
      'div',
      null,
      h('label', null, k[1]),
      h('input', {
        type: k[2] || 'text',
        style: { width: '100%' },
        value: f[k[0]],
        onChange: x =>
          setF({
            ...f,
            [k[0]]: x.target.value
          })
      })
    );

  const sub = async ev => {
    ev.preventDefault();
    setE('');
    setLoading(true);

    try {
      const result = reg
        ? await register(f)
        : await login(f.email, f.pw);

      if (result) setE(result);
    } catch (error) {
      setE('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return h(
    'div',
    {
      className: 'wrap sec',
      style: { maxWidth: 440 }
    },

    h(
      'form',
      {
        className: 'card pad',
        onSubmit: sub,
        style: {
          display: 'grid',
          gap: 12
        }
      },

      h(
        'h1',
        {
          style: {
            fontSize: 30,
            margin: 0
          }
        },
        reg ? 'Create account' : 'Welcome back'
      ),

      reg
        ? [
            u(['name', 'Full name']),
            u(['email', 'Email']),
            u(['phone', 'Phone']),
            u(['pw', 'Password', 'password']),
            u(['pw2', 'Confirm password', 'password'])
          ]
        : [
            u(['email', 'Email']),
            u(['pw', 'Password', 'password'])
          ],

      e &&
        h(
          'div',
          { className: 'warn' },
          e
        ),

      h(
        'button',
        {
          className: 'btn',
          type: 'submit',
          disabled: loading
        },
        loading
          ? 'Please wait...'
          : reg
            ? 'Register'
            : 'Login'
      ),

      !reg &&
        h(
          'p',
          { className: 'mut' },
          'Login using the email and password registered in MongoDB.'
        ),

      A(
        reg ? '/login' : '/register',
        { className: 'tag' },
        reg
          ? 'Have an account? Login'
          : 'New here? Register'
      )
    )
  );
}


// PROFILE
function Profile() {
  const {
    user,
    logout,
    orders,
    favs,
    reorder
  } = useContext(C);

  const [t, setT] = useState('orders');
  const [serverOrders, setServerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      const token = localStorage.getItem('cravings_token');
      if (!token) return;

      setLoadingOrders(true);
      setOrderError('');

      try {
        const response = await fetch(
          'http://localhost:5000/api/orders/my-orders',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load orders'
          );
        }

        setServerOrders(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          'Failed to load MongoDB orders:',
          error
        );
        setOrderError(
          'Could not load your latest orders.'
        );
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [user]);

  if (!user) {
    return h(
      Empty,
      {
        big: '👤',
        t: 'You’re not logged in',
        d: 'Login to see your orders and favourites.',
        to: '/login',
        b: 'Login'
      }
    );
  }

  const mongoOrders = serverOrders.map(o => ({
    id: o._id,
    rest: 'CRAVINGS Restaurant',
    lines: (o.items || []).map(item => ({
      fid: item.food,
      n: item.name,
      q: item.quantity,
      p: item.price
    })),
    total: o.totalAmount,
    status: o.orderStatus,
    payment: o.paymentMethod,
    address: o.deliveryAddress,
    at: new Date(o.createdAt).getTime(),
    mongo: true
  }));

  const allOrders = [
    ...mongoOrders,
    ...orders.filter(
      localOrder =>
        !mongoOrders.some(
          mongoOrder =>
            String(mongoOrder.id) === String(localOrder.id)
        )
    )
  ];

  const ad = [
    ...new Map(
      orders
        .filter(
          o =>
            o.addr &&
            typeof o.addr === 'object'
        )
        .map(o => [
          o.addr.house + o.addr.pin,
          o.addr
        ])
    ).values()
  ];

  return h(
    'div',
    { className: 'wrap sec' },

    h(
      'div',
      { className: 'row sp' },

      h(
        'div',
        null,

        h(
          'h1',
          {
            style: {
              fontSize: 32,
              margin: 0
            }
          },
          user.name
        ),

        h(
          'p',
          { className: 'mut' },
          user.email + ' · ' + user.phone
        )
      ),

      h(
        'button',
        {
          className: 'btn out',
          onClick: logout
        },
        'Logout'
      )
    ),

    h(
      'div',
      {
        className: 'tabs',
        style: { marginTop: 16 }
      },

      [
        ['orders', 'Orders (' + allOrders.length + ')'],
        ['addr', 'Addresses']
      ].map(([k, n]) =>
        h(
          'button',
          {
            key: k,
            className: 'chip' + (t === k ? ' on' : ''),
            onClick: () => setT(k)
          },
          n
        )
      ),

      A(
        '/favorites',
        { className: 'chip' },
        'Favorites (' +
          (favs.r.length + favs.f.length) +
          ')'
      )
    ),

    t === 'orders'
      ? loadingOrders
        ? h(
            'div',
            {
              className: 'card pad',
              style: { marginTop: 16 }
            },
            'Loading your orders...'
          )
        : orderError
          ? h(
              'div',
              {
                className: 'warn',
                style: { marginTop: 16 }
              },
              orderError
            )
          : allOrders.length
            ? allOrders.map(o =>
                h(
                  'div',
                  {
                    key: o.id,
                    className: 'card pad',
                    style: { marginBottom: 10 }
                  },

                  h(
                    'div',
                    { className: 'row sp' },

                    h('b', null, o.rest),

                    h(
                      'span',
                      null,
                      $(o.total)
                    )
                  ),

                  h(
                    'p',
                    { className: 'mut' },
                    o.lines
                      .map(l => l.n + ' ×' + l.q)
                      .join(', ')
                  ),

                  h(
                    'p',
                    { className: 'mut' },
                    'Status: ' + (o.status || 'Placed')
                  ),

                  h(
                    'p',
                    { className: 'mut' },
                    'Payment: ' + (o.payment || 'COD')
                  ),

                  A(
                    '/order/' + o.id,
                    { className: 'tag' },
                    'View Order · ' + o.id
                  ),

                  o.rid &&
                    h(
                      'button',
                      {
                        className: 'chip',
                        style: { marginLeft: 8 },
                        onClick: () => reorder(o)
                      },
                      'Reorder'
                    )
                )
              )
            : h(
                Empty,
                {
                  t: 'No orders yet',
                  d: 'Your orders will show up here.',
                  to: '/restaurants',
                  b: 'Order Now'
                }
              )
      : ad.length
        ? ad.map((x, i) =>
            h(
              'div',
              {
                key: i,
                className: 'card pad',
                style: { marginBottom: 10 }
              },
              Object.values(x).join(', ')
            )
          )
        : h(
            'p',
            { className: 'mut' },
            'Addresses from your orders will appear here.'
          )
  );
}

// FAVOURITES
function Favs() {
  const {
    favs
  } = useContext(C);

  if (
    !favs.r.length &&
    !favs.f.length
  ) {
    return h(
      Empty,
      {
        big: '♡',
        t: 'No favourites yet',
        d: 'Tap the heart on any restaurant or dish.',
        to: '/restaurants',
        b: 'Discover Restaurants'
      }
    );
  }

  return h(
    'div',
    {
      className: 'wrap sec'
    },

    h(
      'h1',
      null,
      'Favorites'
    ),

    favs.r.length > 0 &&
      [
        h(
          'h2',
          { key: 1 },
          'Restaurants'
        ),

        h(
          'div',
          {
            key: 2,
            className: 'grid'
          },

          favs.r.map(i =>
            h(
              RestCard,
              {
                key: i,
                r: R[i - 1]
              }
            )
          )
        )
      ],

    favs.f.length > 0 &&
      [
        h(
          'h2',
          {
            key: 3,
            style: {
              marginTop: 24
            }
          },
          'Dishes'
        ),

        h(
          'div',
          {
            key: 4,
            className: 'grid'
          },

          favs.f.map(i =>
            h(
              Dish,
              {
                key: i,
                f: F[i]
              }
            )
          )
        )
      ]
  );
}


// ADMIN DASHBOARD
function Admin() {
  const { user, notify } = useContext(C);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [tab, setTab] = useState('orders');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: 'Biryani', description: '', image: '', isVeg: false, state: '', restaurant: '', available: true });
  const token = localStorage.getItem('cravings_token');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = async () => {
    if (!user || user.role !== 'admin') return;
    setBusy(true);
    try {
      const [o, f] = await Promise.all([
        fetch('http://localhost:5000/api/admin/orders', { headers }),
        fetch('http://localhost:5000/api/admin/foods', { headers })
      ]);
      const od = await o.json();
      const fd = await f.json();
      if (!o.ok) throw new Error(od.message || 'Orders failed');
      if (!f.ok) throw new Error(fd.message || 'Foods failed');
      setOrders(Array.isArray(od) ? od : []);
      setFoods(Array.isArray(fd) ? fd : []);
    } catch (e) {
      notify(e.message || 'Admin data failed to load');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  if (!user || user.role !== 'admin') {
    return h(Empty, { big: '🔒', t: 'Admin access only', d: 'Login with the CRAVINGS admin account to open the dashboard.', to: '/login', b: 'Login' });
  }

  const status = async (id, value) => {
    try {
      const r = await fetch(`http://localhost:5000/api/admin/orders/${id}/status`, { method: 'PUT', headers, body: JSON.stringify({ orderStatus: value }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Status update failed');
      setOrders(x => x.map(o => o._id === id ? d.order : o));
      notify('Order status updated');
    } catch (e) { notify(e.message); }
  };

  const addFood = async e => {
    e.preventDefault();
    try {
      const r = await fetch('http://localhost:5000/api/admin/foods', { method: 'POST', headers, body: JSON.stringify({ ...form, price: Number(form.price) }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Food creation failed');
      setFoods(x => [d, ...x]);
      setForm({ name: '', price: '', category: 'Biryani', description: '', image: '', isVeg: false, state: '', restaurant: '', available: true });
      notify('Food added');
    } catch (e) { notify(e.message); }
  };

  const toggleFood = async food => {
    try {
      const r = await fetch(`http://localhost:5000/api/admin/foods/${food._id}`, { method: 'PUT', headers, body: JSON.stringify({ available: !food.available }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Food update failed');
      setFoods(x => x.map(f => f._id === food._id ? d : f));
      notify('Food availability updated');
    } catch (e) { notify(e.message); }
  };

  const removeFood = async id => {
    if (!confirm('Delete this food item?')) return;
    try {
      const r = await fetch(`http://localhost:5000/api/admin/foods/${id}`, { method: 'DELETE', headers });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Delete failed');
      setFoods(x => x.filter(f => f._id !== id));
      notify('Food deleted');
    } catch (e) { notify(e.message); }
  };

  const field = (key, label, type = 'text') => h('div', null,
    h('label', null, label),
    h('input', { type, value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }), required: key === 'name' || key === 'price' })
  );

  return h('div', { className: 'wrap sec' },
    h('div', { className: 'row sp' },
      h('div', null, h('h1', { style: { margin: 0 } }, 'CRAVINGS Admin'), h('p', { className: 'mut' }, 'Manage orders, menu and availability from one place.')),
      h('button', { className: 'btn out', onClick: load }, busy ? 'Refreshing…' : 'Refresh')
    ),
    h('div', { className: 'tabs', style: { marginTop: 18 } },
      [['orders', `Orders (${orders.length})`], ['foods', `Food (${foods.length})`], ['add', 'Add Food']].map(([k, n]) => h('button', { key: k, className: 'chip' + (tab === k ? ' on' : ''), onClick: () => setTab(k) }, n))
    ),
    tab === 'orders' && h('div', { style: { marginTop: 16 } },
      orders.length ? orders.map(o => h('div', { key: o._id, className: 'card pad', style: { marginBottom: 12 } },
        h('div', { className: 'row sp' }, h('b', null, '#' + o._id.slice(-8)), h('b', null, $(o.totalAmount))),
        h('p', { className: 'mut' }, (o.items || []).map(i => `${i.name} ×${i.quantity}`).join(', ')),
        h('p', { className: 'mut' }, o.deliveryAddress),
        h('div', { className: 'row g' },
          h('select', { value: o.orderStatus, onChange: e => status(o._id, e.target.value) }, ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => h('option', { key: s }, s))),
          h('span', { className: 'tag' }, o.paymentMethod || 'COD')
        )
      )) : h(Empty, { t: 'No orders', d: 'Orders placed by customers will appear here.', to: '/', b: 'Home' })
    ),
    tab === 'foods' && h('div', { style: { marginTop: 16 } },
      foods.map(f => h('div', { key: f._id, className: 'card pad', style: { marginBottom: 10 } },
        h('div', { className: 'row sp' }, h('b', null, f.name), h('b', null, $(f.price))),
        h('p', { className: 'mut' }, [f.category, f.state, f.restaurant].filter(Boolean).join(' · ')),
        h('div', { className: 'row g' },
          h('button', { className: 'chip', onClick: () => toggleFood(f) }, f.available ? 'Available ✓' : 'Out of stock'),
          h('button', { className: 'chip', onClick: () => removeFood(f._id) }, 'Delete')
        )
      ))
    ),
    tab === 'add' && h('form', { className: 'card pad', style: { marginTop: 16, display: 'grid', gap: 10 }, onSubmit: addFood },
      field('name', 'Food name'), field('price', 'Price', 'number'),
      h('div', null, h('label', null, 'Category'), h('select', { value: form.category, onChange: e => setForm({ ...form, category: e.target.value }) }, CATS.map(c => h('option', { key: c }, c)))),
      field('restaurant', 'Restaurant'), field('state', 'State'), field('image', 'Image URL'), field('description', 'Description'),
      h('label', null, h('input', { type: 'checkbox', checked: form.isVeg, onChange: e => setForm({ ...form, isVeg: e.target.checked }) }), ' Vegetarian'),
      h('button', { className: 'btn', type: 'submit' }, 'Add Food')
    )
  );
}


const NF = () =>
  h(
    Empty,
    {
      big: '404',
      t: 'Page not found',
      d: 'This plate seems to be empty.',
      to: '/',
      b: 'Back to Home'
    }
  );


class EB extends React.Component {
  constructor(p) {
    super(p);
    this.state = {
      e: 0
    };
  }

  static getDerivedStateFromError() {
    return {
      e: 1
    };
  }

  render() {
    return this.state.e
      ? h(
          Empty,
          {
            big: '!',
            t: 'Something went wrong',
            d: 'Please reload and try again.',
            to: '/',
            b: 'Go Home'
          }
        )
      : this.props.children;
  }
}


export {
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
};