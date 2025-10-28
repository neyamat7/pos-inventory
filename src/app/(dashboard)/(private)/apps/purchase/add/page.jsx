// import { getAllSuppliers, getEcommerceData } from '@/app/server/actions'
// import AddPurchase from '@/views/apps/purchase/add/AddPurchase'

// const add = async () => {
//   const data = await getEcommerceData()
//   const suppliers = await getAllSuppliers()

//   return <AddPurchase productsData={data?.productsData} suppliersData={suppliers} />
// }

// export default add

import { getAllCategories } from '@/actions/categoryActions'
import { getAllProducts } from '@/actions/productActions'
import { getSuppliers } from '@/actions/supplierAction'
import AddPurchase from '@/views/apps/purchase/add/AddPurchase'

const add = async () => {
  const productsResponse = await getAllProducts({ page: 1, limit: 100 })
  const suppliersResponse = await getSuppliers(1, 100)
  const categoriesResponse = await getAllCategories({ page: 1, limit: 50 })

  // console.log('suppp', suppliersResponse)
  // console.log('productsResponse', productsResponse)
  // console.log('categories', categoriesResponse)

  return (
    <AddPurchase
      productsData={productsResponse.products}
      suppliersData={suppliersResponse.data?.suppliers || []}
      categoriesData={categoriesResponse.categories || []}
    />
  )
}

export default add
