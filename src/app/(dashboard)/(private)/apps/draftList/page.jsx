import React from 'react'

import DraftList from '@/views/apps/sales/draftList'
import { draftProducts } from '@/fake-db/apps/customerReportData'

export default async function DraftListPage() {
  return <DraftList draftProducts={draftProducts} />
}
