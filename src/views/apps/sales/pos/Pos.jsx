'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { useForm } from 'react-hook-form'

import { FaTimes, FaPlus, FaMinus, FaEdit } from 'react-icons/fa'

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

import PosHeader from './PosHeader'
import SearchProduct from './SearchProduct'

import { handleSalesDistributionExpense } from '@/utils/handleSalesDistribution'
import CategoryModal from '@/components/layout/shared/CategoryModal'
import BrandModal from '@/components/layout/shared/BrandModal'
import { categories, brands } from '@/data/productsCategory/productsCategory'
import { customers } from '@/data/customerData/customerData'
import { filteredProductsData } from '@/utils/filteredProductsData'
import { handleBoxCount } from '@/utils/handleBoxCount'
import { calculateTotalDue } from '@/utils/calculateTotalDue'
import { usePaymentCalculation } from '@/utils/usePaymentCalculation'
import { showAlert } from '@/utils/showAlert'
import ShowProductList from '@/components/layout/shared/ShowProductList'

export default function POSSystem({ productsData = [] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [brandModalOpen, setBrandModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [paymentType, setPaymentType] = useState('Cash')

  // const [vatType, setVatType] = useState('Select')
  const [discountType, setDiscountType] = useState('Flat (₹)')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCustomer, setSelectedCustomer] = useState({})
  const [cartProducts, setCartProducts] = useState([])
  const { register, handleSubmit } = useForm()
  const [selectedCategory, setSelectedCategory] = useState([])
  const [selectedBrand, setSelectedBrand] = useState([])

  const [commissionModal, setCommissionModal] = useState({
    open: false,
    productId: null,
    supplierId: null,
    value: 0
  })

  const filteredProducts = filteredProductsData(productsData, searchTerm, selectedCategory)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const filteredBrands = brands.filter(brand => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

  // Function to remove item from cart
  const handleRemoveCartItem = (productId, customerId) => {
    setCartProducts(prevCart =>
      prevCart.filter(item => !(item.product_id === productId && item.customer_id === customerId))
    )
  }

  // Function to remove category
  const handleRemoveCategory = categoryToRemove => {
    setSelectedCategory(prev => prev.filter(category => category !== categoryToRemove))
  }

  const handleCartProductClick = product => {
    if (!selectedCustomer?.sl) {
      showAlert('Please select a customer first.', 'warning')

      return
    }

    const isAlreadyAdded = cartProducts.some(
      item => item.product_id === product.id && item.customer_id === selectedCustomer.sl
    )

    if (isAlreadyAdded) {
      showAlert('This product is already added to the cart.', 'warning')

      return
    }

    setCartProducts(prevCart => {
      // Add product with additional properties
      const newCartItem = {
        ...product,
        product_id: product.id,
        product_name: product.name,
        customer_id: selectedCustomer.sl,
        customer_name: selectedCustomer.name,
        crate: 1,
        crateType: 'type1',
        cratePrice: 0,
        transportation: 0,
        moshjid: 0,
        van_vara: 0,
        total: 0,
        cost: product.price,
        commission: 0,
        commission_rate: product.commission_rate || 0,
        trading_post: 0,
        labour: 0,
        expenses: 0,
        received_date: date,
        expiry_date: ''
      }

      return [...prevCart, newCartItem]
    })
  }

  // Function to handle distribute form submission
  const handleDistributeSubmit = data => {
    handleSalesDistributionExpense(data, cartProducts, setCartProducts, customers)
  }

  // calculate total due amount
  const totalDueAmount = calculateTotalDue(cartProducts)

  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    watch: watchPayment,
    setValue: setPaymentValue,
    formState: { errors: paymentErrors }
  } = useForm({
    defaultValues: {
      receiveAmount: 0,
      changeAmount: 0,
      dueAmount: totalDueAmount,
      paymentType: 'cash',
      note: '',
      vatType: 'Select',
      discountType: 'Flat (৳)'
    }
  })

  const receiveAmount = watchPayment('receiveAmount')
  const vatType = watchPayment('vatType')

  const parsePercent = v => {
    if (!v || v === 'Select') return 0
    const n = Number(String(v).replace('%', ''))

    return Number.isFinite(n) ? n / 100 : 0
  }

  const vatRate = parsePercent(vatType)
  const vatAmount = +(totalDueAmount * vatRate).toFixed(2)
  const payableAmount = +(totalDueAmount + vatAmount).toFixed(2)

  // Open the commission editor for a row
  const openCommissionEditor = item => {
    setCommissionModal({
      open: true,
      productId: item.product_id,
      customerId: item.customer_id,
      value: Number(item.commission_rate) || 0
    })
  }

  // Save only the commission value
  const updateCommissionForProduct = () => {
    const { productId, customerId, value } = commissionModal

    setCartProducts(prev =>
      prev.map(item =>
        item.product_id === productId && item.customer_id === customerId
          ? { ...item, commission_rate: Number(value) || 0 }
          : item
      )
    )

    setCommissionModal({ open: false, productId: null, customerId: null, value: 0 })
  }

  // Auto calculate due and change amounts
  usePaymentCalculation(receiveAmount, totalDueAmount, setPaymentValue)

  const columns = useMemo(
    () => [
      {
        accessorKey: 'customer_id',
        header: 'SL'
      },
      {
        accessorKey: 'customer_name',
        header: 'Customer'
      },
      {
        accessorKey: 'product_name',
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original

          return (
            <Link href={`/apps/products/edit/p001`} className='hover:text-blue-600 hover:underline'>
              {product.product_name}
            </Link>
          )
        }
      },
      {
        accessorKey: 'crate',
        header: 'Crate',
        cell: ({ row }) => {
          const product = row.original

          return (
            <div className='flex justify-between gap-2 items-center'>
              <button
                onClick={() => handleBoxCount(setCartProducts, product.product_id, product.customer_id, false)}
                className='text-red-500 bg-transparent border-none outline-none h-full w-full flex items-center justify-center'
              >
                <FaMinus />
              </button>

              <span>{product.crate}</span>
              <button
                onClick={() => handleBoxCount(setCartProducts, product.product_id, product.customer_id, true)}
                className='text-green-500 bg-transparent border-none outline-none w-full h-full flex items-center justify-center'
              >
                <FaPlus />
              </button>
            </div>
          )
        }
      },
      {
        accessorKey: 'crateType',
        header: 'Crate Type',
        cell: ({ row }) => {
          const product = row.original

          return (
            <select
              value={product.crateType}
              onChange={e => {
                const value = e.target.value

                console.log('value', value)

                // update cartProducts state
                setCartProducts(prev =>
                  prev.map(item =>
                    item.product_id === product.product_id && item.customer_id === product.customer_id
                      ? { ...item, crateType: value }
                      : item
                  )
                )
              }}
              className='px-2 py-1 border border-gray-300 rounded text-sm outline-none'
            >
              <option value='type1'>One</option>
              <option value='type2'>Two</option>
            </select>
          )
        }
      },
      {
        accessorKey: 'cost',
        header: 'Cost(unit)'
      },
      {
        accessorKey: 'transportation',
        header: 'Transportation'
      },
      {
        accessorKey: 'moshjid',
        header: 'Moshjid'
      },
      {
        accessorKey: 'van_vara',
        header: 'Van Vara'
      },
      {
        accessorKey: 'expenses',
        header: 'Expenses'
      },

      {
        accessorKey: 'commission_rate',
        header: 'Commission',
        cell: ({ row }) => {
          const product = row.original
          const pct = Number(product?.commission_rate) || 0

          console.log('product', product)

          return (
            <div className='flex items-center gap-2'>
              <span>{pct > 0 ? `${pct}%` : 'N/A'}</span>
              {pct > 0 && (
                <button
                  type='button'
                  onClick={() => openCommissionEditor(product)}
                  className='text-blue-600 hover:text-blue-800'
                  title='Edit commission'
                >
                  <FaEdit />
                </button>
              )}
            </div>
          )
        }
      },

      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => {
          const product = row.original

          return (parseFloat(product.total) || 0).toFixed(2)
        }
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const product = row.original

          return (
            <button
              onClick={() => handleRemoveCartItem(product.product_id, product.customer_id)}
              className='text-red-500 bg-transparent border-none outline-none w-full h-full'
            >
              <FaTimes />
            </button>
          )
        }
      }
    ],
    []
  )

  const tableData = useMemo(() => cartProducts, [cartProducts])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  // submit payment
  const onSubmitPayment = data => {
    const payment = {
      receiveAmount: Number(data.receiveAmount) || 0,
      changeAmount: Number(data.changeAmount) || 0,
      dueAmount: Number(data.dueAmount) || 0,
      paymentType: data.paymentType,
      note: data.note || '',
      vatType: data.vatType || ''
    }

    // Group by customer with only IDs + totals
    const customersMap = cartProducts.reduce((acc, item) => {
      const key = item.customer_id ?? 'unknown'

      if (!acc[key]) {
        acc[key] = {
          customer_id: item.customer_id,
          items: [],
          sub_total: 0,
          commission_total: 0,
          profit_total: 0
        }
      }

      acc[key].items.push({
        product_id: item.product_id,
        crate: Number(item.crate) || 0,
        product_name: item.product_name
      })

      const itemTotal = Number(item.total) || 0
      const itemCost = (Number(item.cost) || 0) * (Number(item.crate) || 1)

      acc[key].sub_total += Number(item.total) || 0
      acc[key].commission_total += Number(item.commission) || 0
      acc[key].profit_total += itemTotal - itemCost

      return acc
    }, {})

    const customers = Object.values(customersMap)

    // Grand totals
    const grandSubTotal = customers.reduce((s, sup) => s + sup.sub_total, 0)
    const grandCommission = customers.reduce((s, sup) => s + sup.commission_total, 0)
    const grandProfit = customers.reduce((s, sup) => s + sup.profit_total, 0)

    const payload = {
      summary: {
        date,
        sub_total: grandSubTotal,
        commission_total: grandCommission,
        profit_total: grandProfit
      },
      payment,
      customers
    }

    console.log('Customer sell payload (multi-customer):', payload)
  }

  return (
    <div className='min-h-[calc(100vh-54px] bg-gray-50 p-1'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex flex-col lg:flex-row items-center justify-between'>
          <PosHeader />

          <SearchProduct
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryModalOpen={categoryModalOpen}
            setCategoryModalOpen={setCategoryModalOpen}
            brandModalOpen={brandModalOpen}
            setBrandModalOpen={setBrandModalOpen}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            brandSearch={brandSearch}
            setBrandSearch={setBrandSearch}
          />
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
        {/* Left Side - Form */}
        <div className='w-full lg:w-4/5 bg-white rounded-lg lg:p-6 flex flex-col'>
          {/* Order Details */}
          <div className='grid w-full grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4 mb-6'>
            <input
              type='text'
              value='S-00428'
              readOnly
              className='px-3 py-2 border bg-gray-100 border-gray-300 rounded focus:outline-none'
            />
            <input
              type='date'
              defaultValue={date}
              className='px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              onChange={e => setDate(e.target.value)}
            />
            <div className='flex'>
              <select
                value={selectedCustomer.sl || ''}
                onChange={e => {
                  const customer = customers.find(s => s.sl === parseInt(e.target.value))

                  setSelectedCustomer(customer || {})
                }}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none'
              >
                <option value=''>Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.sl} value={customer.sl}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className='mb-6 overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className='bg-gray-50'>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className='border border-gray-200 px-3 py-2'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-auto'>
            {/* Expense Distribution */}
            {cartProducts.length > 0 && (
              <form className='space-y-4 mb-6' onSubmit={handleSubmit(handleDistributeSubmit)}>
                <h1 className='text-2xl font-medium'>Expense Distribution</h1>

                {/* Transportation */}

                <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                  <label className='w-32 text-sm'>Transportation</label>
                  <div className='flex gap-1 lg:gap-5 w-full'>
                    <input
                      type='number'
                      defaultValue='0'
                      {...register('transportationAmount')}
                      className='lg:flex-1 px-3 py-2 border border-gray-300 rounded w-1/2'
                    />
                    <div className='w-1/2 lg:w-1/4'>
                      <select
                        {...register('transportationType')}
                        className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                      >
                        <option value='divided'>Divided</option>
                        <option value='each'>Each</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Moshjid */}
                <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                  <label className='w-32 text-sm'>Moshjid</label>
                  <div className='flex gap-1 lg:gap-5 w-full'>
                    <input
                      type='number'
                      defaultValue='0'
                      {...register('moshjidAmount')}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded w-1/2'
                    />

                    <div className='w-1/2 lg:w-1/4'>
                      <select
                        {...register('moshjidType')}
                        className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                      >
                        <option value='divided'>Divided</option>
                        <option value='each'>Each</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Van Vara */}
                <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                  <label className='w-32 text-sm'>Van Vara</label>
                  <div className='flex gap-1 lg:gap-5 w-full'>
                    <input
                      type='number'
                      defaultValue='0'
                      {...register('vanVaraAmount')}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded w-1/2'
                    />

                    <div className='w-1/2 lg:w-1/4'>
                      <select
                        {...register('vanVaraType')}
                        className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                      >
                        <option value='divided'>Divided</option>
                        <option value='each'>Each</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Trading Post */}
                <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                  <label className='w-32 text-sm'>Trading Post</label>
                  <div className='flex gap-1 lg:gap-5 w-full'>
                    <input
                      type='number'
                      defaultValue='0'
                      {...register('tradingPostAmount')}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded w-1/2'
                    />

                    <div className='w-1/2 lg:w-1/4'>
                      <select
                        {...register('tradingPostType')}
                        className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                      >
                        <option value='divided'>Divided</option>
                        <option value='each'>Each</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Labour */}
                <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                  <label className='w-32 text-sm'>Labour</label>
                  <div className='flex gap-1 lg:gap-5 w-full'>
                    <input
                      type='number'
                      defaultValue='0'
                      {...register('labourAmount')}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded w-1/2'
                    />

                    <div className='w-1/2 lg:w-1/4'>
                      <select
                        {...register('labourType')}
                        className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                      >
                        <option value='divided'>Divided</option>
                        <option value='each'>Each</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type='submit'
                  className='w-52 py-3 bg-[#7367f0] text-white rounded-lg hover:bg-[#4e43c5] font-medium'
                >
                  Distribute Expenses
                </button>
              </form>
            )}

            {/* Payment Details */}
            <form onSubmit={handleSubmitPayment(onSubmitPayment)} className='mt-auto'>
              <h1 className='mb-4'>Payment Details</h1>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Left Side */}
                <div className='space-y-4'>
                  <div className='flex items-center'>
                    <label className='w-32 text-sm'>Receive Amount</label>
                    <input
                      type='number'
                      {...registerPayment('receiveAmount')}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded'
                    />
                  </div>
                  <div className='flex items-center'>
                    <label className='w-32 text-sm'>Change Amount</label>
                    <input
                      type='number'
                      {...registerPayment('changeAmount')}
                      disabled
                      className='flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100'
                    />
                  </div>
                  <div className='flex items-center'>
                    <label className='w-32 text-sm'>Due Amount</label>
                    <input
                      type='number'
                      {...registerPayment('dueAmount')}
                      disabled
                      className='flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-100'
                    />
                  </div>
                  <div className='flex items-center'>
                    <label className='w-32 text-sm'>Payment Type</label>
                    <select
                      {...registerPayment('paymentType')}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded'
                    >
                      <option value='cash'>Cash</option>
                      <option value='card'>Card</option>
                      <option value='bkash'>Bkash</option>
                    </select>
                  </div>
                  <div className='flex items-start'>
                    <label className='w-32 text-sm pt-2'>Note</label>
                    <textarea
                      {...registerPayment('note')}
                      placeholder='Type note...'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded h-20 resize-none'
                    />
                  </div>
                </div>

                {/* Right Side */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Sub Total</span>
                    <span className='font-medium'>৳ {totalDueAmount}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Vat</span>
                    <div className='flex items-center space-x-2'>
                      <select
                        {...registerPayment('vatType')}
                        className='px-2 py-1 border border-gray-300 rounded text-sm'
                      >
                        <option value='Select'>Select</option>
                        <option value='5%'>5%</option>
                        <option value='10%'>10%</option>
                      </select>
                      <span className='text-sm'>{vatAmount}</span>
                    </div>
                  </div>
                  {/* <div className='flex items-center justify-between'>
                  <span className='text-sm'>Discount</span>
                  <div className='flex items-center space-x-2'>
                    <select
                      {...registerPayment('discountType')}
                      className='px-2 py-1 border border-gray-300 rounded text-sm'
                    >
                      <option value='Flat (৳)'>Flat (৳)</option>
                      <option value='Percentage (%)'>Percentage (%)</option>
                    </select>
                    <span className='text-sm'>0</span>
                  </div>
                </div> */}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Shipping Charge</span>
                    <span className='text-sm'>0</span>
                  </div>
                  <div className='flex items-center justify-between font-medium'>
                    <span className='text-sm'>Total Amount</span>
                    <span>৳ {totalDueAmount}</span>
                  </div>
                  {/* <div className='flex items-center justify-between'>
                  <span className='text-sm'>Rounding(+/-)</span>
                  <span className='text-sm'>৳ 0</span>
                </div> */}
                  <div className='flex items-center justify-between font-bold text-lg'>
                    <span>Payable Amount</span>
                    <span>৳ {payableAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-4 mt-8'>
                <button className='flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium'>
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 py-3 bg-[#7367f0] text-white rounded-lg hover:bg-[#4e43c5] font-medium'
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Products */}
        <ShowProductList
          selectedCategory={selectedCategory}
          handleRemoveCategory={handleRemoveCategory}
          filteredProducts={filteredProducts}
          handleCartProductClick={handleCartProductClick}
        />
      </div>

      {/* Category Modal */}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        filteredCategories={filteredCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Brand Modal */}
      {/* <BrandModal
        open={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        searchValue={brandSearch}
        onSearchChange={e => setBrandSearch(e.target.value)}
        items={filteredBrands}
        setSelectedBrand={setSelectedBrand}
      /> */}

      {/* Commission Edit Modal */}
      {commissionModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
          <div className='bg-white rounded-lg shadow-lg p-4 w-full max-w-xs'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-base font-medium'>Edit Commission (%)</h3>
              <button
                type='button'
                onClick={() => setCommissionModal({ open: false, productId: null, customerId: null, value: 0 })}
                className='text-gray-500 hover:text-gray-700'
              >
                <FaTimes />
              </button>
            </div>

            <input
              type='number'
              min='0'
              step='0.01'
              value={commissionModal.value}
              onChange={e => setCommissionModal(m => ({ ...m, value: e.target.value }))}
              className='w-full px-3 py-2 border border-gray-300 rounded mb-3'
              placeholder='e.g., 2.5'
            />

            <div className='flex gap-2'>
              <button
                type='button'
                onClick={updateCommissionForProduct}
                className='flex-1 py-2 bg-[#7367f0] text-white rounded hover:bg-[#4e43c5]'
              >
                Save
              </button>
              <button
                type='button'
                onClick={() => setCommissionModal({ open: false, productId: null, supplierId: null, value: 0 })}
                className='flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
