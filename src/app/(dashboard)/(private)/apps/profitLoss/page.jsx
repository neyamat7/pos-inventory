'use client'

import { useEffect, useState } from 'react'

import { getProfitLoss } from '@/actions/incomeActions'
import ProfitLoss from '@/views/apps/profitLoss/ind'
import { useAdmin } from '@/hooks/useAdmin'

const ProfitLossPage = () => {
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  const [profitLossData, setProfitLossData] = useState({
    totalCustomerProfit: 0,
    totalLotProfit: 0,
    totalCombinedProfit: 0,
    totalLoss: 0,
    recordCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin || adminLoading) return

    const fetchData = async () => {
      setLoading(true)
      const result = await getProfitLoss()

      if (result.success) {
        setProfitLossData(result.data)
      }

      setLoading(false)
    }

    fetchData()
  }, [isAdmin, adminLoading])

  // Show loading state
  if (adminLoading || loading) {
    return <div className='flex items-center justify-center min-h-[50vh]'>Loading...</div>
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] p-10 text-center'>
        <div className='mb-4 text-6xl'>🚫</div>
        <h1 className='text-2xl font-bold mb-2'>Access Denied</h1>
        <p className='text-gray-500'>You do not have permission to view this page.</p>
      </div>
    )
  }

  return <ProfitLoss profitLossData={profitLossData} />
}

export default ProfitLossPage
