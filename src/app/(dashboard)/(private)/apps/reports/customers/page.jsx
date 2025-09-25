import { customerReportData } from '@/fake-db/apps/customerReportData'
import CustomersReport from '@/views/apps/reports/customersReport'

const CustomersReportPage = () => {
  return <CustomersReport customerReportData={customerReportData} />
}

export default CustomersReportPage
