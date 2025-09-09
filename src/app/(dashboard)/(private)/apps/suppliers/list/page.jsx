// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import SupplierListTable from '@/views/apps/ecommerce/suppliers/list/SupplierLIstTable'

const SupplierListTablePage = async () => {
  // Vars
  const data = await getEcommerceData()

  return <SupplierListTable supplierData={data?.supplierData} />
}

export default SupplierListTablePage
