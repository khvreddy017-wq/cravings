import { React, h, C, go, useState, useEffect, useContext } from '../lib/helpers.js';

const API = 'https://cravings-backend-3znd.onrender.com/api';

function Admin() {
  const { user } = useContext(C);

  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
    isVeg: true,
    state: 'Karnataka',
    restaurant: 'CRAVINGS Restaurant',
    available: true
  });

  const token = () => localStorage.getItem('cravings_token');

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`
  });

  const load = async () => {
    setMessage('');

    try {
      // Load foods
      const foodResponse = await fetch(`${API}/foods`);

      const foodData = await foodResponse.json();

      if (!foodResponse.ok) {
        throw new Error(foodData.message || 'Food load failed');
      }

      setFoods(Array.isArray(foodData) ? foodData : []);

      // Load admin orders separately
      try {
        const orderResponse = await fetch(
          `${API}/orders/admin/all`,
          {
            headers: headers()
          }
        );

        const orderData = await orderResponse.json();

        if (orderResponse.ok) {
          setOrders(Array.isArray(orderData) ? orderData : []);
        } else {
          setOrders([]);
        }
      } catch (orderError) {
        setOrders([]);
      }

    } catch (e) {
      setMessage(e.message || 'Unable to load admin data.');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      load();
    }
  }, [user]);

  if (!user) {
    return h(
      'div',
      { className: 'wrap sec' },
      h(
        'div',
        { className: 'card pad' },
        h('h2', null, 'Admin Login Required'),
        h(
          'button',
          {
            className: 'btn',
            onClick: () => go('/login')
          },
          'Login'
        )
      )
    );
  }

  if (user.role !== 'admin') {
    return h(
      'div',
      { className: 'wrap sec' },
      h(
        'div',
        { className: 'warn' },
        'Admin access required.'
      ),
      h(
        'button',
        {
          className: 'btn',
          onClick: () => go('/')
        },
        'Back Home'
      )
    );
  }

  const reset = () => {
    setEditing(null);

    setForm({
      name: '',
      price: '',
      category: '',
      image: '',
      description: '',
      isVeg: true,
      state: 'Karnataka',
      restaurant: 'CRAVINGS Restaurant',
      available: true
    });
  };

  const saveFood = async () => {
    try {
      if (!form.name.trim()) {
        setMessage('Food name is required.');
        return;
      }

      if (!form.price) {
        setMessage('Food price is required.');
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price)
      };

      const url = editing
        ? `${API}/foods/${editing}`
        : `${API}/foods`;

      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Food save failed'
        );
      }

      setMessage(
        editing
          ? 'Food updated successfully.'
          : 'Food added successfully.'
      );

      reset();

      await load();

    } catch (e) {
      setMessage(
        e.message || 'Food save failed.'
      );
    }
  };

  const removeFood = async (id) => {
    if (!window.confirm('Delete this food item?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/foods/${id}`,
        {
          method: 'DELETE',
          headers: headers()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Delete failed.'
        );
      }

      setMessage('Food deleted successfully.');

      await load();

    } catch (e) {
      setMessage(
        e.message || 'Delete failed.'
      );
    }
  };

  const toggleFood = async (food) => {
    try {
      const response = await fetch(
        `${API}/foods/${food._id}`,
        {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify({
            available: !food.available
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Update failed.'
        );
      }

      setMessage(
        food.available === false
          ? 'Food marked available.'
          : 'Food marked out of stock.'
      );

      await load();

    } catch (e) {
      setMessage(
        e.message || 'Update failed.'
      );
    }
  };

  const status = async (id, orderStatus) => {
    try {
      const response = await fetch(
        `${API}/orders/admin/${id}/status`,
        {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify({
            orderStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Status update failed.'
        );
      }

      setMessage(
        `Order status changed to ${orderStatus}.`
      );

      await load();

    } catch (e) {
      setMessage(
        e.message || 'Status update failed.'
      );
    }
  };

  const input = (
    key,
    label,
    type = 'text'
  ) =>
    h(
      'div',
      null,
      h('label', null, label),
      h('input', {
        type,
        value: form[key],
        onChange: e =>
          setForm({
            ...form,
            [key]: e.target.value
          })
      })
    );

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
              fontSize: 34,
              margin: 0
            }
          },
          'CRAVINGS Admin Dashboard'
        ),

        h(
          'p',
          { className: 'mut' },
          user.email
        )
      ),

      h(
        'button',
        {
          className: 'btn out',
          onClick: () => go('/')
        },
        'Back to Store'
      )
    ),

    message &&
      h(
        'div',
        {
          className: 'tag',
          style: {
            margin: '14px 0',
            display: 'block'
          }
        },
        message
      ),

    h(
      'div',
      {
        className: 'tabs',
        style: {
          marginTop: 16
        }
      },

      h(
        'button',
        {
          className:
            'chip' +
            (tab === 'orders' ? ' on' : ''),
          onClick: () => setTab('orders')
        },
        `Orders (${orders.length})`
      ),

      h(
        'button',
        {
          className:
            'chip' +
            (tab === 'foods' ? ' on' : ''),
          onClick: () => setTab('foods')
        },
        `Food (${foods.length})`
      ),

      h(
        'button',
        {
          className: 'chip',
          onClick: () => {
            reset();
            setTab('foods');
          }
        },
        'Add Food'
      )
    ),

    tab === 'orders'

      ? h(
          'div',
          { style: { marginTop: 16 } },

          orders.length

            ? orders.map(
                order =>
                  h(
                    'div',
                    {
                      className: 'card pad',
                      style: {
                        marginBottom: 12
                      },
                      key: order._id
                    },

                    h(
                      'div',
                      { className: 'row sp' },

                      h(
                        'b',
                        null,
                        `Order ${order._id}`
                      ),

                      h(
                        'b',
                        null,
                        `₹${order.totalAmount}`
                      )
                    ),

                    h(
                      'p',
                      { className: 'mut' },

                      (order.items || [])
                        .map(
                          item =>
                            `${item.name} × ${item.quantity}`
                        )
                        .join(', ')
                    ),

                    h(
                      'p',
                      null,
                      'Customer: ',

                      h(
                        'b',
                        null,
                        order.user?.name ||
                          order.user ||
                          'User'
                      ),

                      ' · ',

                      order.user?.email || ''
                    ),

                    h(
                      'p',
                      { className: 'mut' },
                      'Address: ' +
                        (order.deliveryAddress || '')
                    ),

                    h(
                      'div',
                      { className: 'row g' },

                      h(
                        'select',
                        {
                          value:
                            order.orderStatus ||
                            'Placed',

                          onChange: e =>
                            status(
                              order._id,
                              e.target.value
                            )
                        },

                        [
                          'Placed',
                          'Confirmed',
                          'Preparing',
                          'Out for Delivery',
                          'Delivered',
                          'Cancelled'
                        ].map(
                          statusName =>
                            h(
                              'option',
                              {
                                key: statusName,
                                value: statusName
                              },
                              statusName
                            )
                        )
                      ),

                      h(
                        'span',
                        { className: 'tag' },
                        order.paymentMethod ||
                          'COD'
                      )
                    )
                  )
              )

            : h(
                'p',
                { className: 'mut' },
                'No orders yet.'
              )
        )

      : h(
          'div',
          { style: { marginTop: 16 } },

          h(
            'div',
            {
              className: 'card pad',
              style: {
                marginBottom: 16
              }
            },

            h(
              'h3',
              null,
              editing
                ? 'Edit Food'
                : 'Add Food'
            ),

            h(
              'div',
              { className: 'f2' },

              input('name', 'Food name'),

              input(
                'price',
                'Price',
                'number'
              ),

              input(
                'category',
                'Category'
              ),

              input(
                'image',
                'Image URL'
              ),

              input(
                'state',
                'State'
              ),

              input(
                'restaurant',
                'Restaurant'
              ),

              input(
                'description',
                'Description'
              )
            ),

            h(
              'label',
              null,

              h('input', {
                type: 'checkbox',
                checked: !!form.isVeg,
                onChange: e =>
                  setForm({
                    ...form,
                    isVeg: e.target.checked
                  })
              }),

              ' Vegetarian'
            ),

            h(
              'label',
              null,

              h('input', {
                type: 'checkbox',
                checked: !!form.available,
                onChange: e =>
                  setForm({
                    ...form,
                    available:
                      e.target.checked
                  })
              }),

              ' Available'
            ),

            h(
              'div',
              { className: 'row g' },

              h(
                'button',
                {
                  className: 'btn',
                  onClick: saveFood
                },
                editing
                  ? 'Save Changes'
                  : 'Add Food'
              ),

              h(
                'button',
                {
                  className: 'btn out',
                  onClick: reset
                },
                'Clear'
              )
            )
          ),

          foods.map(
            food =>
              h(
                'div',
                {
                  className: 'card pad',
                  style: {
                    marginBottom: 10
                  },
                  key: food._id
                },

                h(
                  'div',
                  { className: 'row sp' },

                  h(
                    'b',
                    null,
                    food.name
                  ),

                  h(
                    'b',
                    null,
                    `₹${food.price}`
                  )
                ),

                h(
                  'p',
                  { className: 'mut' },

                  `${food.category || 'Food'} · ${
                    food.isVeg
                      ? 'Veg'
                      : 'Non-Veg'
                  } · ${food.state || ''}`
                ),

                h(
                  'div',
                  { className: 'row g' },

                  h(
                    'button',
                    {
                      className: 'chip',

                      onClick: () => {
                        setEditing(food._id);

                        setForm({
                          name:
                            food.name || '',
                          price:
                            food.price || '',
                          category:
                            food.category || '',
                          image:
                            food.image || '',
                          description:
                            food.description || '',
                          isVeg:
                            !!food.isVeg,
                          state:
                            food.state ||
                            'Karnataka',
                          restaurant:
                            food.restaurant ||
                            'CRAVINGS Restaurant',
                          available:
                            food.available !==
                            false
                        });

                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                      }
                    },
                    'Edit'
                  ),

                  h(
                    'button',
                    {
                      className: 'chip',
                      onClick: () =>
                        toggleFood(food)
                    },
                    food.available === false
                      ? 'Mark Available'
                      : 'Mark Out of Stock'
                  ),

                  h(
                    'button',
                    {
                      className: 'chip',
                      onClick: () =>
                        removeFood(food._id)
                    },
                    'Delete'
                  )
                )
              )
          )
        )
  );
}

export { Admin };