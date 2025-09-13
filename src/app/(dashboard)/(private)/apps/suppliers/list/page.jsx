import SupplierListTable from '@/views/apps/ecommerce/suppliers/list/SupplierLIstTable'

const SupplierListTablePage = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/business/suppliers`, {
    cache: 'no-store'
  })

  const data = await res.json()

  // console.log(data)

  return <SupplierListTable supplierData={data} />
}

export default SupplierListTablePage
