import { getEcommerceData } from '@/app/server/actions'
import EditProduct from '@/views/apps/ecommerce/products/edit/EditProduct'

export default async function Page({ params }) {
  console.log('params', params.id)
  const data = await getEcommerceData()

  console.log('data', data.products)

  return <EditProduct id={params.id} productData={data?.products} />
}
