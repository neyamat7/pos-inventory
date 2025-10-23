'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { FiX } from 'react-icons/fi'

import { useForm } from 'react-hook-form'

import { FaTimes, FaEdit } from 'react-icons/fa'

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

import { toast } from 'react-toastify'

import PosHeader from './PosHeader'
import SearchProduct from './SearchProduct'

import CategoryModal from '@/components/layout/shared/CategoryModal'
import { categories } from '@/data/productsCategory/productsCategory'
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
    cartItemId: null,
    productName: '',
    selectedLot: null
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

  // Function to remove category
  const handleRemoveCategory = categoryToRemove => {
    setSelectedCategory(prev => prev.filter(category => category !== categoryToRemove))
  }

  const handleRemoveCartItem = cartItemId => {
    setCartProducts(prevCart => prevCart.filter(item => item.cart_item_id !== cartItemId))
  }

  const handleCartProductClick = product => {
    if (!selectedCustomer?.sl) {
      toast.warning('Please select a customer first.', {
        position: 'top-center'
      })

      return
    }

    setCartProducts(prevCart => {
      // Add product with additional properties
      const newCartItem = {
        ...product,
        product_id: product.id,
        cart_item_id: `${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        lot_selected: null
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

          // Use cart_item_id to identify this specific cart row
          const cartItemId = product.cart_item_id

          // Check if this row has a lot selected
          const hasLot = product.lot_selected && product.lot_selected.lot_name

          if (!hasLot) {
            // No lot selected - show "Select Lot" button
            return (
              <button
                type='button'
                onClick={() =>
                  setLotModal({
                    open: true,
                    cartItemId: cartItemId, // Pass unique cart item ID
                    productName: product.product_name || '',
                    selectedLot: null // Start with no selection
                  })
                }
                className='text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer'
              >
                Select Lot
              </button>
            )
          }

          // Lot is selected - show lot name (clickable to change)
          return (
            <span
              onClick={() =>
                setLotModal({
                  open: true,
                  cartItemId: cartItemId, // Pass unique cart item ID
                  productName: product.product_name || '',
                  selectedLot: {
                    ...product.lot_selected,
                    sell_qty: product.lot_selected.sell_qty || 0 // Pre-fill with existing quantity
                  }
                })
              }
              className='text-gray-800 font-semibold cursor-pointer hover:text-indigo-600 transition-colors'
            >
              {product.lot_selected.lot_name}
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
                    item.cart_item_id === product.cart_item_id
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
                  prev.map(item => (item.cart_item_id === product.cart_item_id ? { ...item, kg: parsed } : item))
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
                  prev.map(item =>
                    item.cart_item_id === product.cart_item_id ? { ...item, discount_kg: parsed } : item
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
              name='total'
              onWheel={e => e.currentTarget.blur()}
              value={product.total === 0 ? '' : (product.total ?? '')}
              onChange={e => {
                const val = e.target.value
                const parsed = val === '' ? 0 : parseFloat(val)

                setCartProducts(prev =>
                  prev.map(item => (item.cart_item_id === product.cart_item_id ? { ...item, total: parsed } : item))
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
              onClick={() => handleRemoveCartItem(product.cart_item_id)}
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

                handleCrateCount(setCartProducts, product.cart_item_id, product.customer_id, 'type_one', parsed)
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

                handleCrateCount(setCartProducts, product.cart_item_id, product.customer_id, 'type_two', parsed)
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
    // Validate that every product has a lot selected
    const missingLot = cartProducts.find(p => !p.lot_selected || !p.lot_selected.lot_name)

    if (missingLot) {
      toast.error(`Please select a lot for "${missingLot.product_name}" before submitting.`, {
        position: 'top-center',
        autoClose: 2000
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

  // Handle confirm click - save the selected lot to the specific cart row
  const handleLotConfirm = () => {
    // Ensure a lot is selected
    if (!lotModal.selectedLot || !lotModal.selectedLot.lot_name) {
      toast.error('Please select a lot before confirming.')

      return
    }

    const lot = lotModal.selectedLot
    const sellQty = parseFloat(lot.sell_qty) || 0 // Ensure it's a number
    const currentSold = parseFloat(lot.sold) || 0 // Ensure it's a number

    // Validate: must enter a quantity
    if (sellQty <= 0) {
      toast.error('Please enter a valid quantity to sell.')

      return
    }

    // Validate: check if total usage exceeds limit
    if (currentSold + sellQty > 30) {
      toast.error(`You can't use more than 30 kg from lot ${lot.lot_name}. Available: ${30 - currentSold} kg`)

      return
    }

    // Update ONLY the specific cart row identified by cart_item_id
    setCartProducts(prev => {
      const updated = prev.map(item => {
        // Only update the row matching this unique cart_item_id
        if (item.cart_item_id === lotModal.cartItemId) {
          return {
            ...item,
            lot_selected: {
              supplier_name: lot.supplier_name,
              supplier_id: lot.supplier_id,
              product: lot.product,
              sold: currentSold + sellQty, // Track total sold from this lot
              lot_name: lot.lot_name,
              sell_qty: sellQty // Store quantity for this sale
            },
            kg: sellQty // Auto-fill kg field with lot quantity
          }
        }

        return item // Don't modify other rows
      })

      return updated
    })

    // Show success message
    toast.success(`Added ${sellQty} kg from ${lot.lot_name}`)

    // Close modal and reset
    setLotModal({ open: false, cartItemId: null, productName: '', selectedLot: null })
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
            {/* Payment Details */}
            <form onSubmit={handleSubmitPayment(onSubmitPayment)} className='mt-auto'>
              <h1 className='mb-4'>Payment Details</h1>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Left Side */}
                <div className='space-y-4'>
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

                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Commission Amount</span>
                    <span className='text-sm'>৳ 0</span>
                  </div>
                  <div className='flex items-center justify-between font-medium'>
                    <span className='text-sm'>Total Amount</span>
                    <span>৳ {totalDueAmount}</span>
                  </div>

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

      {/* Single lot selection modal */}
      {lotModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
          <div className='bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative overflow-y-auto max-h-[90vh]'>
            {/* Header */}
            <h3 className='text-xl font-semibold mb-4 text-center'>
              Select Lot for <span className='text-indigo-600'>{lotModal.productName}</span>
            </h3>

            {/* Dropdown to select ONE lot */}
            <div className='mb-5'>
              <select
                value={lotModal.selectedLot?.lot_name || ''}
                onChange={e => {
                  // Find the selected lot from the lots data
                  const selectedLot = lots.find(l => l.lot_name === e.target.value)

                  if (selectedLot) {
                    // Ensure all numeric fields exist with defaults
                    setLotModal(prev => ({
                      ...prev,
                      selectedLot: {
                        ...selectedLot,
                        sell_qty: 0, // Initialize to 0
                        sold: selectedLot.sold || 0 // Ensure sold has a default value
                      }
                    }))
                  } else {
                    // User selected "Select a lot..." - clear selection
                    setLotModal(prev => ({ ...prev, selectedLot: null }))
                  }
                }}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'
              >
                <option value=''>Select a lot...</option>
                {/* Filter lots matching this product name */}
                {lots
                  .filter(l => l.product.toLowerCase() === lotModal.productName.toLowerCase())
                  .map(l => (
                    <option key={l.lot_name} value={l.lot_name}>
                      {l.lot_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Show selected lot details (if any) */}
            {lotModal.selectedLot && (
              <div className='border border-gray-200 rounded-lg p-4 mb-6 shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  {/* Lot info */}
                  <div>
                    <p className='font-semibold text-gray-800'>{lotModal.selectedLot.lot_name}</p>
                    <p className='text-sm text-gray-600'>Supplier: {lotModal.selectedLot.supplier_name}</p>
                    <p className='text-sm text-gray-600'>Already Sold: {lotModal.selectedLot.sold} kg</p>
                  </div>

                  {/* Quantity input */}
                  <div className='flex items-center gap-2'>
                    <label className='text-sm text-gray-600'>Qty:</label>
                    <input
                      type='number'
                      min='0'
                      placeholder='0'
                      value={lotModal.selectedLot.sell_qty === 0 ? '' : lotModal.selectedLot.sell_qty}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0

                        // Update the sell_qty for this lot
                        setLotModal(prev => ({
                          ...prev,
                          selectedLot: { ...prev.selectedLot, sell_qty: val }
                        }))
                      }}
                      className='w-24 px-2 py-1 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-indigo-500 outline-none'
                    />
                    <span className='text-sm'>kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setLotModal({ open: false, cartItemId: null, productName: '', selectedLot: null })}
                className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium'
              >
                Cancel
              </button>

              <button
                // Disable if no lot selected or no quantity entered
                disabled={!lotModal.selectedLot || !lotModal.selectedLot.sell_qty || lotModal.selectedLot.sell_qty <= 0}
                onClick={handleLotConfirm}
                className='px-4 py-2 rounded-md font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
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
