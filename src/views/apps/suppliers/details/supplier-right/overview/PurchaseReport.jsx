'use client'

import { useState } from 'react'

import { Card, CardContent, Typography, Divider, Box, Button } from '@mui/material'
import { Calendar, FileText, Layers, ShoppingCart, CreditCard, RotateCcw, ClipboardList } from 'lucide-react'

import dayjs from 'dayjs'

import CustomTextField from '@core/components/mui/TextField'
import PurchaseTable from './tables/PurchaseTable'
import PaymentTable from './tables/PaymentTable'
import ProductTable from './tables/ProductTable'

// Mock data imports
import { supplierPurchases } from '@/fake-db/apps/supplierPurchaseHistory'
import { paymentHistoryData } from '@/fake-db/apps/paymentHistory'
import { lotInformation } from '@/fake-db/apps/lotInformation'
import ReturnTable from './tables/ReturnTable'
import { returnProductsHistory } from '@/fake-db/apps/returnHistory'

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
const PurchaseReport = () => {
  const [activeTab, setActiveTab] = useState('purchases')
  const [searchValue, setSearchValue] = useState('')
  const [fromDate, setFromDate] = useState(dayjs().subtract(1, 'month').format('YYYY-MM-DD'))
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'))

  const tabs = [
    { key: 'purchases', label: 'Purchases', icon: <ShoppingCart size={16} /> },
    { key: 'stock', label: 'Stock Report', icon: <ClipboardList size={16} /> },
    { key: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { key: 'returns', label: 'Returns', icon: <RotateCcw size={16} /> }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'purchases':
        return <PurchaseTable data={supplierPurchases} />
      case 'payments':
        return <PaymentTable data={paymentHistoryData} />
      case 'stock':
        return <ProductTable data={lotInformation} />
      case 'returns':
        return <ReturnTable data={returnProductsHistory} />
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

export default PurchaseReport
