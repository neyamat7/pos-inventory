import { branches } from '@/fake-db/apps/branches'
import Branches from '@/views/apps/branches'

const BranchesPage = () => {
  return <Branches branchesData={branches} />
}

export default BranchesPage
