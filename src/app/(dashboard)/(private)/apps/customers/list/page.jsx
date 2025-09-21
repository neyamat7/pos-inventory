import CustomerListTable from '@views/apps/ecommerce/customers/list/CustomerListTable'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import { customers } from '@/data/customerData/customerData'

const CustomerListTablePage = async () => {
  // Vars
  // const data = await getEcommerceData()

  return <CustomerListTable customerData={customers} />
}

export default CustomerListTablePage
