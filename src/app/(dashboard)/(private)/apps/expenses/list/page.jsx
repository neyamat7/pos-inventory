// Data Imports
import { getEcommerceData } from '@/app/server/actions'
import ExpenseListTable from '@/views/apps/expenses/list/ExpenseListTable'

const ExpensesList = async () => {
  const data = await getEcommerceData()

  return <ExpenseListTable expenseData={data?.expenseData} />
}

export default ExpensesList
