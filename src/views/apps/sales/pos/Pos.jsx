'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'

import { FiX } from 'react-icons/fi'

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

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCustomer, setSelectedCustomer] = useState({})
  const [cartProducts, setCartProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState([])
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

  // const filteredBrands = brands.filter(brand => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

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

    const isAlreadyAdded = cartProducts.some(item => item.product_id === product.id)

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
        isCrated: product.isCrated,
        crate: {
          type_one: 0,
          type_two: 0
        },
        cratePrice: 0,
        kg: 0,
        discount_kg: 0,
        subtotal: 0,
        total: 0,
        profit: 0,
        cost_price: product.cost_price ?? 0,
        selling_price: product.selling_price ?? 0,
        product_name: product.name,
        isCommissionable: product.isCommissionable,
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

  const columns = useMemo(() => {
    // --- Base Columns (always shown) ---
    const baseColumns = [
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
        accessorKey: 'lots_selected',
        header: 'Lot',
        cell: ({ row }) => {
          const product = row.original
          const totalLots = product.lots_selected?.length || 0

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
                className='text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer'
              >
                Select Lot
              </button>
            )
          }

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

          // Multiple lots with tooltip
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
        accessorKey: 'selling_price',
        header: 'Cost(unit)',
        cell: ({ row }) => {
          const product = row.original

          return (
            <input
              type='number'
              name='selling_price'
              onWheel={e => e.currentTarget.blur()}
              value={product.selling_price === 0 ? '' : (product.selling_price ?? '')}
              onChange={e => {
                const val = e.target.value

                setCartProducts(prev =>
                  prev.map(item =>
                    item.product_id === product.product_id
                      ? { ...item, selling_price: val === '' ? 0 : parseFloat(val) }
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
        header: 'Kg',
        cell: ({ row }) => {
          const product = row.original

          return (
            <input
              type='number'
              name='kg'
              onWheel={e => e.currentTarget.blur()}
              value={product.kg === 0 ? '' : (product.kg ?? '')}
              onChange={e => {
                const val = e.target.value
                const parsed = val === '' ? 0 : parseFloat(val) || 0

                setCartProducts(prev =>
                  prev.map(item => (item.product_id === product.product_id ? { ...item, kg: parsed } : item))
                )
              }}
              placeholder='0'
              className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      },

      {
        accessorKey: 'commission_rate',
        header: 'Commission',
        cell: ({ row }) => {
          const product = row.original
          const pct = Number(product?.commission_rate) || 0

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
              name='discount_kg'
              onWheel={e => e.currentTarget.blur()}
              value={product.discount_kg === 0 ? '' : (product.discount_kg ?? '')}
              onChange={e => {
                const val = e.target.value
                const parsed = val === '' ? 0 : parseFloat(val)

                setCartProducts(prev =>
                  prev.map(item => (item.product_id === product.product_id ? { ...item, discount_kg: parsed } : item))
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
              name='total'
              onWheel={e => e.currentTarget.blur()}
              value={product.total === 0 ? '' : (product.total ?? '')}
              onChange={e => {
                const val = e.target.value
                const parsed = val === '' ? 0 : parseFloat(val)

                setCartProducts(prev =>
                  prev.map(item => (item.product_id === product.product_id ? { ...item, total: parsed } : item))
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
    ]

    // --- Crate Columns (only if product.isCrated === true) ---
    const crateColumns = [
      {
        accessorKey: 'crate_type_one',
        header: 'Crate Type 1',
        cell: ({ row }) => {
          const product = row.original

          if (!product.isCrated) return null
          const val = product.crate?.type_one || 0

          return (
            <input
              type='number'
              name='crate_type_one'
              onWheel={e => e.currentTarget.blur()}
              value={val === 0 ? '' : val}
              onChange={e => {
                const parsed = e.target.value === '' ? 0 : parseInt(e.target.value) || 0

                handleCrateCount(setCartProducts, product.product_id, product.customer_id, 'type_one', parsed)
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

          if (!product.isCrated) return null
          const val = product.crate?.type_two || 0

          return (
            <input
              type='number'
              name='crate_type_two'
              onWheel={e => e.currentTarget.blur()}
              value={val === 0 ? '' : val}
              onChange={e => {
                const parsed = e.target.value === '' ? 0 : parseInt(e.target.value) || 0

                handleCrateCount(setCartProducts, product.product_id, product.customer_id, 'type_two', parsed)
              }}
              placeholder='0'
              className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      }
    ]

    // --- Merge conditionally ---
    const hasCratedProduct = cartProducts.some(p => p.isCrated)

    const finalColumns = hasCratedProduct
      ? [
          ...baseColumns.slice(0, 2), // Product + Lot
          ...crateColumns, // Insert crate columns
          ...baseColumns.slice(2) // Then the rest
        ]
      : baseColumns

    return finalColumns
  }, [cartProducts.some(p => p.isCrated), showTooltip])

  const tableData = useMemo(() => cartProducts, [cartProducts])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  // submit payment
  const onSubmitPayment = data => {
    // Validate that kg and lot total match before submit
    const hasMismatch = cartProducts.some(p => (p.total_from_lots || 0) !== (p.kg || 0))

    if (hasMismatch) {
      toast.error('Please select enough kg from supplier lots before submitting.', {
        position: 'top-center',
        autoClose: 1100
      })

      return
    }

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

    setCartProducts([])
  }

  // Handle confirm click
  const handleLotConfirm = () => {
    const validLots = lotModal.selectedLots.filter(l => l.use_qty && l.use_qty > 0)

    // Validate each lot’s total usage
    const invalidLot = validLots.find(l => l.used + l.use_qty > 30)

    if (invalidLot) {
      toast.error(`You can’t use more than 30 kg from lot ${invalidLot.lot_name}.`)

      return
    }

    // Calculate total
    const totalQty = validLots.reduce((sum, l) => sum + (l.use_qty || 0), 0)

    // Update cart product (lots, total_from_lots, kg)
    setCartProducts(prev =>
      prev.map(item =>
        item.product_id === lotModal.productId
          ? {
              ...item,
              lots_selected: validLots.map(l => ({
                supplier_name: l.supplier_name,
                supplier_id: l.supplier_id,
                product: l.product,
                used: l.used + l.use_qty,
                lot_name: l.lot_name
              })),
              total_from_lots: totalQty,
              kg: totalQty
            }
          : item
      )
    )

    // Close modal
    setLotModal({ open: false, productId: null, productName: '', selectedLots: [] })
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
                      l.used < 31 &&
                      !lotModal.selectedLots.some(s => s.lot_name === l.lot_name)
                  )
                  .map(l => (
                    <option
                      key={l.lot_name}
                      value={l.lot_name}
                      className={l.used >= 25 ? 'text-red-500 font-semibold' : ''}
                    >
                      {l.lot_name} — {l.used} kg used
                    </option>
                  ))}
              </select>
            </div>

            {/* NEW: Selected lot cards */}
            <div className='space-y-4 mb-6'>
              {lotModal.selectedLots.map(l => (
                <div
                  key={l.lot_name}
                  className={`border  rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-150 ${l.used >= 25 ? 'border-orange-400 focus:ring-orange-300' : l.error ? 'border-red-500' : 'border-gray-200'}`}
                >
                  {/* Left Info */}
                  <div className='flex flex-col sm:flex-row sm:items-center sm:gap-6'>
                    <div>
                      <p className='font-semibold text-gray-800'>{l.lot_name}</p>
                      <p className='text-sm text-gray-600'>Supplier: {l.supplier_name}</p>
                      <p className='text-sm text-gray-600'>Already Used: {l.used} kg</p>
                    </div>

                    {/* Updated: Use (kg) input with live validation + toast error */}
                    <div className='flex items-center gap-2 mt-2 sm:mt-0'>
                      <label className='text-sm text-gray-600'>Use:</label>
                      <input
                        type='number'
                        min='0'
                        placeholder='0'
                        value={l.use_qty === 0 ? '' : l.use_qty}
                        max={30 - l.used}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          const maxAllowed = 30 - l.used

                          if (val > maxAllowed) {
                            requestAnimationFrame(() => {
                              toast.dismiss()
                              toast.error('You can’t use more than 30 kg from a lot.', {
                                position: 'top-center',
                                autoClose: 1000
                              })
                            })

                            return
                          }

                          requestAnimationFrame(() => {
                            setLotModal(prev => ({
                              ...prev,
                              selectedLots: prev.selectedLots.map(s =>
                                s.lot_name === l.lot_name ? { ...s, use_qty: val } : s
                              )
                            }))
                          })
                        }}
                        className={`w-20 px-2 py-1 border rounded-md text-center focus:ring-2 outline-none ${
                          l.used >= 25
                            ? 'border-orange-400 focus:ring-orange-300'
                            : 'border-gray-300 focus:ring-indigo-500'
                        }`}
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
                    className='text-red-400 hover:text-red-500 transition-colors bg-transparent'
                    title='Remove this lot'
                  >
                    <FiX size={20} />
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
                onClick={handleLotConfirm}
                className={`px-4 py-2 rounded-md font-medium text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed ${
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
