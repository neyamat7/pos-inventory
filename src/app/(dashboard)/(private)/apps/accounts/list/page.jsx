import { accountsData } from '@/fake-db/apps/accountsData'
import AccountList from '@/views/apps/accounts/list'

const AccountsListPage = () => {
  return <AccountList accountsData={accountsData} />
}

export default AccountsListPage
