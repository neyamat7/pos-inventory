import { accountReport } from '@/fake-db/apps/accountReport'
import AccountReport from '@/views/apps/accounts/accountReport'

const PaymentReportPage = () => {
  return <AccountReport accountReport={accountReport} />
}

export default PaymentReportPage
