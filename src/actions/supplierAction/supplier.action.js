'use server'

import api from '@/libs/api'

// // Mock fetch function for supplier lots
// const fetchLotsBySupplier = async supplierId => {
//   const allLots = [
//     {
//       supplier_name: 'Shahidul Alam',
//       supplier_id: 1,
//       product: 'Mango',
//       used: 10,
//       lot_name: 'SA-111025-MANGO-10',
//       category: 'Fruits',
//       total_amount: 100,
//       purchaseDate: '2025-10-11'
//     },
//     {
//       supplier_name: 'Shahidul Alam',
//       supplier_id: 1,
//       product: 'Banana',
//       used: 25,
//       lot_name: 'SA-101025-BANANA-09',
//       category: 'Fruits',
//       total_amount: 250,
//       purchaseDate: '2025-10-10'
//     },
//     {
//       supplier_name: 'Shahidul Alam',
//       supplier_id: 1,
//       product: 'Pineapple',
//       used: 18,
//       lot_name: 'SA-091025-PINEAPPLE-08',
//       category: 'Fruits',
//       total_amount: 180,
//       purchaseDate: '2025-10-09'
//     }

//     // Add more for testing
//   ]

//   // Filter lots for this supplier and take 6 latest
//   const filtered = allLots
//     .filter(lot => lot.supplier_id === supplierId)
//     .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
//     .slice(0, 6)

//   return filtered
// }

// export { fetchLotsBySupplier }

export async function createSupplier(supplierData) {
  try {
    const response = await api.post('/suppliers/add', supplierData)

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Create supplier error:', error)

    return {
      success: false,
      error: error.message || 'Failed to create supplier'
    }
  }
}

export async function getSuppliers(page = 1, limit = 10) {
  try {
    const response = await api.get(`/suppliers/all?page=${page}&limit=${limit}`)

     

    return {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('Get suppliers error:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch suppliers'
    }
  }
}
