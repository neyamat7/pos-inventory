export const products = [
  {
    id: 'p001',
    sku: 'APL123',
    barcode: '54354354',
    name: 'Mango',
    description: 'Fresh seasonal mango',
    variants: [{ option: 'Weight', value: '200g' }],
    price: 2900,
    commision_rate: 10,
    category: 'Fruits',
    images: [{ path: './mango.png', relativePath: './mango.png' }],
    status: 'active'
  },
  {
    id: 'p002',
    sku: 'ORG456',
    barcode: '98765432',
    name: 'Organic Apples',
    description: 'Premium organic apples',
    variants: [{ option: 'Pack', value: '1kg' }],
    price: 3500,
    commision_rate: 12,
    category: 'Fruits',
    images: [{ path: './apple.png', relativePath: './apple.png' }],
    status: 'active'
  }
]

export const purchaseCollections = [
  {
    summary: { date: '2025-09-23', sub_total: 718, commission_total: 62 },
    payment: {
      receiveAmount: 0,
      changeAmount: 0,
      dueAmount: 718,
      paymentType: 'cash',
      note: '',
      vatType: 'Select',
      discountType: 'Flat (৳)'
    },
    suppliers: [
      { supplier_id: 1, items: [{ product_id: 'p001', supplier_id: 1 }], sub_total: 253, commission_total: 17 },
      { supplier_id: 2, items: [{ product_id: 'p001', supplier_id: 2 }], sub_total: 253, commission_total: 17 },
      { supplier_id: 3, items: [{ product_id: 'p002', supplier_id: 3 }], sub_total: 212, commission_total: 28 }
    ]
  },
  {
    summary: { date: '2025-09-24', sub_total: 900, commission_total: 70 },
    payment: {
      receiveAmount: 0,
      changeAmount: 0,
      dueAmount: 900,
      paymentType: 'bank',
      note: 'Second order',
      vatType: 'Select',
      discountType: 'Percentage'
    },
    suppliers: [
      { supplier_id: 2, items: [{ product_id: 'p001', supplier_id: 2 }], sub_total: 450, commission_total: 35 },
      { supplier_id: 3, items: [{ product_id: 'p002', supplier_id: 3 }], sub_total: 450, commission_total: 35 }
    ]
  }
]

export const salesCollections = [
  {
    customer: {
      sl: 1,
      image: 'https://i.postimg.cc/fRbC2QmY/360-F-523629123-Rp-AMod-BJXg-CTPfilf-Ya-CIb-Paal-FIjbvv.jpg',
      name: 'Abdur Rahman',
      email: 'arahman01@example.com',
      type: 'Customer',
      phone: '+8801711000001',
      balance: 0,
      due: 3200,
      crate: { type_one: { qty: 2, price: 100 }, type_two: { qty: 1, price: 150 } },
      cost: 0,
      orders: 312,
      totalSpent: 14500,
      location: 'Dhaka, Bangladesh'
    },
    summary: {
      date: '2025-10-12',
      sub_total: 12500,
      commission_total: 200,
      profit_total: 2200
    },
    payment: {
      receiveAmount: 9300,
      changeAmount: 0,
      dueAmount: 3200,
      paymentType: 'cash',
      note: 'Partial payment',
      vatType: 'Select'
    },
    items: [
      {
        id: 1,
        name: 'Mango',
        price: 100,
        cost_price: 80,
        selling_price: 100,
        image: 'https://i.postimg.cc/4y0HNNp5/Chat-GPT-Image-Oct-9-2025-06-54-36-PM.png',
        category: 'Fruits',
        brand: 'Fresh Farm',
        commission_rate: 10,
        product_id: 1,
        product_name: 'Mango',
        crate: { type_one: 2, type_two: 0 },
        cratePrice: 200,
        kg: 60,
        discount_kg: 0,
        total: 6200,
        profit: 1200,
        commission: 0,
        selling_date: '2025-10-12',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Shahidul Alam',
            supplier_id: 823,
            product: 'Mango',
            qty: 120,
            lot_name: 'SA-111025-MANGO-120',
            use_qty: 20
          },
          {
            supplier_name: 'Tanvir Alam',
            supplier_id: 203,
            product: 'Mango',
            qty: 130,
            lot_name: 'TA-111025-MANGO-130',
            use_qty: 10
          }
        ],
        total_from_lots: 30
      },
      {
        id: 2,
        name: 'Banana',
        price: 60,
        cost_price: 45,
        selling_price: 60,
        image: 'https://i.postimg.cc/q72FsNRC/Chat-GPT-Image-Oct-9-2025-07-05-58-PM.png',
        category: 'Fruits',
        brand: 'Nature Organic',
        commission_rate: 0,
        product_id: 3,
        product_name: 'Banana',
        crate: { type_one: 0, type_two: 10 },
        cratePrice: 1500,
        kg: 25,
        discount_kg: 0,
        total: 6300,
        profit: 1000,
        commission: 0,
        selling_date: '2025-10-12',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Rafiqul Islam',
            supplier_id: 2,
            product: 'Banana',
            qty: 25,
            lot_name: 'RI-111025-BANANA-25',
            use_qty: 10
          },
          {
            supplier_name: 'Sultana Begum',
            supplier_id: 302,
            product: 'Banana',
            qty: 45,
            lot_name: 'SB-111025-BANANA-45',
            use_qty: 15
          }
        ],
        total_from_lots: 25
      }
    ]
  },
  {
    customer: {
      sl: 2,
      image: 'https://i.postimg.cc/g0hSKrjV/360-F-489739373-UBp-D3-Pu-OP9n-Qp-Jp-WD3c-Ru5x-Vg3z6-Gh-Yk.jpg',
      name: 'Nusrat Jahan',
      email: 'nusrat.jahan@example.com',
      type: 'Customer',
      phone: '+8801711000002',
      balance: 0,
      due: 0,
      crate: { type_one: { qty: 1, price: 100 }, type_two: { qty: 2, price: 150 } },
      cost: 0,
      orders: 428,
      totalSpent: 27400,
      location: 'Chittagong, Bangladesh'
    },
    summary: {
      date: '2025-10-13',
      sub_total: 19200,
      commission_total: 0,
      profit_total: 3100
    },
    payment: {
      receiveAmount: 19200,
      changeAmount: 0,
      dueAmount: 0,
      paymentType: 'card',
      note: 'Paid in full',
      vatType: 'Select'
    },
    items: [
      {
        id: 4,
        name: 'Apple',
        price: 150,
        cost_price: 120,
        selling_price: 150,
        image: 'https://i.postimg.cc/90j6KK62/Chat-GPT-Image-Oct-11-2025-10-57-06-AM.png',
        category: 'Fruits',
        brand: 'Fresh Orchard',
        commission_rate: 0,
        product_id: 4,
        product_name: 'Apple',
        crate: { type_one: 3, type_two: 0 },
        cratePrice: 300,
        kg: 40,
        discount_kg: 0,
        total: 9600,
        profit: 1200,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Mahfuz Alam',
            supplier_id: 501,
            product: 'Apple',
            qty: 25,
            lot_name: 'MA-111025-APPLE-25',
            use_qty: 20
          }
        ],
        total_from_lots: 20
      },
      {
        id: 5,
        name: 'Orange',
        price: 100,
        cost_price: 80,
        selling_price: 100,
        image: 'https://i.postimg.cc/qqdPSSP0/Chat-GPT-Image-Oct-11-2025-11-05-15-AM.png',
        category: 'Fruits',
        brand: 'Citrus Co',
        commission_rate: 0,
        product_id: 5,
        product_name: 'Orange',
        crate: { type_one: 0, type_two: 20 },
        cratePrice: 3000,
        kg: 70,
        discount_kg: 0,
        total: 9600,
        profit: 1900,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Imran Hossain',
            supplier_id: 604,
            product: 'Orange',
            qty: 40,
            lot_name: 'IH-111025-ORANGE-40',
            use_qty: 15
          },
          {
            supplier_name: 'Rokeya Begum',
            supplier_id: 601,
            product: 'Orange',
            qty: 25,
            lot_name: 'RB-111025-ORANGE-25',
            use_qty: 20
          }
        ],
        total_from_lots: 35
      }
    ]
  },
  {
    customer: {
      sl: 3,
      image: 'https://i.postimg.cc/5NcqS1y7/portrait-smiling-young-man-260nw-1709362074.jpg',
      name: 'Kamrul Hasan',
      email: 'kamrul.hasan@example.com',
      type: 'Customer',
      phone: '+8801711000003',
      balance: 0,
      due: 2800,
      crate: { type_one: { qty: 0, price: 100 }, type_two: { qty: 1, price: 150 } },
      cost: 0,
      orders: 158,
      totalSpent: 10200,
      location: 'Rajshahi, Bangladesh'
    },
    summary: {
      date: '2025-10-14',
      sub_total: 10800,
      commission_total: 0,
      profit_total: 1600
    },
    payment: {
      receiveAmount: 8000,
      changeAmount: 0,
      dueAmount: 2800,
      paymentType: 'mobile',
      note: 'Partial payment via bKash',
      vatType: 'Select'
    },
    items: [
      {
        id: 8,
        name: 'Watermelon',
        price: 200,
        cost_price: 160,
        selling_price: 200,
        image: 'https://i.postimg.cc/nrcL64qc/pexels-mahmoud-yahyaoui-27863683.jpg',
        category: 'Fruits',
        brand: 'Green Fields',
        commission_rate: 0,
        product_id: 8,
        product_name: 'Watermelon',
        crate: { type_one: 1, type_two: 0 },
        cratePrice: 100,
        kg: 50,
        discount_kg: 0,
        total: 10800,
        profit: 1600,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Liton Ahmed',
            supplier_id: 9,
            product: 'Watermelon',
            qty: 40,
            lot_name: 'LA-111025-WATERMELON-40',
            use_qty: 10
          }
        ],
        total_from_lots: 10
      }
    ]
  },
  {
    customer: {
      sl: 4,
      image: 'https://i.postimg.cc/4NvZQLT4/pexels-photo-1181686.webp',
      name: 'Farhana Akter',
      email: 'farhana.akter@example.com',
      type: 'Customer',
      phone: '+8801711000004',
      balance: 0,
      due: 0,
      crate: { type_one: { qty: 2, price: 100 }, type_two: { qty: 0, price: 150 } },
      cost: 0,
      orders: 210,
      totalSpent: 18400,
      location: 'Sylhet, Bangladesh'
    },
    summary: {
      date: '2025-10-15',
      sub_total: 9200,
      commission_total: 0,
      profit_total: 1400
    },
    payment: {
      receiveAmount: 9200,
      changeAmount: 0,
      dueAmount: 0,
      paymentType: 'cash',
      note: '',
      vatType: 'Select'
    },
    items: [
      {
        id: 5,
        name: 'Orange',
        price: 100,
        cost_price: 80,
        selling_price: 100,
        image: 'https://i.postimg.cc/qqdPSSP0/Chat-GPT-Image-Oct-11-2025-11-05-15-AM.png',
        category: 'Fruits',
        brand: 'Citrus Co',
        product_id: 5,
        product_name: 'Orange',
        crate: { type_one: 5, type_two: 0 },
        cratePrice: 500,
        kg: 80,
        discount_kg: 0,
        total: 9200,
        profit: 1400,
        commission: 0,
        commission_rate: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Imran Hossain',
            supplier_id: 604,
            product: 'Orange',
            qty: 40,
            lot_name: 'IH-111025-ORANGE-40',
            use_qty: 10
          },
          {
            supplier_name: 'Tasnim Akter',
            supplier_id: 603,
            product: 'Orange',
            qty: 28,
            lot_name: 'TAK-111025-ORANGE-28',
            use_qty: 8
          }
        ],
        total_from_lots: 18
      }
    ]
  },
  {
    customer: {
      sl: 5,
      image: 'https://i.postimg.cc/y6kCSFrd/pexels-photo-2379004.webp',
      name: 'Rafiul Islam',
      email: 'rafiul.islam@example.com',
      type: 'Customer',
      phone: '+8801711000005',
      balance: 0,
      due: 2000,
      crate: { type_one: { qty: 1, price: 100 }, type_two: { qty: 0, price: 150 } },
      cost: 0,
      orders: 285,
      totalSpent: 12400,
      location: 'Barishal, Bangladesh'
    },
    summary: {
      date: '2025-10-16',
      sub_total: 11400,
      commission_total: 0,
      profit_total: 1800
    },
    payment: {
      receiveAmount: 9400,
      changeAmount: 0,
      dueAmount: 2000,
      paymentType: 'mobile',
      note: 'Partial payment bKash',
      vatType: 'Select'
    },
    items: [
      {
        id: 2,
        name: 'Pineapple',
        price: 90,
        cost_price: 70,
        selling_price: 90,
        image: 'https://i.postimg.cc/Y2T1HbRX/Chat-GPT-Image-Oct-9-2025-07-01-22-PM.png',
        category: 'Fruits',
        brand: 'Tropical Fresh',
        commission_rate: 20,
        product_id: 2,
        product_name: 'Pineapple',
        crate: { type_one: 0, type_two: 10 },
        cratePrice: 1500,
        kg: 30,
        discount_kg: 0,
        total: 11400,
        profit: 1800,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Hasan Mahmud',
            supplier_id: 403,
            product: 'Pineapple',
            qty: 25,
            lot_name: 'HM-111025-PINEAPPLE-25',
            use_qty: 10
          },
          {
            supplier_name: 'Nusrat Jahan',
            supplier_id: 404,
            product: 'Pineapple',
            qty: 30,
            lot_name: 'NJ-111025-PINEAPPLE-30',
            use_qty: 5
          }
        ],
        total_from_lots: 15
      }
    ]
  },
  {
    customer: {
      sl: 6,
      image: 'https://i.postimg.cc/P5byb0cw/pexels-photo-774909.webp',
      name: 'Sumaiya Akter',
      email: 'sumaiya.akter@example.com',
      type: 'Customer',
      phone: '+8801711000006',
      balance: 0,
      due: 0,
      crate: { type_one: { qty: 2, price: 100 }, type_two: { qty: 1, price: 150 } },
      cost: 0,
      orders: 175,
      totalSpent: 18600,
      location: 'Comilla, Bangladesh'
    },
    summary: {
      date: '2025-10-16',
      sub_total: 12400,
      commission_total: 0,
      profit_total: 1900
    },
    payment: {
      receiveAmount: 12400,
      changeAmount: 0,
      dueAmount: 0,
      paymentType: 'cash',
      note: 'Full cash payment',
      vatType: 'Select'
    },
    items: [
      {
        id: 5,
        name: 'Orange',
        price: 100,
        cost_price: 80,
        selling_price: 100,
        image: 'https://i.postimg.cc/qqdPSSP0/Chat-GPT-Image-Oct-11-2025-11-05-15-AM.png',
        category: 'Fruits',
        brand: 'Citrus Co',
        commission_rate: 0,
        product_id: 5,
        product_name: 'Orange',
        crate: { type_one: 2, type_two: 0 },
        cratePrice: 200,
        kg: 70,
        discount_kg: 0,
        total: 12400,
        profit: 1900,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Sohail Ahmed',
            supplier_id: 602,
            product: 'Orange',
            qty: 30,
            lot_name: 'SAH-111025-ORANGE-30',
            use_qty: 25
          },
          {
            supplier_name: 'Tasnim Akter',
            supplier_id: 603,
            product: 'Orange',
            qty: 28,
            lot_name: 'TAK-111025-ORANGE-28',
            use_qty: 20
          }
        ],
        total_from_lots: 45
      }
    ]
  },
  {
    customer: {
      sl: 7,
      image: 'https://i.postimg.cc/0jXzLhXM/pexels-photo-1858175.webp',
      name: 'Tariqul Alam',
      email: 'tariqul.alam@example.com',
      type: 'Customer',
      phone: '+8801711000007',
      balance: 0,
      due: 1500,
      crate: { type_one: { qty: 0, price: 100 }, type_two: { qty: 1, price: 150 } },
      cost: 0,
      orders: 243,
      totalSpent: 15600,
      location: 'Khulna, Bangladesh'
    },
    summary: {
      date: '2025-10-13',
      sub_total: 11500,
      commission_total: 0,
      profit_total: 1600
    },
    payment: {
      receiveAmount: 10000,
      changeAmount: 0,
      dueAmount: 1500,
      paymentType: 'bank transfer',
      note: 'Remaining due next week',
      vatType: 'Select'
    },
    items: [
      {
        id: 1,
        name: 'Mango',
        price: 100,
        cost_price: 80,
        selling_price: 100,
        image: 'https://i.postimg.cc/4y0HNNp5/Chat-GPT-Image-Oct-9-2025-06-54-36-PM.png',
        category: 'Fruits',
        brand: 'Fresh Farm',
        commission_rate: 10,
        product_id: 1,
        product_name: 'Mango',
        crate: { type_one: 1, type_two: 1 },
        cratePrice: 250,
        kg: 55,
        discount_kg: 0,
        total: 11500,
        profit: 1600,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Abdur Rahman',
            supplier_id: 201,
            product: 'Mango',
            qty: 75,
            lot_name: 'AR-111025-MANGO-75',
            use_qty: 12
          }
        ],
        total_from_lots: 12
      }
    ]
  },
  {
    customer: {
      sl: 8,
      image: 'https://i.postimg.cc/gJJh8tTD/pexels-photo-774909.webp',
      name: 'Lamia Rahman',
      email: 'lamia.rahman@example.com',
      type: 'Customer',
      phone: '+8801711000008',
      balance: 0,
      due: 0,
      crate: { type_one: { qty: 1, price: 100 }, type_two: { qty: 1, price: 150 } },
      cost: 0,
      orders: 191,
      totalSpent: 9400,
      location: 'Gazipur, Bangladesh'
    },
    summary: {
      date: '2025-10-13',
      sub_total: 9400,
      commission_total: 0,
      profit_total: 1300
    },
    payment: {
      receiveAmount: 9400,
      changeAmount: 0,
      dueAmount: 0,
      paymentType: 'card',
      note: 'POS payment',
      vatType: 'Select'
    },
    items: [
      {
        id: 4,
        name: 'Apple',
        price: 150,
        cost_price: 120,
        selling_price: 150,
        image: 'https://i.postimg.cc/90j6KK62/Chat-GPT-Image-Oct-11-2025-10-57-06-AM.png',
        category: 'Fruits',
        brand: 'Fresh Orchard',
        commission_rate: 0,
        product_id: 4,
        product_name: 'Apple',
        crate: { type_one: 1, type_two: 0 },
        cratePrice: 100,
        kg: 35,
        discount_kg: 0,
        total: 9400,
        profit: 1300,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Fazlul Karim',
            supplier_id: 503,
            product: 'Apple',
            qty: 35,
            lot_name: 'FK-111025-APPLE-35',
            use_qty: 15
          }
        ],
        total_from_lots: 15
      }
    ]
  },
  {
    customer: {
      sl: 9,
      image: 'https://i.postimg.cc/L5pQTK6m/pexels-photo-774909.webp',
      name: 'Mahmudul Hasan',
      email: 'mahmudul.hasan@example.com',
      type: 'Customer',
      phone: '+8801711000009',
      balance: 0,
      due: 2600,
      crate: { type_one: { qty: 2, price: 100 }, type_two: { qty: 0, price: 150 } },
      cost: 0,
      orders: 129,
      totalSpent: 14500,
      location: 'Mymensingh, Bangladesh'
    },
    summary: {
      date: '2025-10-13',
      sub_total: 12600,
      commission_total: 0,
      profit_total: 1700
    },
    payment: {
      receiveAmount: 10000,
      changeAmount: 0,
      dueAmount: 2600,
      paymentType: 'mobile',
      note: 'bKash payment partially done',
      vatType: 'Select'
    },
    items: [
      {
        id: 3,
        name: 'Banana',
        price: 60,
        cost_price: 45,
        selling_price: 60,
        image: 'https://i.postimg.cc/q72FsNRC/Chat-GPT-Image-Oct-9-2025-07-05-58-PM.png',
        category: 'Fruits',
        brand: 'Nature Organic',
        commission_rate: 0,
        product_id: 3,
        product_name: 'Banana',
        crate: { type_one: 0, type_two: 15 },
        cratePrice: 2250,
        kg: 45,
        discount_kg: 0,
        total: 12600,
        profit: 1700,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Rahima Khatun',
            supplier_id: 304,
            product: 'Banana',
            qty: 35,
            lot_name: 'RK-111025-BANANA-35',
            use_qty: 12
          }
        ],
        total_from_lots: 12
      }
    ]
  },
  {
    customer: {
      sl: 10,
      image: 'https://i.postimg.cc/gkkYhcR1/pexels-photo-2379004.webp',
      name: 'Shamim Ahmed',
      email: 'shamim.ahmed@example.com',
      type: 'Customer',
      phone: '+8801711000010',
      balance: 0,
      due: 0,
      crate: { type_one: { qty: 1, price: 100 }, type_two: { qty: 0, price: 150 } },
      cost: 0,
      orders: 198,
      totalSpent: 9800,
      location: 'Rangpur, Bangladesh'
    },
    summary: {
      date: '2025-10-13',
      sub_total: 9800,
      commission_total: 0,
      profit_total: 1500
    },
    payment: {
      receiveAmount: 9800,
      changeAmount: 0,
      dueAmount: 0,
      paymentType: 'cash',
      note: 'Completed order payment',
      vatType: 'Select'
    },
    items: [
      {
        id: 8,
        name: 'Watermelon',
        price: 200,
        cost_price: 160,
        selling_price: 200,
        image: 'https://i.postimg.cc/nrcL64qc/pexels-mahmoud-yahyaoui-27863683.jpg',
        category: 'Fruits',
        brand: 'Green Fields',
        commission_rate: 0,
        product_id: 8,
        product_name: 'Watermelon',
        crate: { type_one: 0, type_two: 2 },
        cratePrice: 300,
        kg: 60,
        discount_kg: 0,
        total: 9800,
        profit: 1500,
        commission: 0,
        selling_date: '2025-10-13',
        expiry_date: '',
        lots_selected: [
          {
            supplier_name: 'Liton Ahmed',
            supplier_id: 9,
            product: 'Watermelon',
            qty: 40,
            lot_name: 'LA-111025-WATERMELON-40',
            use_qty: 20
          }
        ],
        total_from_lots: 20
      }
    ]
  }
]

export const purchaseReturns = [
  {
    id: 101,
    productId: 'p001',
    productName: 'Organic Apples',
    sku: 'APL-ORG-500G',
    quantityPurchased: 50,
    quantityReturned: 5,
    unitPrice: 2.5,
    returnAmount: 12.5,
    reason: 'Damaged on delivery',
    returnDate: '2025-09-01',
    supplier: 'FreshFarms Ltd'
  },
  {
    id: 102,
    productId: 'p002',
    productName: 'Mango',
    sku: 'MNG-500G',
    quantityPurchased: 30,
    quantityReturned: 2,
    unitPrice: 3.0,
    returnAmount: 6.0,
    reason: 'Expired',
    returnDate: '2025-09-02',
    supplier: 'FruitHouse'
  }
]

export const salesReturns = [
  {
    id: 201,
    productId: 'p001',
    productName: 'Organic Apples',
    sku: 'APL-ORG-500G',
    quantitySold: 20,
    quantityReturned: 2,
    unitPrice: 8.0,
    returnAmount: 16.0,
    reason: 'Defective',
    returnDate: '2025-09-16',
    customer: 'John Doe'
  },
  {
    id: 202,
    productId: 'p002',
    productName: 'Mango',
    sku: 'MNG-500G',
    quantitySold: 15,
    quantityReturned: 1,
    unitPrice: 10.0,
    returnAmount: 10.0,
    reason: 'Wrong item',
    returnDate: '2025-09-03',
    customer: 'Alice Smith'
  }
]

export const expenses = [
  {
    sl: 1,
    amount: 2500,
    category: 'Purchase',
    expenseFor: 'Raw Materials',
    paymentType: 'Cash',
    referenceNumber: 'REF-1001',
    expenseDate: '2025-09-01'
  },
  {
    sl: 2,
    amount: 1200,
    category: 'Utility',
    expenseFor: 'Electricity Bill',
    paymentType: 'Bank Transfer',
    referenceNumber: 'REF-1002',
    expenseDate: '2025-09-02'
  },
  {
    sl: 3,
    amount: 500,
    category: 'Payroll',
    expenseFor: 'Staff Salary',
    paymentType: 'Cash',
    referenceNumber: 'REF-1003',
    expenseDate: '2025-09-03'
  }
]

export const stocks = [
  {
    stockId: 'STK-001',
    productId: 'p001',
    productName: 'Mango',
    sku: 'APL123',
    openingQty: 100,
    closingQty: 70,
    unitCost: 25,
    unitPrice: 40
  },
  {
    stockId: 'STK-002',
    productId: 'p002',
    productName: 'Organic Apples',
    sku: 'ORG456',
    openingQty: 80,
    closingQty: 50,
    unitCost: 30,
    unitPrice: 50
  }
]
