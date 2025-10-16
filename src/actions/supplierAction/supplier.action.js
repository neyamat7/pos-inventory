// Mock fetch function for supplier lots
const fetchLotsBySupplier = async supplierId => {
  const allLots = [
    {
      supplier_name: 'Shahidul Alam',
      supplier_id: 1,
      product: 'Mango',
      used: 10,
      lot_name: 'SA-111025-MANGO-10',
      category: 'Fruits',
      total_amount: 100,
      purchaseDate: '2025-10-11'
    },
    {
      supplier_name: 'Shahidul Alam',
      supplier_id: 1,
      product: 'Banana',
      used: 25,
      lot_name: 'SA-101025-BANANA-09',
      category: 'Fruits',
      total_amount: 250,
      purchaseDate: '2025-10-10'
    },
    {
      supplier_name: 'Shahidul Alam',
      supplier_id: 1,
      product: 'Pineapple',
      used: 18,
      lot_name: 'SA-091025-PINEAPPLE-08',
      category: 'Fruits',
      total_amount: 180,
      purchaseDate: '2025-10-09'
    }

    // Add more for testing
  ]

  // Filter lots for this supplier and take 6 latest
  const filtered = allLots
    .filter(lot => lot.supplier_id === supplierId)
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
    .slice(0, 6)

  return filtered
}

export { fetchLotsBySupplier }
