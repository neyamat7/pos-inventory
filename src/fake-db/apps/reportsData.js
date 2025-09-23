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
    summary: { date: '2025-09-23', sub_total: 1020, commission_total: 60, profit_total: 244 },
    payment: {
      receiveAmount: 0,
      changeAmount: 0,
      dueAmount: 1020,
      paymentType: 'cash',
      note: '',
      vatType: 'Select'
    },
    customers: [
      {
        customer_id: 1,
        items: [{ product_id: 'p001', crate: 2, product_name: 'mango' }],
        sub_total: 342,
        commission_total: 22,
        profit_total: 244
      },
      {
        customer_id: 3,
        items: [{ product_id: 'p002', crate: 2, product_name: 'mango' }],
        sub_total: 678,
        commission_total: 38,
        profit_total: 244
      }
    ]
  },
  {
    summary: {
      date: '2025-09-23',
      sub_total: 364,
      commission_total: 24,
      profit_total: 244
    },
    payment: {
      receiveAmount: 0,
      changeAmount: 0,
      dueAmount: 364,
      paymentType: 'cash',
      note: '',
      vatType: 'Select'
    },
    customers: [
      {
        customer_id: 3,
        items: [
          {
            product_id: 1,
            crate: 2,
            product_name: 'mango'
          }
        ],
        sub_total: 364,
        commission_total: 24,
        profit_total: 244
      }
    ]
  },
  {
    summary: { date: '2025-09-23', sub_total: 840, commission_total: 55, profit_total: 244 },
    payment: {
      receiveAmount: 0,
      changeAmount: 0,
      dueAmount: 840,
      paymentType: 'card',
      note: 'Second sale',
      vatType: 'Select'
    },
    customers: [
      {
        customer_id: 2,
        items: [{ product_id: 'p001', crate: 2, product_name: 'mango' }],
        sub_total: 420,
        commission_total: 25,
        profit_total: 244
      },
      {
        customer_id: 4,
        items: [{ product_id: 'p002', crate: 2, product_name: 'mango' }],
        sub_total: 420,
        commission_total: 30,
        profit_total: 244
      }
    ]
  },

  {
    summary: { date: '2025-09-24', sub_total: 720, commission_total: 45, profit_total: 320 },
    payment: {
      receiveAmount: 720,
      changeAmount: 0,
      dueAmount: 0,
      paymentType: 'cash',
      note: 'Regular customer',
      vatType: 'VAT 15%'
    },
    customers: [
      {
        customer_id: 5,
        items: [
          { product_id: 'p003', crate: 3, product_name: 'mango' },
          { product_id: 'p004', crate: 1, product_name: 'mango' }
        ],
        sub_total: 720,
        commission_total: 45,
        profit_total: 320
      }
    ]
  },

  {
    summary: { date: '2025-09-25', sub_total: 1250, commission_total: 85, profit_total: 510 },
    payment: {
      receiveAmount: 1000,
      changeAmount: 0,
      dueAmount: 250,
      paymentType: 'mixed',
      note: 'Partial payment',
      vatType: 'VAT 10%'
    },
    customers: [
      {
        customer_id: 3,
        items: [{ product_id: 'p005', crate: 4, product_name: 'mango' }],
        sub_total: 600,
        commission_total: 35,
        profit_total: 220
      },
      {
        customer_id: 7,
        items: [{ product_id: 'p006', crate: 2, product_name: 'mango' }],
        sub_total: 350,
        commission_total: 25,
        profit_total: 150
      },
      {
        customer_id: 9,
        items: [{ product_id: 'p007', crate: 3, product_name: 'mango' }],
        sub_total: 300,
        commission_total: 25,
        profit_total: 140
      }
    ]
  },

  {
    summary: { date: '2025-09-26', sub_total: 2100, commission_total: 120, profit_total: 890 },
    payment: {
      receiveAmount: 0,
      changeAmount: 0,
      dueAmount: 2100,
      paymentType: 'credit',
      note: 'Monthly account',
      vatType: 'VAT 0%'
    },
    customers: [
      {
        customer_id: 12,
        items: [
          { product_id: 'p008', crate: 5, product_name: 'mango' },
          { product_id: 'p009', crate: 3, product_name: 'mango' },
          { product_id: 'p010', crate: 2, product_name: 'mango' }
        ],
        sub_total: 2100,
        commission_total: 120,
        profit_total: 890
      }
    ]
  },

  {
    summary: { date: '2025-09-27', sub_total: 280, commission_total: 18, profit_total: 95 },
    payment: {
      receiveAmount: 300,
      changeAmount: 20,
      dueAmount: 0,
      paymentType: 'cash',
      note: 'Walk-in customer',
      vatType: 'VAT 8%'
    },
    customers: [
      {
        customer_id: 15,
        items: [{ product_id: 'p011', crate: 1, product_name: 'mango' }],
        sub_total: 280,
        commission_total: 18,
        profit_total: 95
      }
    ]
  },

  {
    summary: { date: '2025-09-28', sub_total: 980, commission_total: 65, profit_total: 420 },
    payment: {
      receiveAmount: 980,
      changeAmount: 0,
      dueAmount: 0,
      paymentType: 'digital',
      note: 'Mobile payment',
      vatType: 'VAT 12%'
    },
    customers: [
      {
        customer_id: 8,
        items: [{ product_id: 'p012', crate: 2, product_name: 'mango' }],
        sub_total: 440,
        commission_total: 30,
        profit_total: 190
      },
      {
        customer_id: 11,
        items: [{ product_id: 'p013', crate: 3, product_name: 'mango' }],
        sub_total: 540,
        commission_total: 35,
        profit_total: 230
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
