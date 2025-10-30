import { getAllCategories } from '@/actions/categoryActions'
import { getCustomers } from '@/actions/customerActions'
import { getAllLots, getInStockLots } from '@/actions/lotActions'
import { getAllProducts } from '@/actions/productActions'
import POSSystem from '@/views/apps/sales/pos/Pos'

const posPage = async () => {
  const [customers, lots, products, categories] = await Promise.all([
    getCustomers(1, 100),
    getInStockLots(),
    getAllProducts({ page: 1, limit: 100 }),
    getAllCategories({ page: 1, limit: 100 })
  ])

  // console.log('customers', customers)
  // console.log('lots', lots)
  // console.log('products', products)

  return (
    <POSSystem
      customersData={customers.success ? customers.data.customers : []}
      lotsData={lots.lots}
      productsData={products.products}
      categoriesData={categories.categories}
    />
  )
}

export default posPage
