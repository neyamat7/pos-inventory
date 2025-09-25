import { supplierReportData } from '@/fake-db/apps/supplierReport'
import SuppliersReport from '@/views/apps/reports/suppliersReport'

const SupplierReportPage = () => {
  return <SuppliersReport supplierReportData={supplierReportData} />
}

export default SupplierReportPage
