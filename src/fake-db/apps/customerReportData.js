export const customerReportData = [
  {
    sl: 1,
    name: 'Rahman Super Store',
    totalPurchase: 95000,
    totalReturn: 4000,
    due: 18000
  },
  {
    sl: 2,
    name: 'Khan Brothers',
    totalPurchase: 72000,
    totalReturn: 2500,
    due: 10000
  },
  {
    sl: 3,
    name: 'Green Mart',
    totalPurchase: 56000,
    totalReturn: 3000,
    due: 7000
  },
  {
    sl: 4,
    name: 'Mithun Enterprise',
    totalPurchase: 132000,
    totalReturn: 7500,
    due: 22000
  },
  {
    sl: 5,
    name: 'City General Store',
    totalPurchase: 81000,
    totalReturn: 1200,
    due: 9000
  },
  {
    sl: 6,
    name: 'Fresh Choice Ltd',
    totalPurchase: 104000,
    totalReturn: 5000,
    due: 15000
  }
]

export const salesReports = [
  {
    id: 1,
    date: '2025-09-25',
    lotName: 'SA-250925-RICE-01',
    customerName: 'Stanfield Baser',
    salesStatus: 'Completed',
    paymentStatus: 'Paid',
    grandTotal: 18500,
    paidAmount: 18500,
    due: 0,
    qty: 25,
    addedBy: 'Shahidul Alam'
  },

  {
    id: 2,
    date: '2025-09-26',
    lotName: 'RI-260925-BANANA-05',
    customerName: 'Rafael Ivanov',
    salesStatus: 'Completed',
    paymentStatus: 'Paid',
    grandTotal: 4200,
    paidAmount: 4200,
    due: 0,
    qty: 12,
    addedBy: 'Rafiqul Islam'
  },

  {
    id: 3,
    date: '2025-09-27',
    lotName: 'MH-270925-PINEAPPLE-03',
    customerName: 'Mina Hurst',
    salesStatus: 'Completed',
    paymentStatus: 'Partially Paid',
    grandTotal: 6000,
    paidAmount: 4000,
    due: 2000,
    qty: 18,
    addedBy: 'Mehedi Hasan'
  },

  {
    id: 4,
    date: '2025-09-28',
    lotName: 'NA-280925-APPLE-10',
    customerName: 'Nash Alford',
    salesStatus: 'Completed',
    paymentStatus: 'Paid',
    grandTotal: 10500,
    paidAmount: 10500,
    due: 0,
    qty: 20,
    addedBy: 'Nasrin Akter'
  },

  {
    id: 5,
    date: '2025-09-29',
    lotName: 'FY-290925-ORANGE-15',
    customerName: 'Floyd Young',
    salesStatus: 'Completed',
    paymentStatus: 'Paid',
    grandTotal: 8250,
    paidAmount: 8250,
    due: 0,
    qty: 15,
    addedBy: 'Farhana Yasmin'
  },

  {
    id: 6,
    date: '2025-09-30',
    lotName: 'SA-300925-MANGO-20',
    customerName: 'Stanfield Baser',
    salesStatus: 'Completed',
    paymentStatus: 'Unpaid',
    grandTotal: 12000,
    paidAmount: 0,
    due: 12000,
    qty: 28,
    addedBy: 'Shahidul Alam'
  },

  {
    id: 7,
    date: '2025-10-01',
    lotName: 'AR-011025-MANGO-50',
    customerName: 'Ava Riley',
    salesStatus: 'Completed',
    paymentStatus: 'Paid',
    grandTotal: 28500,
    paidAmount: 28500,
    due: 0,
    qty: 30,
    addedBy: 'Abdur Rahman'
  },

  {
    id: 8,
    date: '2025-10-02',
    lotName: 'HR-021025-BANANA-10',
    customerName: 'Hugo Richards',
    salesStatus: 'Completed',
    paymentStatus: 'Partially Paid',
    grandTotal: 4800,
    paidAmount: 3000,
    due: 1800,
    qty: 9,
    addedBy: 'Habibur Rahman'
  },

  {
    id: 9,
    date: '2025-10-03',
    lotName: 'MA-031025-APPLE-25',
    customerName: 'Mia Adams',
    salesStatus: 'Completed',
    paymentStatus: 'Paid',
    grandTotal: 14250,
    paidAmount: 14250,
    due: 0,
    qty: 23,
    addedBy: 'Mahfuz Alam'
  },

  {
    id: 10,
    date: '2025-10-04',
    lotName: 'NJ-041025-PINEAPPLE-12',
    customerName: 'Nora James',
    salesStatus: 'Completed',
    paymentStatus: 'Paid',
    grandTotal: 7800,
    paidAmount: 7800,
    due: 0,
    qty: 11,
    addedBy: 'Nusrat Jahan'
  },

  {
    id: 11,
    date: '2025-10-05',
    lotName: 'RB-051025-ORANGE-08',
    customerName: 'Ryan Brooks',
    salesStatus: 'Completed',
    paymentStatus: 'Partially Paid',
    grandTotal: 5200,
    paidAmount: 4000,
    due: 1200,
    qty: 17,
    addedBy: 'Rokeya Begum'
  },

  {
    id: 12,
    date: '2025-10-06',
    lotName: 'TA-061025-MANGO-30',
    customerName: 'Thomas Allen',
    salesStatus: 'Completed',
    paymentStatus: 'Paid',
    grandTotal: 16800,
    paidAmount: 16800,
    due: 0,
    qty: 26,
    addedBy: 'Tanvir Alam'
  }
]

export const customerReturns = [
  {
    date: '2025-09-28',
    customerId: 'SUP-001',
    customerName: 'Stanfield Baser',
    product: 'Mango',
    lot_name: 'SA-270925-MANGO-02',
    quantity: 20,
    amount: 1500,
    paid: 1000,
    returnAmount: 500,
    reason: 'Overripe / damaged during transport'
  },
  {
    date: '2025-09-29',
    customerId: 'SUP-002',
    customerName: 'Rafael Ivanov',
    product: 'Banana',
    lot_name: 'RI-290925-BANANA-04',
    quantity: 15,
    amount: 900,
    paid: 600,
    returnAmount: 300,
    reason: 'Spoiled due to delayed delivery'
  },
  {
    date: '2025-09-30',
    customerId: 'SUP-003',
    customerName: 'Nash Alford',
    product: 'Apple',
    lot_name: 'NA-300925-APPLE-03',
    quantity: 10,
    amount: 1200,
    paid: 900,
    returnAmount: 300,
    reason: 'Bruised and soft texture'
  },
  {
    date: '2025-10-01',
    customerId: 'SUP-004',
    customerName: 'Mina Hurst',
    product: 'Pineapple',
    lot_name: 'MH-011025-PINEAPPLE-01',
    quantity: 5,
    amount: 850,
    paid: 500,
    returnAmount: 350,
    reason: 'Damaged outer skin and sour smell'
  },
  {
    date: '2025-10-02',
    customerId: 'SUP-005',
    customerName: 'Floyd Young',
    product: 'Orange',
    lot_name: 'FY-021025-ORANGE-05',
    quantity: 12,
    amount: 960,
    paid: 700,
    returnAmount: 260,
    reason: 'Rotten pieces inside the batch'
  },
  {
    date: '2025-10-03',
    customerId: 'SUP-006',
    customerName: 'Lara Andrews',
    product: 'Watermelon',
    lot_name: 'LA-031025-WATERMELON-02',
    quantity: 8,
    amount: 1600,
    paid: 1000,
    returnAmount: 600,
    reason: 'Cracked during handling'
  },
  {
    date: '2025-10-04',
    customerId: 'SUP-007',
    customerName: 'Ava Riley',
    product: 'Mango',
    lot_name: 'AR-041025-MANGO-03',
    quantity: 25,
    amount: 2000,
    paid: 1500,
    returnAmount: 500,
    reason: 'Unripe and sour flavor reported by customer'
  },
  {
    date: '2025-10-05',
    customerId: 'SUP-008',
    customerName: 'Hugo Richards',
    product: 'Banana',
    lot_name: 'HR-051025-BANANA-06',
    quantity: 10,
    amount: 600,
    paid: 400,
    returnAmount: 200,
    reason: 'Black spots and soft peel'
  },
  {
    date: '2025-10-06',
    customerId: 'SUP-009',
    customerName: 'Mia Adams',
    product: 'Apple',
    lot_name: 'MA-061025-APPLE-04',
    quantity: 7,
    amount: 950,
    paid: 700,
    returnAmount: 250,
    reason: 'Moldy smell detected after delivery'
  },
  {
    date: '2025-10-07',
    customerId: 'SUP-010',
    customerName: 'Ryan Brooks',
    product: 'Orange',
    lot_name: 'RB-071025-ORANGE-03',
    quantity: 9,
    amount: 750,
    paid: 500,
    returnAmount: 250,
    reason: 'Incorrect size / smaller than ordered'
  },
  {
    date: '2025-10-08',
    customerId: 'SUP-011',
    customerName: 'Nora James',
    product: 'Pineapple',
    lot_name: 'NJ-081025-PINEAPPLE-02',
    quantity: 4,
    amount: 680,
    paid: 400,
    returnAmount: 280,
    reason: 'Fermented odor indicating early spoilage'
  },
  {
    date: '2025-10-09',
    customerId: 'SUP-012',
    customerName: 'Thomas Allen',
    product: 'Mango',
    lot_name: 'TA-091025-MANGO-05',
    quantity: 18,
    amount: 1350,
    paid: 900,
    returnAmount: 450,
    reason: 'Customer complaint: inconsistent ripeness'
  }
]

export const customerPayments = [
  {
    date: '2025-09-25',
    method: 'Cash',
    amount: 18500,
    ref: 'PAY-250925-001',
    note: 'Full payment for Lot SA-250925-RICE-01',
    customerId: 'SUP-001'
  },
  {
    date: '2025-09-26',
    method: 'Bank Transfer',
    amount: 4200,
    ref: 'PAY-260925-002',
    note: 'Payment for Banana Lot RI-260925-BANANA-05',
    customerId: 'SUP-002'
  },
  {
    date: '2025-09-27',
    method: 'Cash',
    amount: 4000,
    ref: 'PAY-270925-003',
    note: 'Partial payment for Pineapple Lot MH-270925-PINEAPPLE-03',
    customerId: 'SUP-003'
  },
  {
    date: '2025-09-28',
    method: 'Card',
    amount: 10500,
    ref: 'PAY-280925-004',
    note: 'Full payment for Apple Lot NA-280925-APPLE-10',
    customerId: 'SUP-004'
  },
  {
    date: '2025-09-29',
    method: 'Mobile Payment',
    amount: 8250,
    ref: 'PAY-290925-005',
    note: 'Full payment for Orange Lot FY-290925-ORANGE-15',
    customerId: 'SUP-005'
  },
  {
    date: '2025-09-30',
    method: 'Cash',
    amount: 6000,
    ref: 'PAY-300925-006',
    note: 'Advance payment for Mango Lot SA-300925-MANGO-20',
    customerId: 'SUP-006'
  },
  {
    date: '2025-10-01',
    method: 'Bank Transfer',
    amount: 28500,
    ref: 'PAY-011025-007',
    note: 'Full payment for Mango Lot AR-011025-MANGO-50',
    customerId: 'SUP-007'
  },
  {
    date: '2025-10-02',
    method: 'Card',
    amount: 3000,
    ref: 'PAY-021025-008',
    note: 'Partial payment for Banana Lot HR-021025-BANANA-10',
    customerId: 'SUP-008'
  },
  {
    date: '2025-10-03',
    method: 'Cash',
    amount: 14250,
    ref: 'PAY-031025-009',
    note: 'Full payment for Apple Lot MA-031025-APPLE-25',
    customerId: 'SUP-009'
  },
  {
    date: '2025-10-04',
    method: 'Mobile Payment',
    amount: 7800,
    ref: 'PAY-041025-010',
    note: 'Full payment for Pineapple Lot NJ-041025-PINEAPPLE-12',
    customerId: 'SUP-010'
  },
  {
    date: '2025-10-05',
    method: 'Cash',
    amount: 4000,
    ref: 'PAY-051025-011',
    note: 'Partial payment for Orange Lot RB-051025-ORANGE-08',
    customerId: 'SUP-011'
  },
  {
    date: '2025-10-06',
    method: 'Bank Transfer',
    amount: 16800,
    ref: 'PAY-061025-012',
    note: 'Full payment for Mango Lot TA-061025-MANGO-30',
    customerId: 'SUP-012'
  }
]

export const draftProducts = [
  {
    id: 1,
    date: '2025-09-25',
    customer_name: 'Saiful Alam',
    contact_number: '+8801711000001',
    lot_name: 'SA-250925-RICE-01',
    product_name: 'Rice',
    kg: 1200,
    location: 'Dhaka',
    added_by: 'Rafiqul Islam'
  },
  {
    id: 2,
    date: '2025-09-26',
    customer_name: 'Rafiqul Islam',
    contact_number: '+8801722000002',
    lot_name: 'RI-260925-BANANA-02',
    product_name: 'Banana',
    kg: 850,
    location: 'Chattogram',
    added_by: 'Mehedi Hasan'
  },
  {
    id: 3,
    date: '2025-09-27',
    customer_name: 'Mehedi Hasan',
    contact_number: '+8801733000003',
    lot_name: 'MH-270925-PINEAPPLE-03',
    product_name: 'Pineapple',
    kg: 640,
    location: 'Sylhet',
    added_by: 'Nasrin Akter'
  },
  {
    id: 4,
    date: '2025-09-28',
    customer_name: 'Nasrin Akter',
    contact_number: '+8801744000004',
    lot_name: 'NA-280925-APPLE-04',
    product_name: 'Apple',
    kg: 900,
    location: 'Rajshahi',
    added_by: 'Farhana Yasmin'
  },
  {
    id: 5,
    date: '2025-09-29',
    customer_name: 'Farhana Yasmin',
    contact_number: '+8801755000005',
    lot_name: 'FY-290925-ORANGE-05',
    product_name: 'Orange',
    kg: 1050,
    location: 'Khulna',
    added_by: 'Abdur Rahman'
  },
  {
    id: 6,
    date: '2025-09-30',
    customer_name: 'Abdur Rahman',
    contact_number: '+8801766000006',
    lot_name: 'AR-300925-MANGO-06',
    product_name: 'Mango',
    kg: 700,
    location: 'Barishal',
    added_by: 'Tanvir Alam'
  },
  {
    id: 7,
    date: '2025-10-01',
    customer_name: 'Tanvir Alam',
    contact_number: '+8801777000007',
    lot_name: 'TA-011025-GUAVA-07',
    product_name: 'Guava',
    kg: 550,
    location: 'Rangpur',
    added_by: 'Shahidul Alam'
  },
  {
    id: 8,
    date: '2025-10-02',
    customer_name: 'Shahidul Alam',
    contact_number: '+8801788000008',
    lot_name: 'SA-021025-WATERMELON-08',
    product_name: 'Watermelon',
    kg: 1500,
    location: 'Mymensingh',
    added_by: 'Habibur Rahman'
  },
  {
    id: 9,
    date: '2025-10-03',
    customer_name: 'Habibur Rahman',
    contact_number: '+8801799000009',
    lot_name: 'HR-031025-LEMON-09',
    product_name: 'Lemon',
    kg: 420,
    location: 'Cumilla',
    added_by: 'Mahfuz Alam'
  },
  {
    id: 10,
    date: '2025-10-04',
    customer_name: 'Mahfuz Alam',
    contact_number: '+8801700000010',
    lot_name: 'MA-041025-MANGO-10',
    product_name: 'Mango',
    kg: 950,
    location: 'Gazipur',
    added_by: 'Nusrat Jahan'
  },
  {
    id: 11,
    date: '2025-10-05',
    customer_name: 'Nusrat Jahan',
    contact_number: '+8801711000011',
    lot_name: 'NJ-051025-BANANA-11',
    product_name: 'Banana',
    kg: 870,
    location: 'Bogura',
    added_by: 'Rokeya Begum'
  },
  {
    id: 12,
    date: '2025-10-06',
    customer_name: 'Rokeya Begum',
    contact_number: '+8801722000012',
    lot_name: 'RB-061025-PINEAPPLE-12',
    product_name: 'Pineapple',
    kg: 1120,
    location: 'Jessore',
    added_by: 'Saiful Alam'
  }
]
