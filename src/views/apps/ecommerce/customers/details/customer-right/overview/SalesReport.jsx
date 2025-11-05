'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, Divider, Box } from '@mui/material'
import { ShoppingCart, CreditCard, RotateCcw } from 'lucide-react'

import dayjs from 'dayjs'

import CustomTextField from '@core/components/mui/TextField'
import SalesTable from './tables/SalesTable'
import { customerPayments, customerReturns } from '@/fake-db/apps/customerReportData'
import CustomerReturnTable from './tables/CustomerReturnTable'
import CustomerPaymentTable from './tables/PaymentTable'
import { getSalesByCustomer } from '@/actions/customerActions'
import BalanceHistoryTable from './tables/BalanceHistoryTable'
import { getBalanceHistory } from '@/actions/balanceActions'

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
const SalesReport = ({ customerId, initialSalesData, initialBalanceData }) => {
  const [activeTab, setActiveTab] = useState('sales')
  const [searchValue, setSearchValue] = useState('')
  const [fromDate, setFromDate] = useState(dayjs().subtract(1, 'month').format('YYYY-MM-DD'))
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'))

  // State for sales data
  const [salesData, setSalesData] = useState(initialSalesData)
  const [balanceData, setBalanceData] = useState(initialBalanceData)
  const [loading, setLoading] = useState(false)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  })

  const tabs = [
    { key: 'sales', label: 'Sales', icon: <ShoppingCart size={16} /> },
    { key: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { key: 'balanceHistory', label: 'Balance History', icon: <CreditCard size={16} /> },
    { key: 'returns', label: 'Returns', icon: <RotateCcw size={16} /> }
  ]

  // Function to fetch sales data
  const fetchSales = async (
    page = pagination.page,
    limit = pagination.limit,
    search = searchValue,
    from = fromDate,
    to = toDate
  ) => {
    if (!customerId) return

    setLoading(true)

    try {
      const result = await getSalesByCustomer(customerId, page, limit, search, from, to)

      // console.log(' in sales report', result)

      if (result.success) {
        setSalesData(result)
        setPagination(prev => ({ ...prev, page, limit }))
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBalanceHistory = async (
    page = pagination.page,
    limit = pagination.limit,
    from = fromDate,
    to = toDate
  ) => {
    if (!customerId) return

    setLoading(true)

    try {
      const result = await getBalanceHistory(customerId, page, limit, from, to)

      if (result.success) {
        setBalanceData(result)
        setPagination(prev => ({ ...prev, page, limit }))
      }
    } catch (error) {
      console.error('Error fetching balance history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when filters change
  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSales(1, pagination.limit, searchValue, fromDate, toDate)
    } else if (activeTab === 'balanceHistory') {
      fetchBalanceHistory(1, pagination.limit, '', '')
    }
  }, [searchValue, fromDate, toDate, activeTab])

  // Handle pagination change
  const handlePaginationChange = (page, limit) => {
    if (activeTab === 'sales') {
      fetchSales(page, limit, searchValue, fromDate, toDate)
    } else if (activeTab === 'balanceHistory') {
      fetchBalanceHistory(page, limit, searchValue, fromDate, toDate)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <SalesTable
            data={salesData?.data?.data?.sales || []}
            pagination={pagination}
            total={salesData?.data?.data?.total || 0}
            onPaginationChange={handlePaginationChange}
            loading={loading}
          />
        )
      case 'payments':
        return <CustomerPaymentTable data={customerPayments} />

      case 'balanceHistory':
        return (
          <BalanceHistoryTable
            data={balanceData?.data?.balances}
            pagination={pagination}
            total={balanceData?.data?.total}
            onPaginationChange={handlePaginationChange}
            loading={loading}
          />
        )

      case 'returns':
        return <CustomerReturnTable data={customerReturns} />
      default:
        return <div className='p-6 text-center text-gray-500'>No data available for this section.</div>
    }
  }

  return (
    <Card className='w-full'>
      {/* 🔹 Custom Tabs */}
      <div className='flex flex-wrap border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white rounded-t-lg'>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`group relative flex items-center gap-2 px-5 py-3 text-lg font-semibold cursor-pointer transition-all duration-200 rounded-t-md border-r-2
        ${
          activeTab === tab.key
            ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border-b-2 border-blue-500'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
        }`}
          >
            {/* Icon */}
            <span
              className={`transition-colors duration-200 ${
                activeTab === tab.key ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
              }`}
            >
              {tab.icon}
            </span>

            {/* Label */}
            <span className='whitespace-nowrap'>{tab.label}</span>

            {/* Active Tab Indicator (small animated underline) */}
            {activeTab === tab.key && (
              <span className='absolute bottom-0 left-0 h-[2px] w-full bg-blue-500 rounded-t-md transition-all duration-300' />
            )}
          </button>
        ))}
      </div>

      {/* 🔹 Filter Section */}
      <CardContent className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <CustomTextField type='date' label='From Date' value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <CustomTextField type='date' label='To Date' value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>

        <CustomTextField
          placeholder='Search...'
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className='w-full md:w-60'
        />
      </CardContent>

      <Divider />

      {/* 🔹 Dynamic Table Section */}
      <Box className='overflow-x-auto p-4'>{renderTabContent()}</Box>
    </Card>
  )
}

export default SalesReport
