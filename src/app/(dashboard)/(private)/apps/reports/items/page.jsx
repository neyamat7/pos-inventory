import { itemsReport } from '@/fake-db/apps/itemsReports' 
import ItemsReport from '@/views/apps/reports/itemsReport'

const ItemsReportPage = () => { 
  return <ItemsReport itemsReportData={itemsReport} />
}

export default ItemsReportPage
