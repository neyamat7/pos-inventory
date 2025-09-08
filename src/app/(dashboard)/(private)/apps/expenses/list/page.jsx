import CustomerListTable from '@views/apps/ecommerce/customers/list/CustomerListTable'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const ExpensesList = async () => {
  const data = await getEcommerceData()

  return <CustomerListTable customerData={data?.customerData} />
}

export default ExpensesList
