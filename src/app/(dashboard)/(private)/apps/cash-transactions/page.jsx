export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'

import { getDailyCashHistory } from '@/actions/cashActions'
import CashTransactionsClient from './CashTransactionsClient'

const CashTransactionsPage = async () => {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]
  
  const result = await getDailyCashHistory({
    date: today,
    page: 1,
    limit: 10
  })

  return (
    <CashTransactionsClient 
      initialData={result.data || { history: [], totals: { totalCashIn: 0, totalCashOut: 0 }, pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }, filter: { date: today, year: null, month: null } }} 
    />
  )
}

export default CashTransactionsPage
