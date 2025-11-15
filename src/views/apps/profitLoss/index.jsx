'use client'

import { useRef, useState, useMemo, useEffect } from 'react'

import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

import { useReactToPrint } from 'react-to-print'

export default function ProfitLoss({ profitLossData }) {
  const [filterDate, setFilterDate] = useState('')
  const contentRef = useRef(null)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    setFilterDate(today)
  }, [])

  const handlePrint = useReactToPrint({ contentRef })

  // Use the props data directly
  const { totalCustomerProfit = 0, totalLotProfit = 0, totalCombinedProfit = 0, totalLoss = 0 } = profitLossData || {}

  return (
    <div className='p-6 bg-gradient-to-br from-gray-50 to-blue-50'>
      {/* Header Section */}
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold text-gray-900 mb-2'>Profit & Loss Report</h1>
      </div>

      {/* Filters and Actions */}
      <div className='flex flex-col lg:flex-row items-center justify-between mb-8 gap-4 no-print'>
        <div className='flex items-center gap-4 bg-white rounded-xl shadow-sm p-3'>
          <label className='text-gray-700 font-medium whitespace-nowrap'>Filter by Date:</label>
          <input
            type='date'
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className='border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2'
          />
        </div>
      </div>

      {/* Main Report Grid */}
      <div ref={contentRef} className='bg-white shadow-lg rounded-2xl p-8 print:shadow-none print:pt-12 print:pl-12'>
        {/* Summary Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Customer Profit Card */}
          {/* <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow duration-300'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                  />
                </svg>
              </div>
              <span className='text-green-600 text-sm font-semibold bg-green-100 px-2 py-1 rounded-full'>Customer</span>
            </div>
            <p className='text-gray-600 text-sm font-medium mb-1'>Customer Profit</p>
            <h3 className='text-3xl font-bold text-gray-900'>৳{totalCustomerProfit.toLocaleString()}</h3>
          </div> */}

          {/* Lot Profit Card */}
          {/* <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-300'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
              </div>
              <span className='text-blue-600 text-sm font-semibold bg-blue-100 px-2 py-1 rounded-full'>Lot</span>
            </div>
            <p className='text-gray-600 text-sm font-medium mb-1'>Lot Profit</p>
            <h3 className='text-3xl font-bold text-gray-900'>৳{totalLotProfit.toLocaleString()}</h3>
          </div> */}

          {/* Combined Profit Card */}
          {/* <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow duration-300'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-2 bg-purple-100 rounded-lg'>
                <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <span className='text-purple-600 text-sm font-semibold bg-purple-100 px-2 py-1 rounded-full'>Total</span>
            </div>
            <p className='text-gray-600 text-sm font-medium mb-1'>Combined Profit</p>
            <h3 className='text-3xl font-bold text-gray-900'>৳{totalCombinedProfit.toLocaleString()}</h3>
          </div> */}

          {/* Loss Card */}
          {/* <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow duration-300'>
            <div className='flex items-center justify-between mb-3'>
              <div className='p-2 bg-red-100 rounded-lg'>
                <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <span className='text-red-600 text-sm font-semibold bg-red-100 px-2 py-1 rounded-full'>Loss</span>
            </div>
            <p className='text-gray-600 text-sm font-medium mb-1'>Total Loss</p>
            <h3 className='text-3xl font-bold text-gray-900'>৳{totalLoss.toLocaleString()}</h3>
          </div> */}
        </div>

        {/* Profit/Loss Summary Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Net Profit Summary */}
          <div className='bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-green-200'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-3 bg-green-500 rounded-xl flex items-center justify-center'>
                <FaCheckCircle className='w-6 h-6 text-white' />
              </div>
              <div>
                <h3 className='text-xl font-bold text-gray-900'>Net Profit Summary</h3>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 border-b border-green-100'>
                <span className='text-gray-600'>Customer Profit</span>
                <span className='font-semibold text-gray-900'>৳{totalCustomerProfit.toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b border-green-100'>
                <span className='text-gray-600'>Lot Profit</span>
                <span className='font-semibold text-gray-900'>৳{totalLotProfit.toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center py-2'>
                <span className='text-gray-600 font-bold'>Total Combined Profit</span>
                <span className='text-2xl font-bold text-green-600'>৳{totalCombinedProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Loss Analysis */}
          <div className='bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-red-200'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-3 bg-red-500 rounded-xl flex items-center justify-center'>
                <FaExclamationTriangle className='w-5 h-5 text-white' />
              </div>
              <div>
                <h3 className='text-xl font-bold text-gray-900'>Loss Analysis</h3>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2'>
                <span className='text-gray-600 font-bold'>Total Loss</span>
                <span className='text-2xl font-bold text-red-600'>৳{totalLoss.toLocaleString()}</span>
              </div>
              {totalLoss > 0 && (
                <div className='mt-4 p-3 bg-red-50 rounded-lg border border-red-200'>
                  <p className='text-red-700 text-sm'>
                    <span className='font-semibold'>Note:</span> Review operational costs and sales strategies to
                    minimize losses.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
