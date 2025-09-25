'use client'

import { useRef, useState, useMemo, useEffect } from 'react'

import { useReactToPrint } from 'react-to-print'

import {
  purchaseCollections,
  salesCollections,
  purchaseReturns,
  salesReturns,
  expenses,
  stocks
} from '@/fake-db/apps/reportsData'

export default function ReportPage() {
  const [filterDate, setFilterDate] = useState('')
  const contentRef = useRef(null)

  // Set today's date initially
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    setFilterDate(today)
  }, [])

  // Print handler
  const handlePrint = useReactToPrint({ contentRef })

  const reportData = useMemo(() => {
    const filterByDate = (arr, key = 'summary.date') => {
      if (!filterDate) return arr

      return arr.filter(obj => {
        const date = key.includes('.') ? key.split('.').reduce((o, k) => o[k], obj) : obj[key]

        return date === filterDate
      })
    }

    // Filtered transactions by selected date
    const filteredPurchases = filterByDate(purchaseCollections)
    const filteredSales = filterByDate(salesCollections)
    const filteredPurchaseReturns = filterByDate(purchaseReturns, 'returnDate')
    const filteredSalesReturns = filterByDate(salesReturns, 'returnDate')
    const filteredExpenses = filterByDate(expenses, 'expenseDate')

    const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.summary.sub_total, 0)
    const totalSales = filteredSales.reduce((sum, s) => sum + s.summary.sub_total, 0)
    const totalPurchaseReturns = filteredPurchaseReturns.reduce((sum, r) => sum + r.returnAmount, 0)
    const totalSalesReturns = filteredSalesReturns.reduce((sum, r) => sum + r.returnAmount, 0)
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

    // 🔹 Calculate Opening & Closing Stock
    let openingStockPurchase = 0
    let openingStockSale = 0
    let closingStockPurchase = 0
    let closingStockSale = 0

    stocks.forEach(stock => {
      const { productId, openingQty, unitCost, unitPrice } = stock

      // Purchases of this product
      const purchasesForProduct = filteredPurchases.reduce((qty, purchase) => {
        purchase.suppliers.forEach(supplier => {
          supplier.items.forEach(item => {
            if (item.product_id === productId) qty += item.qty || 0
          })
        })

        return qty
      }, 0)

      // Sales of this product
      const salesForProduct = filteredSales.reduce((qty, sale) => {
        sale.customers.forEach(customer => {
          customer.items.forEach(item => {
            if (item.product_id === productId) qty += item.qty || 0
          })
        })

        return qty
      }, 0)

      // Purchase Returns of this product
      const purchaseReturnsForProduct = filteredPurchaseReturns.reduce((qty, ret) => {
        if (ret.productId === productId) qty += ret.quantityReturned || 0

        return qty
      }, 0)

      // Sales Returns of this product
      const salesReturnsForProduct = filteredSalesReturns.reduce((qty, ret) => {
        if (ret.productId === productId) qty += ret.quantityReturned || 0

        return qty
      }, 0)

      // Closing Stock (dynamic)
      const closingQty =
        (openingQty || 0) + purchasesForProduct - salesForProduct - purchaseReturnsForProduct + salesReturnsForProduct

      // Add to totals
      openingStockPurchase += (openingQty || 0) * unitCost
      openingStockSale += (openingQty || 0) * unitPrice

      closingStockPurchase += closingQty * unitCost
      closingStockSale += closingQty * unitPrice
    })

    const netProfit =
      totalSales +
      closingStockSale -
      (openingStockPurchase + totalPurchases + totalExpenses + totalPurchaseReturns - totalSalesReturns)

    const profit = netProfit > 0 ? netProfit : 0
    const loss = netProfit < 0 ? Math.abs(netProfit) : 0

    return {
      totalPurchases,
      totalSales,
      totalPurchaseReturns,
      totalSalesReturns,
      totalExpenses,
      openingStockPurchase,
      openingStockSale,
      closingStockPurchase,
      closingStockSale,
      netProfit,
      profit,
      loss
    }
  }, [filterDate])

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Print Page Margins */}
      <style>
        {`
          @page {
            margin: 20mm 15mm;
          }
        `}
      </style>

      {/* Filters */}
      <div className='flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4'>
        <input
          type='date'
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className='border rounded px-3 py-2 bg-white'
        />
        <button onClick={handlePrint} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
          Print Report
        </button>
      </div>

      {/* Report */}
      <div ref={contentRef} className='bg-white shadow rounded-lg p-6 print:pt-12 print:pl-12'>
        <h2 className='text-3xl font-semibold mb-4 text-gray-900'>Profit & Loss Report</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Opening Stock */}
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Opening Stock (Purchase Price)</p>
            <h3 className='text-xl font-semibold'>৳{reportData.openingStockPurchase.toFixed(2)}</h3>
          </div>
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Opening Stock (Sale Price)</p>
            <h3 className='text-xl font-semibold'>৳{reportData.openingStockSale.toFixed(2)}</h3>
          </div>

          {/* Purchases / Sales */}
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Total Purchases</p>
            <h3 className='text-xl font-semibold'>৳{reportData.totalPurchases.toFixed(2)}</h3>
          </div>
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Total Sales</p>
            <h3 className='text-xl font-semibold'>৳{reportData.totalSales.toFixed(2)}</h3>
          </div>

          {/* Returns */}
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Purchase Returns</p>
            <h3 className='text-xl font-semibold'>৳{reportData.totalPurchaseReturns.toFixed(2)}</h3>
          </div>
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Sales Returns</p>
            <h3 className='text-xl font-semibold'>৳{reportData.totalSalesReturns.toFixed(2)}</h3>
          </div>

          {/* Expenses */}
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Total Expenses</p>
            <h3 className='text-xl font-semibold'>৳{reportData.totalExpenses.toFixed(2)}</h3>
          </div>

          {/* Closing Stock */}
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Closing Stock (Purchase Price)</p>
            <h3 className='text-xl font-semibold'>৳{reportData.closingStockPurchase.toFixed(2)}</h3>
          </div>
          <div className='p-4 bg-gray-100 rounded-lg'>
            <p className='text-gray-600'>Closing Stock (Sale Price)</p>
            <h3 className='text-xl font-semibold'>৳{reportData.closingStockSale.toFixed(2)}</h3>
          </div>

          {/* Profit & Loss */}
          <div className='grid grid-cols-2 gap-6 col-span-1 md:col-span-2'>
            <div className='p-4 bg-gray-100 rounded-lg'>
              <p className='text-gray-600'>Profit</p>
              <h3 className='text-2xl font-bold text-green-600'>৳{reportData.profit.toFixed(2)}</h3>
            </div>

            <div className='p-4 bg-gray-100 rounded-lg'>
              <p className='text-gray-600'>Loss</p>
              <h3 className='text-2xl font-bold text-red-600'>৳{reportData.loss.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
