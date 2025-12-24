'use client'

import { useEffect, useState } from 'react'

import { getSuppliers } from '@/actions/supplierAction/supplier.action'
import ProfitLoss from '@/views/apps/profitLoss'
import { useAdmin } from '@/hooks/useAdmin'

const ProfitLossPage = () => {
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin || adminLoading) return

    const fetchData = async () => {
      setLoading(true)
      const result = await getSuppliers(1, 100)

      // console.log('suppliers data' ,result)

      if (result.success) {
        setSuppliers(result.data.suppliers)
      }

      setLoading(false)
    }

    fetchData()
  }, [isAdmin, adminLoading])

  // Show access denied if not admin (only after loading is finished)
  if (!adminLoading && !isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] p-10 text-center'>
        <div className='mb-4 text-6xl'>🚫</div>
        <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
        <p className='text-gray-500'>You do not have permission to view this page.</p>
      </div>
    )
  }

  return <ProfitLoss suppliers={suppliers} />
}

export default ProfitLossPage
