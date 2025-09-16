import { getAllSuppliers } from '@/app/server/actions'
import SupplierListTable from '@/views/apps/ecommerce/suppliers/list/SupplierLIstTable'

const SupplierListTablePage = async () => {
  // const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/business/suppliers`, {
  //   cache: 'no-store'
  // })

  // const data = await res.json()

  // console.log('after updating', data)

  const suppliers = await getAllSuppliers()

  // console.log('suppliers by actions', suppliers)
  const data = suppliers

  return <SupplierListTable supplierData={data} />
}

export default SupplierListTablePage
