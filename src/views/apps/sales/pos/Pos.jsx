'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { useForm } from 'react-hook-form'

import { FaTimes, FaEdit } from 'react-icons/fa'

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

import { toast } from 'react-toastify'

import PosHeader from './PosHeader'
import SearchProduct from './SearchProduct'

import CategoryModal from '@/components/layout/shared/CategoryModal'
import { categories, brands } from '@/data/productsCategory/productsCategory'
import { customers } from '@/data/customerData/customerData'
import { filteredProductsData } from '@/utils/filteredProductsData'
import { handleCrateCount } from '@/utils/handleCrateCount'
import { calculateTotalDue } from '@/utils/calculateTotalDue'
import { usePaymentCalculation } from '@/utils/usePaymentCalculation'
import ShowProductList from '@/components/layout/shared/ShowProductList'
import { handleSalesTotal } from '@/utils/handleSalesTotal'
import { lots } from '@/fake-db/apps/lotsData'
import { useGlobalTooltip } from '@/components/layout/shared/useGlobalTooltip'

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
  const showTooltip = useGlobalTooltip()

  const [commissionModal, setCommissionModal] = useState({
    open: false,
    productId: null,
    supplierId: null,
    value: 0
  })

  const [lotModal, setLotModal] = useState({
    open: false,
    productId: null,
    productName: '',
    selectedLots: []
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (cartProducts.length > 0 && selectedCustomer?.sl) {
        handleSalesTotal(setCartProducts, selectedCustomer)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [cartProducts, selectedCustomer])

  const filteredProducts = filteredProductsData(productsData, searchTerm, selectedCategory)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const filteredBrands = brands.filter(brand => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

  // Function to remove item from cart
  const handleRemoveCartItem = productId => {
    setCartProducts(prevCart => prevCart.filter(item => item.product_id !== productId))
  }

  // Function to remove category
  const handleRemoveCategory = categoryToRemove => {
    setSelectedCategory(prev => prev.filter(category => category !== categoryToRemove))
  }

  const handleCartProductClick = product => {
    if (!selectedCustomer?.sl) {
      toast.warning('Please select a customer first.', {
        position: 'top-center'
      })

      return
    }

    const isAlreadyAdded = cartProducts.some(
      item => item.product_id === product.id && item.customer_id === selectedCustomer.sl
    )

    if (isAlreadyAdded) {
      toast.warning('This product is already added to the cart.', {
        position: 'top-center'
      })

      return
    }

    setCartProducts(prevCart => {
      // Add product with additional properties
      const newCartItem = {
        ...product,
        product_id: product.id,
        product_name: product.name,

        // customer_id: selectedCustomer.sl,
        // customer_name: selectedCustomer.name,
        crate: {
          type_one: 0,
          type_two: 0
        },
        cratePrice: 0,
        kg: 0,
        discount_kg: 0,
        total: 0,
        profit: 0,
        cost_price: product.cost_price ?? 0,
        selling_price: product.selling_price ?? 0,
        commission: 0,
        commission_rate: product.commission_rate || 0,
        selling_date: date,
        expiry_date: '',
        lots_selected: [],
        total_from_lots: 0
      }

      return [...prevCart, newCartItem]
    })
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
    const { productId, value } = commissionModal

    setCartProducts(prev => {
      const updated = prev.map(item =>
        item.product_id === productId ? { ...item, commission_rate: Number(value) || 0 } : item
      )

      handleSalesTotal(() => updated, customers)

      return updated
    })

    setCommissionModal({ open: false, productId: null, value: 0 })
  }

  // Auto calculate due and change amounts
  usePaymentCalculation(receiveAmount, totalDueAmount, setPaymentValue)

  const columns = useMemo(
    () => [
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

      // UPDATED: LOT column with global (non-clipped) tooltip
      {
        accessorKey: 'lots_selected',
        header: 'Select Lot',
        cell: ({ row }) => {
          const product = row.original
          const totalLots = product.lots_selected?.length || 0

          // No lot
          if (totalLots === 0) {
            return (
              <button
                type='button'
                onClick={() =>
                  setLotModal({
                    open: true,
                    productId: product.product_id,
                    productName: product.product_name,
                    selectedLots: product.lots_selected || []
                  })
                }
                className='text-indigo-600 hover:text-indigo-800 font-medium underline'
              >
                Select Lot
              </button>
            )
          }

          // One lot
          if (totalLots === 1) {
            const lot = product.lots_selected[0]

            return (
              <span
                onClick={() =>
                  setLotModal({
                    open: true,
                    productId: product.product_id,
                    productName: product.product_name,
                    selectedLots: product.lots_selected
                  })
                }
                className='text-gray-800 font-semibold cursor-pointer hover:text-indigo-600 transition-colors'
              >
                {lot.lot_name}
              </span>
            )
          }

          // Multiple lots — static tooltip above item
          return (
            <span
              className='text-gray-800 font-semibold cursor-pointer hover:text-indigo-600 transition-colors relative'
              onClick={() =>
                setLotModal({
                  open: true,
                  productId: product.product_id,
                  productName: product.product_name,
                  selectedLots: product.lots_selected
                })
              }
              onMouseEnter={e => {
                const rect = e.currentTarget.getBoundingClientRect()

                const content = product.lots_selected
                  .map(
                    l => `
            <div class='flex justify-between gap-3 whitespace-nowrap'>
              <span>${l.lot_name}</span>
              <span class='text-gray-300 ml-3'>${l.use_qty || 0} kg</span>
            </div>`
                  )
                  .join('')

                //  Tooltip appears directly above the item
                showTooltip({ rect, content })
              }}
              onMouseLeave={() => showTooltip(null)}
            >
              {totalLots} lots selected
            </span>
          )
        }
      },

      {
        accessorKey: 'crate_type_one',
        header: 'Crate Type 1',
        cell: ({ row }) => {
          const product = row.original
          const value = product.crate?.type_one

          return (
            <input
              type='number'
              onWheel={e => e.currentTarget.blur()}
              value={value === 0 ? '' : (value ?? '')}
              onChange={e => {
                const rawValue = e.target.value
                const parsedValue = rawValue === '' ? 0 : parseInt(rawValue) || 0

                handleCrateCount(setCartProducts, product.product_id, product.customer_id, 'type_one', parsedValue)
              }}
              placeholder='0'
              className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      },

      {
        accessorKey: 'crate_type_two',
        header: 'Crate Type 2',
        cell: ({ row }) => {
          const product = row.original
          const value = product.crate?.type_two

          return (
            <input
              type='number'
              onWheel={e => e.currentTarget.blur()}
              value={value === 0 ? '' : (value ?? '')}
              onChange={e => {
                const rawValue = e.target.value
                const parsedValue = rawValue === '' ? 0 : parseInt(rawValue) || 0

                handleCrateCount(setCartProducts, product.product_id, product.customer_id, 'type_two', parsedValue)
              }}
              placeholder='0'
              className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      },
      ,
      {
        accessorKey: 'selling_price',
        header: 'Cost(unit)',
        cell: ({ row }) => {
          const product = row.original

          return (
            <input
              type='number'
              onWheel={e => e.currentTarget.blur()}
              value={product.selling_price === 0 ? '' : (product.selling_price ?? '')}
              onChange={e => {
                const rawValue = e.target.value

                setCartProducts(prev =>
                  prev.map(item =>
                    item.product_id === product.product_id
                      ? { ...item, selling_price: rawValue === '' ? 0 : parseFloat(rawValue) }
                      : item
                  )
                )
              }}
              placeholder='0'
              className='w-24 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      },

      {
        accessorKey: 'kg',
        header: 'KG',
        cell: ({ row }) => {
          const product = row.original

          return (
            <input
              type='number'
              onWheel={e => e.currentTarget.blur()}
              value={product.kg === 0 ? '' : (product.kg ?? '')}
              onChange={e => {
                const rawValue = e.target.value
                const parsedValue = rawValue === '' ? 0 : parseFloat(rawValue) || 0

                setCartProducts(prev =>
                  prev.map(item => (item.product_id === product.product_id ? { ...item, kg: parsedValue } : item))
                )
              }}
              placeholder='0'
              className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      },

      ,
      {
        accessorKey: 'commission_rate',
        header: 'Commission',
        cell: ({ row }) => {
          const product = row.original
          const pct = Number(product?.commission_rate) || 0

          // console.log('product', product)

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
        accessorKey: 'discount_kg',
        header: 'Discount (kg)',
        cell: ({ row }) => {
          const product = row.original

          return (
            <input
              type='number'
              onWheel={e => e.currentTarget.blur()}
              value={product.discount_kg === 0 ? '' : (product.discount_kg ?? '')}
              onChange={e => {
                const rawValue = e.target.value
                const newValue = rawValue === '' ? 0 : parseFloat(rawValue)

                setCartProducts(prev =>
                  prev.map(item =>
                    item.product_id === product.product_id && item.customer_id === product.customer_id
                      ? { ...item, discount_kg: newValue }
                      : item
                  )
                )
              }}
              placeholder='0'
              className='w-24 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      },

      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => {
          const product = row.original

          return (
            <input
              type='number'
              onWheel={e => e.currentTarget.blur()}
              value={product.total === 0 ? '' : (product.total ?? '')}
              onChange={e => {
                const rawValue = e.target.value
                const newValue = rawValue === '' ? 0 : parseFloat(rawValue)

                setCartProducts(prev =>
                  prev.map(item => (item.product_id === product.product_id ? { ...item, total: newValue } : item))
                )
              }}
              placeholder='0'
              className='w-24 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      },

      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const product = row.original

          return (
            <button
              onClick={() => handleRemoveCartItem(product.product_id)}
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

    const sub_total = cartProducts.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
    const commission_total = cartProducts.reduce((sum, item) => sum + (Number(item.commission) || 0), 0)

    const profit_total = cartProducts.reduce((sum, item) => {
      // If profit is negative, count as 0
      return sum + Math.max(0, item.profit)
    }, 0)

    const payload = {
      customer: selectedCustomer,
      summary: {
        date,
        sub_total,
        commission_total,
        profit_total
      },
      payment,
      items: cartProducts
    }

    console.log('Customer sell payload (multi-customer):', payload)
    toast.success('Product sold successfully!')
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

      <div className='flex flex-col  lg:flex-row gap-x-2 gap-y-5'>
        {/* Left Side - Form */}
        <div className='w-full lg:w-8/12 xl:w-8/12 bg-white rounded-lg lg:p-6 flex flex-col'>
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

          {/* Selected Customer Info */}
          {selectedCustomer?.sl && (
            <div className='mb-6'>
              <div className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                {/* Left Section - Profile */}
                <div className='flex items-center gap-4 w-full sm:w-auto'>
                  <img
                    src={selectedCustomer.image}
                    alt={selectedCustomer.name}
                    className='w-16 h-16 rounded-full border-2 border-white object-cover shadow-md'
                  />

                  <div>
                    <h2 className='text-lg font-semibold'>{selectedCustomer.name}</h2>
                    <p className='text-sm opacity-80'>{selectedCustomer.phone}</p>
                    <p className='text-xs opacity-60'>{selectedCustomer.email}</p>
                  </div>
                </div>

                {/* Right Section - Stats */}
                <div className='grid grid-cols-2 gap-4 w-full sm:w-auto text-center'>
                  <div className='bg-white/15 backdrop-blur-sm rounded-lg py-2 px-3'>
                    <p className='text-xs opacity-80'>Balance</p>
                    <p className='text-base font-bold'>৳ {selectedCustomer.balance.toFixed(2)}</p>
                  </div>

                  <div className='bg-white/15 backdrop-blur-sm rounded-lg py-2 px-3'>
                    <p className='text-xs opacity-80'>Due</p>
                    <p className='text-base font-bold text-yellow-300'>৳ {selectedCustomer.due.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className='mb-6 overflow-x-auto relative z-0'>
            <table className='w-full border-collapse'>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className='bg-gray-50'>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className='border border-gray-200 px-3 py-2 text-left text-sm font-medium whitespace-nowrap'
                      >
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
                      <td
                        key={cell.id}
                        className='border border-gray-200 px-3 py-2 whitespace-nowrap relative overflow-visible'
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-20'>
            {/* Expense Distribution */}
            {/* {cartProducts.length > 0 && (
              <form className='space-y-4 mb-6' onSubmit={handleSubmit(handleDistributeSubmit)}>
                <h1 className='text-2xl font-medium'>Expense Distribution</h1>

                 

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
            )} */}

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

              {/* Selling Summary Section */}

              <div className='mt-5'>
                <div className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10'>
                  <div className='flex flex-col sm:flex-row sm:gap-10 text-center sm:text-left w-full justify-between'>
                    <div>
                      <p className='text-base opacity-80'>Total Products</p>
                      <h2 className='text-2xl font-bold'>{cartProducts.length}</h2>
                    </div>
                    <div>
                      <p className='text-base opacity-80'>Total Customers</p>
                      <h2 className='text-2xl font-bold'>
                        {[...new Set(cartProducts.map(p => p.customer_id))].length}
                      </h2>
                    </div>
                    <div>
                      <p className='text-base opacity-80'>Total Amount</p>
                      <h2 className='text-2xl font-bold'>৳ {totalDueAmount}</h2>
                    </div>
                  </div>

                  <div className='flex justify-center sm:justify-end w-full sm:w-auto'>
                    <button
                      type='submit'
                      className='bg-white text-base text-indigo-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 w-full sm:w-auto cursor-pointer'
                    >
                      Sell
                    </button>
                  </div>
                </div>
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
              step='any'
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

      {/* UPDATED: Modern multi-lot selection modal with dropdown, cards, and summary */}
      {lotModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
          <div className='bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]'>
            {/* Header */}
            <h3 className='text-xl font-semibold mb-4 text-center'>
              Select Lots for <span className='text-indigo-600'>{lotModal.productName}</span>
            </h3>

            {/* NEW: Dropdown for selecting related lots */}
            <div className='mb-5'>
              <select
                value=''
                onChange={e => {
                  const selectedLot = lots.find(l => l.lot_name === e.target.value)

                  if (selectedLot) {
                    setLotModal(prev => {
                      // Prevent duplicates
                      if (prev.selectedLots.some(l => l.lot_name === selectedLot.lot_name)) return prev

                      return { ...prev, selectedLots: [...prev.selectedLots, { ...selectedLot, use_qty: 0 }] }
                    })
                  }
                }}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'
              >
                <option value=''>Select a lot...</option>
                {lots
                  .filter(
                    l =>
                      l.product.toLowerCase() === lotModal.productName.toLowerCase() &&
                      l.qty > 0 &&
                      !lotModal.selectedLots.some(s => s.lot_name === l.lot_name)
                  )
                  .map(l => (
                    <option key={l.lot_name} value={l.lot_name}>
                      {l.lot_name} — {l.qty} kg available
                    </option>
                  ))}
              </select>
            </div>

            {/* NEW: Selected lot cards */}
            <div className='space-y-4 mb-6'>
              {lotModal.selectedLots.map(l => (
                <div
                  key={l.lot_name}
                  className='border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-150'
                >
                  {/* Left Info */}
                  <div className='flex flex-col sm:flex-row sm:items-center sm:gap-6'>
                    <div>
                      <p className='font-semibold text-gray-800'>{l.lot_name}</p>
                      <p className='text-sm text-gray-600'>Supplier: {l.supplier_name}</p>
                      <p className='text-sm text-gray-600'>Remaining: {l.qty} kg</p>
                    </div>

                    {/* Input field */}
                    <div className='flex items-center gap-2 mt-2 sm:mt-0'>
                      <label className='text-sm text-gray-600'>Use:</label>
                      <input
                        type='number'
                        min='0'
                        max={l.qty}
                        value={l.use_qty}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0

                          setLotModal(prev => ({
                            ...prev,
                            selectedLots: prev.selectedLots.map(s =>
                              s.lot_name === l.lot_name ? { ...s, use_qty: val } : s
                            )
                          }))
                        }}
                        className='w-20 px-2 py-1 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-indigo-500 outline-none'
                      />
                      <span className='text-sm'>kg</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() =>
                      setLotModal(prev => ({
                        ...prev,
                        selectedLots: prev.selectedLots.filter(s => s.lot_name !== l.lot_name)
                      }))
                    }
                    className='text-gray-400 hover:text-red-500 transition-colors'
                    title='Remove this lot'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={2}
                      stroke='currentColor'
                      className='w-5 h-5'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* NEW: Summary section */}
            {lotModal.selectedLots.length > 0 && (
              <div className='bg-gray-50 border-t border-gray-200 rounded-lg p-4 mb-5'>
                <h4 className='text-base font-medium text-gray-700 mb-3'>Selected Lots Summary</h4>
                <ul className='space-y-1 text-sm text-gray-700'>
                  {lotModal.selectedLots.map(l => (
                    <li key={l.lot_name} className='flex justify-between'>
                      <span>{l.lot_name}</span>
                      <span className='font-semibold'>{l.use_qty || 0} kg</span>
                    </li>
                  ))}
                </ul>

                <div className='border-t mt-3 pt-2 flex justify-between font-medium text-gray-800'>
                  <span>Total Qty:</span>
                  <span>{lotModal.selectedLots.reduce((s, l) => s + (l.use_qty || 0), 0)} kg</span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setLotModal({ open: false, productId: null, productName: '', selectedLots: [] })}
                className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium'
              >
                Cancel
              </button>

              <button
                disabled={
                  lotModal.selectedLots.length === 0 || lotModal.selectedLots.every(l => !l.use_qty || l.use_qty <= 0)
                }
                onClick={() => {
                  // ✅ Only keep lots with > 0 qty
                  const validLots = lotModal.selectedLots.filter(l => l.use_qty && l.use_qty > 0)

                  // ✅ Calculate total qty from valid lots only
                  const totalQty = validLots.reduce((sum, l) => sum + (l.use_qty || 0), 0)

                  // ✅ Update product in cart
                  setCartProducts(prev =>
                    prev.map(item =>
                      item.product_id === lotModal.productId
                        ? { ...item, lots_selected: validLots, total_from_lots: totalQty }
                        : item
                    )
                  )

                  // ✅ Close modal
                  setLotModal({ open: false, productId: null, productName: '', selectedLots: [] })
                }}
                className={`px-4 py-2 rounded-md font-medium text-white ${
                  lotModal.selectedLots.length > 0
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
