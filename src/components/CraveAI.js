import {
  React,
  h,
  C,
  useState,
  useContext
} from '../lib/helpers.js';

import {
  F,
  STATES,
  sn
} from '../data/catalog.js';


function CraveAI() {

  const { add, foods } = useContext(C);


  // =========================================================
  // STATE
  // =========================================================

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text:
        "Hi! I'm CraveAI 🤖🍽️\n\n" +
        "I can help you choose what to eat based on your craving, " +
        "budget, diet, mood, health situation or regional cuisine.\n\n" +
        "Try asking:\n" +
        "• I want vegetarian Andhra food\n" +
        "• Give me Rajasthan specials\n" +
        "• Something spicy under ₹200\n" +
        "• I have fever, what should I eat?\n" +
        "• Surprise me"
    }
  ]);


  // =========================================================
  // REGIONAL KNOWLEDGE
  // =========================================================

  const regionalFoods = {

    'Andhra Pradesh': [
      'Pesarattu',
      'Pulihora',
      'Gutti Vankaya',
      'Andhra Meals',
      'Gongura Chicken',
      'Andhra Chicken',
      'Royyala Iguru',
      'Pootharekulu'
    ],

    'Telangana': [
      'Hyderabadi Biryani',
      'Haleem',
      'Sarva Pindi',
      'Mirchi Ka Salan',
      'Double Ka Meetha',
      'Sakinalu'
    ],

    'Karnataka': [
      'Bisi Bele Bath',
      'Mysore Masala Dosa',
      'Ragi Mudde',
      'Neer Dosa',
      'Dharwad Peda'
    ],

    'Tamil Nadu': [
      'Masala Dosa',
      'Pongal',
      'Chettinad Chicken',
      'Parotta',
      'Kothu Parotta'
    ],

    Kerala: [
      'Appam',
      'Puttu',
      'Kerala Parotta',
      'Malabar Biryani',
      'Fish Curry',
      'Kerala Sadya'
    ],

    Maharashtra: [
      'Vada Pav',
      'Misal Pav',
      'Pav Bhaji',
      'Puran Poli',
      'Sabudana Khichdi'
    ],

    Punjab: [
      'Butter Chicken',
      'Amritsari Kulcha',
      'Chole Bhature',
      'Sarson Saag',
      'Rajma Chawal'
    ],

    Rajasthan: [
      'Dal Baati Churma',
      'Gatte Ki Sabzi',
      'Ker Sangri',
      'Laal Maas',
      'Pyaaz Kachori',
      'Ghevar'
    ],

    Gujarat: [
      'Dhokla',
      'Khandvi',
      'Thepla',
      'Undhiyu',
      'Gujarati Thali'
    ],

    'West Bengal': [
      'Kolkata Biryani',
      'Macher Jhol',
      'Mishti Doi',
      'Rasgulla',
      'Luchi'
    ],

    Odisha: [
      'Dalma',
      'Pakhala Bhata',
      'Chhena Poda',
      'Odia Thali'
    ],

    Assam: [
      'Masor Tenga',
      'Khar',
      'Assam Thali',
      'Pitha'
    ]
  };


  // =========================================================
  // REGION ALIASES
  // =========================================================

  const regionAliases = {

    andhra: 'Andhra Pradesh',
    'andhra pradesh': 'Andhra Pradesh',
    rayalaseema: 'Andhra Pradesh',

    telangana: 'Telangana',
    hyderabad: 'Telangana',
    hyderabadi: 'Telangana',

    karnataka: 'Karnataka',

    tamil: 'Tamil Nadu',
    'tamil nadu': 'Tamil Nadu',

    kerala: 'Kerala',

    maharashtra: 'Maharashtra',

    punjab: 'Punjab',

    rajasthan: 'Rajasthan',
    rajasthani: 'Rajasthan',

    gujarat: 'Gujarat',
    gujarati: 'Gujarat',

    bengal: 'West Bengal',
    'west bengal': 'West Bengal',

    odisha: 'Odisha',
    odia: 'Odisha',

    assam: 'Assam'
  };


  // =========================================================
  // NORMALIZE TEXT
  // =========================================================

  const normalize = value => {

    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  };


  // =========================================================
  // DETECT REGION
  // =========================================================

  const detectRegion = text => {

    const lower =
      String(text || '')
        .toLowerCase();

    const keys =
      Object.keys(regionAliases);

    for (const key of keys) {

      if (lower.includes(key)) {
        return regionAliases[key];
      }

    }

    return '';
  };


  // =========================================================
  // FIND REGION ID FROM EXISTING CATALOG
  // =========================================================

  const findRegionId = regionName => {

    if (!regionName) {
      return '';
    }

    const state =
      Array.isArray(STATES)
        ? STATES.find(
            s =>
              String(s.n || '')
                .toLowerCase() ===
              String(regionName)
                .toLowerCase()
          )
        : null;

    if (state) {
      return state.id;
    }

    const aliases = {

      'Andhra Pradesh': 'ap',
      Telangana: 'tg',
      Karnataka: 'ka',
      'Tamil Nadu': 'tn',
      Kerala: 'kl',
      Maharashtra: 'mh',
      Punjab: 'pb',
      Rajasthan: 'rj',
      Gujarat: 'gj',
      'West Bengal': 'wb',
      Odisha: 'od',
      Assam: 'as'
    };

    return aliases[regionName] || '';
  };


  // =========================================================
  // GET REGIONAL FOODS FROM EXISTING CRAVINGS CATALOG
  // =========================================================

  const getRegionalFoods = regionName => {

    const regionId =
      findRegionId(regionName);

    if (!regionId || !Array.isArray(F)) {
      return [];
    }

    return F.filter(
      food =>
        food &&
        food.st === regionId
    );

  };


  // =========================================================
  // GET MONGODB MENU TEXT
  // =========================================================

  const getMongoMenuText = () => {

    if (
      !Array.isArray(foods) ||
      foods.length === 0
    ) {
      return 'No MongoDB food items currently loaded.';
    }

    return foods
      .map(food => {

        const name =
          food.name ||
          food.n ||
          '';

        const price =
          food.price ??
          food.p ??
          0;

        const category =
          food.category ||
          food.cat ||
          '';

        return (
          `${name} | ₹${price}` +
          (
            category
              ? ` | ${category}`
              : ''
          )
        );

      })
      .join('\n');
  };


  // =========================================================
  // GET REGIONAL MENU TEXT
  // =========================================================

  const getRegionalMenuText = () => {

    if (!Array.isArray(F)) {
      return '';
    }

    return F
      .filter(
        food =>
          food &&
          food.n &&
          food.p !== undefined
      )
      .map(food => {

        const state =
          food.st
            ? sn(food.st)
            : '';

        return (
          `${food.n} | ₹${food.p}` +
          (
            state
              ? ` | ${state}`
              : ''
          )
        );

      })
      .join('\n');
  };


  // =========================================================
  // COMPLETE MENU FOR AI
  // =========================================================

  const getCompleteMenu = () => {

    return (
      'MONGODB MENU:\n' +
      getMongoMenuText() +
      '\n\n' +
      'CRAVINGS REGIONAL MENU:\n' +
      getRegionalMenuText()
    );

  };


  // =========================================================
  // FIND FOOD BY EXACT / FUZZY NAME
  // =========================================================

  const findFoodMatches = text => {

    const result = [];

    const seen = new Set();

    const source =
      normalize(text);


    // -------------------------------------------------------
    // MongoDB foods
    // -------------------------------------------------------

    if (Array.isArray(foods)) {

      foods.forEach(food => {

        const name =
          food.name ||
          food.n ||
          '';

        const normalizedName =
          normalize(name);

        if (
          normalizedName &&
          source.includes(normalizedName)
        ) {

          const key =
            String(
              food._id ||
              food.id ||
              normalizedName
            );

          if (!seen.has(key)) {

            seen.add(key);

            result.push({
              ...food,

              _source:
                'mongodb',

              _name:
                name,

              _price:
                food.price ??
                food.p ??
                0
            });

          }

        }

      });

    }


    // -------------------------------------------------------
    // Regional catalog foods
    // -------------------------------------------------------

    if (Array.isArray(F)) {

      F.forEach(food => {

        if (!food || !food.n) {
          return;
        }

        const normalizedName =
          normalize(food.n);

        if (
          normalizedName &&
          source.includes(normalizedName)
        ) {

          const key =
            String(
              food.id ||
              normalizedName
            );

          if (!seen.has(key)) {

            seen.add(key);

            result.push({
              ...food,

              _source:
                'regional',

              _name:
                food.n,

              _price:
                food.p ?? 0
            });

          }

        }

      });

    }


    return result.slice(0, 6);

  };


  // =========================================================
  // GET REGIONAL CATALOG FALLBACK
  // =========================================================

  const getRegionalFallback = text => {

    const region =
      detectRegion(text);

    if (!region) {
      return [];
    }

    const foodsInRegion =
      getRegionalFoods(region);

    if (!foodsInRegion.length) {
      return [];
    }


    const lower =
      String(text || '')
        .toLowerCase();


    const vegetarian =
      lower.includes('vegetarian') ||
      lower.includes('veg') ||
      lower.includes('pure veg');


    const budgetMatch =
      lower.match(
        /(?:under|below|within|less than)\s*₹?\s*(\d+)/
      );


    const budget =
      budgetMatch
        ? Number(budgetMatch[1])
        : null;


    let candidates =
      [...foodsInRegion];


    // Vegetarian filtering

    if (vegetarian) {

      const veg =
        candidates.filter(
          food =>
            food.veg === true ||
            food.vegetarian === true
        );

      if (veg.length) {
        candidates = veg;
      }

    }


    // Budget filtering

    if (budget) {

      const affordable =
        candidates.filter(
          food =>
            Number(food.p) <= budget
        );

      if (affordable.length) {
        candidates = affordable;
      }

    }


    return candidates
      .slice(0, 4)
      .map(food => ({
        ...food,

        _source:
          'regional',

        _name:
          food.n,

        _price:
          food.p
      }));

  };


  // =========================================================
  // BUILD AI PROMPT
  // =========================================================

  const buildAIMessage = userMessage => {

    const region =
      detectRegion(userMessage);

    const regionFoods =
      region
        ? getRegionalFoods(region)
        : [];


    let regionalInfo = '';

    if (region) {

      regionalInfo =
        `
CUSTOMER REGION REQUEST:
${region}

FAMOUS FOODS FROM ${region}:
${(
  regionalFoods[region] ||
  regionalFoods[region] ||
  []
).join(', ')}

ACTUAL CRAVINGS ${region.toUpperCase()} FOODS:
${
  regionFoods.length
    ? regionFoods
        .map(
          food =>
            `${food.n} | ₹${food.p}`
        )
        .join('\n')
    : 'No regional items found.'
}
`;

    }


    return `
You are CraveAI, the intelligent food assistant
inside the CRAVINGS online food ordering system.

CUSTOMER:
"${userMessage}"

${regionalInfo}

CURRENT CRAVINGS MENU:
${getCompleteMenu()}

IMPORTANT RULES:

1. Understand exactly what the customer wants.

2. Recommend actual CRAVINGS foods whenever possible.

3. Never invent a CRAVINGS menu item.

4. If a food exists in the CRAVINGS catalog,
write its EXACT food name.

5. If the customer asks for regional food,
prefer actual CRAVINGS regional foods.

6. For vegetarian requests, recommend vegetarian
foods only.

7. For budget requests, stay within the budget.

8. For spicy requests, recommend suitable spicy
foods.

9. For someone feeling unwell, recommend light,
mild and easy-to-eat foods. Do not diagnose
medical conditions.

10. Keep answers short and useful.

11. Recommend 2 to 4 foods when possible.

12. ALWAYS write the exact food names clearly.

13. Do not claim that a famous regional dish can
be ordered unless it exists in the CRAVINGS menu.

14. Example format:

"I recommend these:
• Pesarattu — ₹99
• Pulihora — ₹129"

Do not write extremely long explanations.
`;
  };


  // =========================================================
  // ADD FOOD TO CART
  // =========================================================

  const addFoodToCart = food => {

    if (!food) {
      return;
    }


    const cartFood = {

      id:
        food._id ||
        food.id,

      n:
        food.name ||
        food.n ||
        food._name,

      p:
        food.price ??
        food.p ??
        food._price ??
        0,

      img:
        food.image ||
        food.img ||
        '',

      cat:
        food.category ||
        food.cat ||
        'Food',

      st:
        food.st ||
        '',

      veg:
        food.veg ??
        food.vegetarian ??
        false

    };


    add(
      cartFood,
      {
        id: 1,
        open: true
      }
    );

  };


  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async value => {

    const userMessage =
      String(
        value !== undefined
          ? value
          : message
      ).trim();


    if (
      !userMessage ||
      loading
    ) {
      return;
    }


    setMessage('');


    setMessages(previous => [
      ...previous,

      {
        role:
          'user',

        text:
          userMessage
      }
    ]);


    setLoading(true);


    try {

      const response =
        await fetch(
          'http://localhost:5000/api/ai/chat',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({
                message:
                  buildAIMessage(
                    userMessage
                  )
              })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          'CraveAI request failed'
        );

      }


      const reply =
        String(
          data.reply ||
          ''
        ).trim();


      const finalReply =
        reply ||
        'I could not find a suitable recommendation right now.';


      setMessages(previous => [
        ...previous,

        {
          role:
            'ai',

          text:
            finalReply
        }
      ]);


    } catch (error) {

      console.error(
        'CraveAI error:',
        error
      );


      setMessages(previous => [
        ...previous,

        {
          role:
            'ai',

          text:
            'Sorry 😔 CraveAI could not connect right now. Please make sure Ollama and the CRAVINGS backend are running.'
        }
      ]);

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleKeyDown = event => {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  };


  // =========================================================
  // RENDER FOOD CARDS
  // =========================================================

  const renderFoodCards = text => {

    let matches =
      findFoodMatches(text);


    // If the AI didn't explicitly mention the
    // exact catalog name, use regional fallback.

    if (!matches.length) {

      matches =
        getRegionalFallback(text);

    }


    if (!matches.length) {
      return null;
    }


    return h(
      'div',
      {
        style: {
          marginTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }
      },

      matches.map((food, index) => {

        const name =
          food._name ||
          food.name ||
          food.n ||
          'Food';

        const price =
          food._price ??
          food.price ??
          food.p ??
          0;


        return h(
          'div',
          {
            key:
              String(
                food._id ||
                food.id ||
                name
              ) +
              '-' +
              index,

            style: {

              background:
                '#ffffff',

              border:
                '1px solid #dfe8e2',

              borderRadius:
                '14px',

              padding:
                '11px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              gap:
                '10px',

              boxShadow:
                '0 2px 8px rgba(0,0,0,.05)'
            }
          },


          h(
            'div',
            {
              style: {
                minWidth: 0,
                flex: 1
              }
            },

            h(
              'div',
              {
                style: {

                  fontWeight:
                    '700',

                  color:
                    '#17352a',

                  fontSize:
                    '14px',

                  marginBottom:
                    '3px'
                }
              },

              name
            ),


            h(
              'div',
              {
                style: {

                  color:
                    '#0b6b42',

                  fontWeight:
                    '800',

                  fontSize:
                    '14px'
                }
              },

              `₹${price}`
            )
          ),


          h(
            'button',
            {
              onClick:
                () =>
                  addFoodToCart(
                    food
                  ),

              style: {

                border:
                  'none',

                background:
                  '#0b6b42',

                color:
                  '#fff',

                borderRadius:
                  '18px',

                padding:
                  '8px 12px',

                fontWeight:
                  '700',

                fontSize:
                  '12px',

                cursor:
                  'pointer',

                whiteSpace:
                  'nowrap'
              }
            },

            '+ Add to Cart'
          )

        );

      })

    );

  };


  // =========================================================
  // MAIN UI
  // =========================================================

  return h(
    'div',
    null,


    // =======================================================
    // FLOATING BUTTON
    // =======================================================

    !open &&
      h(
        'button',
        {
          onClick:
            () =>
              setOpen(true),

          title:
            'Open CraveAI',

          style: {

            position:
              'fixed',

            right:
              '24px',

            bottom:
              '86px',

            width:
              '62px',

            height:
              '62px',

            border:
              'none',

            borderRadius:
              '50%',

            background:
              'linear-gradient(135deg,#075331,#15945c)',

            color:
              '#fff',

            fontSize:
              '28px',

            cursor:
              'pointer',

            boxShadow:
              '0 10px 30px rgba(0,0,0,.25)',

            zIndex:
              9999
          }
        },

        '🤖'
      ),


    // =======================================================
    // CHAT WINDOW
    // =======================================================

    open &&
      h(
        'div',
        {
          style: {

            position:
              'fixed',

            right:
              '24px',

            bottom:
              '24px',

            width:
              '380px',

            maxWidth:
              'calc(100vw - 32px)',

            height:
              '600px',

            maxHeight:
              'calc(100vh - 48px)',

            background:
              '#fff',

            borderRadius:
              '22px',

            overflow:
              'hidden',

            boxShadow:
              '0 20px 60px rgba(0,0,0,.28)',

            display:
              'flex',

            flexDirection:
              'column',

            zIndex:
              10000
          }
        },


        // ===================================================
        // HEADER
        // ===================================================

        h(
          'div',
          {
            style: {

              background:
                'linear-gradient(135deg,#073d28,#0b6b42)',

              color:
                '#fff',

              padding:
                '16px 18px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between'
            }
          },


          h(
            'div',
            {
              style: {

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '11px'
              }
            },

            h(
              'div',
              {
                style: {

                  width:
                    '42px',

                  height:
                    '42px',

                  borderRadius:
                    '50%',

                  background:
                    'rgba(255,255,255,.15)',

                  display:
                    'grid',

                  placeItems:
                    'center',

                  fontSize:
                    '22px'
                }
              },

              '🤖'
            ),


            h(
              'div',
              null,

              h(
                'div',
                {
                  style: {

                    fontWeight:
                      '800',

                    fontSize:
                      '17px'
                  }
                },

                'CraveAI'
              ),


              h(
                'div',
                {
                  style: {

                    fontSize:
                      '12px',

                    opacity:
                      '.8'
                  }
                },

                'AI Food Assistant'
              )

            )

          ),


          h(
            'button',
            {
              onClick:
                () =>
                  setOpen(false),

              style: {

                width:
                  '34px',

                height:
                  '34px',

                border:
                  'none',

                borderRadius:
                  '50%',

                background:
                  'rgba(255,255,255,.12)',

                color:
                  '#fff',

                fontSize:
                  '20px',

                cursor:
                  'pointer'
              }
            },

            '×'
          )

        ),


        // ===================================================
        // MESSAGE AREA
        // ===================================================

        h(
          'div',
          {
            style: {

              flex:
                '1',

              overflowY:
                'auto',

              padding:
                '14px',

              background:
                '#f6f8f6'
            }
          },


          messages.map(
            (item, index) => {

              const isAI =
                item.role === 'ai';


              return h(
                'div',
                {
                  key:
                    index,

                  style: {

                    marginBottom:
                      '15px'
                  }
                },


                h(
                  'div',
                  {
                    style: {

                      display:
                        'flex',

                      justifyContent:
                        isAI
                          ? 'flex-start'
                          : 'flex-end'
                    }
                  },


                  h(
                    'div',
                    {
                      style: {

                        maxWidth:
                          '86%',

                        padding:
                          '11px 13px',

                        borderRadius:
                          isAI
                            ? '16px 16px 16px 4px'
                            : '16px 16px 4px 16px',

                        background:
                          isAI
                            ? '#ffffff'
                            : '#0b6b42',

                        color:
                          isAI
                            ? '#222'
                            : '#fff',

                        fontSize:
                          '14px',

                        lineHeight:
                          '1.5',

                        whiteSpace:
                          'pre-wrap',

                        boxShadow:
                          isAI
                            ? '0 1px 4px rgba(0,0,0,.05)'
                            : 'none'
                      }
                    },

                    item.text
                  )

                ),


                // ==========================================
                // ADD TO CART CARDS
                // ==========================================

                isAI &&
                  renderFoodCards(
                    item.text
                  )

              );

            }

          ),


          // =================================================
          // LOADING
          // =================================================

          loading &&
            h(
              'div',
              {
                style: {

                  display:
                    'inline-block',

                  background:
                    '#fff',

                  padding:
                    '10px 13px',

                  borderRadius:
                    '14px',

                  color:
                    '#666',

                  fontSize:
                    '13px',

                  boxShadow:
                    '0 1px 4px rgba(0,0,0,.05)'
                }
              },

              'CraveAI is thinking... 🤔'
            )

        ),


        // ===================================================
        // INPUT AREA
        // ===================================================

        h(
          'div',
          {
            style: {

              padding:
                '11px',

              background:
                '#fff',

              borderTop:
                '1px solid #e7e7e7',

              display:
                'flex',

              gap:
                '8px'
            }
          },


          h(
            'input',
            {
              value:
                message,

              onChange:
                event =>
                  setMessage(
                    event.target.value
                  ),

              onKeyDown:
                handleKeyDown,

              disabled:
                loading,

              placeholder:
                'Ask CraveAI what to eat...',

              style: {

                flex:
                  '1',

                minWidth:
                  '0',

                border:
                  '1px solid #ddd',

                borderRadius:
                  '24px',

                padding:
                  '11px 14px',

                outline:
                  'none',

                fontSize:
                  '13px'
              }
            }
          ),


          h(
            'button',
            {
              onClick:
                () =>
                  sendMessage(),

              disabled:
                loading ||
                !message.trim(),

              style: {

                width:
                  '44px',

                height:
                  '44px',

                flexShrink:
                  0,

                border:
                  'none',

                borderRadius:
                  '50%',

                background:
                  loading ||
                  !message.trim()
                    ? '#cbd7d1'
                    : '#0b6b42',

                color:
                  '#fff',

                fontSize:
                  '18px',

                cursor:
                  'pointer'
              }
            },

            '➤'
          )

        )

      )

  );

}


export {
  CraveAI
};


export default CraveAI;