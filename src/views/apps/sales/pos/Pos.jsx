'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { useForm } from 'react-hook-form'

import { FaTimes, FaEdit } from 'react-icons/fa'

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

import { toast } from 'react-toastify'

import PosHeader from './PosHeader'
import SearchProduct from './SearchProduct'

import { handleCrateCount } from '@/utils/handleCrateCount'
import { calculateTotalDue } from '@/utils/calculateTotalDue'
import ShowProductList from '@/components/layout/shared/ShowProductList'
import { handleSalesTotal } from '@/utils/handleSalesTotal'
import { useGlobalTooltip } from '@/components/layout/shared/useGlobalTooltip'
import { createSale } from '@/actions/saleActions'

export default function POSSystem({ productsData = [], customersData = [], categoriesData = [], lotsData = [] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categorySearch, setCategorySearch] = useState('')

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCustomer, setSelectedCustomer] = useState({})
  const [cartProducts, setCartProducts] = useState([])
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
    productId: null,
    productName: '',
    selectedLot: null
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (cartProducts.length > 0 && selectedCustomer?._id) {
        handleSalesTotal(setCartProducts, selectedCustomer)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [cartProducts, selectedCustomer])

  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      // Search term filter
      const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter - compare with categoryId._id
      const matchesCategory = !selectedCategory || product.categoryId?._id === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [productsData, searchTerm, selectedCategory])

  const handleRemoveCartItem = cartItemId => {
    setCartProducts(prevCart => prevCart.filter(item => item.cart_item_id !== cartItemId))
  }

  const handleCartProductClick = product => {
    if (!selectedCustomer?._id) {
      toast.warning('Please select a customer first.', {
        position: 'top-center'
      })

      return
    }

    setCartProducts(prevCart => {
      // Add product with additional properties
      const newCartItem = {
        ...product,
        product_id: product._id,
        cart_item_id: `${product._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isCrated: product.isCrated,
        crate_type_one: 0,
        crate_type_one_price: 0,
        crate_type_two: 0,
        crate_type_two_price: 0,
        cratePrice: 0,
        kg: 0,
        discount_kg: 0,
        discount_amount: 0,
        subtotal: 0,
        total: 0,
        profit: 0,
        cost_price: product.basePrice ?? 0,
        selling_price: product.basePrice ?? 0,
        product_name: product.productName,
        isCommissionable: product.allowCommission,
        commission_rate: product.commissionRate || 0,
        commission: 0,
        lot_commission: 0,
        selling_date: date,
        expiry_date: '',
        lot_selected: null
      }

      return [...prevCart, newCartItem]
    })
  }

  // calculate total due amount
  const totalDueAmount = calculateTotalDue(cartProducts)

  const { extraCrateType1Price, extraCrateType2Price, extraCrateType1, extraCrateType2 } = useMemo(() => {
    if (!selectedCustomer?._id || cartProducts.length === 0) {
      return {
        extraCrateType1Price: 0,
        extraCrateType2Price: 0,
        extraCrateType1: 0,
        extraCrateType2: 0
      }
    }

    // Calculate total crates sold
    const totalCrateType1Sold = cartProducts.reduce((sum, item) => sum + (item.crate_type_one || 0), 0)
    const totalCrateType2Sold = cartProducts.reduce((sum, item) => sum + (item.crate_type_two || 0), 0)

    // Get customer's available crates
    const customerCrateType1Available = selectedCustomer.crate_info?.type_1 || 0
    const customerCrateType2Available = selectedCustomer.crate_info?.type_2 || 0

    // Calculate extra crates
    const extraType1 = Math.max(0, totalCrateType1Sold - customerCrateType1Available)
    const extraType2 = Math.max(0, totalCrateType2Sold - customerCrateType2Available)

    // Calculate extra crate prices
    const extraType1Price = Number((extraType1 * (selectedCustomer.crate_info?.type_1_price || 0)).toFixed(2))
    const extraType2Price = Number((extraType2 * (selectedCustomer.crate_info?.type_2_price || 0)).toFixed(2))

    return {
      extraCrateType1Price: extraType1Price,
      extraCrateType2Price: extraType2Price,
      extraCrateType1: extraType1,
      extraCrateType2: extraType2
    }
  }, [cartProducts, selectedCustomer])

  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    watch: watchPayment,
    setValue: setPaymentValue,
    formState: { errors: paymentErrors }
  } = useForm({
    defaultValues: {
      receiveAmount: 0,
      dueAmount: totalDueAmount,
      paymentType: 'cash',
      received_amount_from_balance: 0,
      note: '',
      vatType: 'Select',
      discountType: 'Flat (৳)'
    }
  })

  const receiveAmount = watchPayment('receiveAmount')
  const vatType = watchPayment('vatType')
  const paymentType = watchPayment('paymentType')
  const receivedFromBalance = watchPayment('received_amount_from_balance')

  const parsePercent = v => {
    if (!v || v === 'Select') return 0
    const n = Number(String(v).replace('%', ''))

    return Number.isFinite(n) ? n / 100 : 0
  }

  const vatRate = parsePercent(vatType)
  const vatAmount = +(totalDueAmount * vatRate).toFixed(2)

  // Calculate total discounted amount across all products
  const totalDiscountedAmount = cartProducts.reduce((sum, item) => sum + (Number(item.discount_amount) || 0), 0)

  // Calculate total crate price across all products
  const totalCratePrice = cartProducts.reduce((sum, item) => sum + (Number(item.cratePrice) || 0), 0)

  // Update payable amount calculation
  const payableAmount = +(totalDueAmount - totalDiscountedAmount + vatAmount).toFixed(2)

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

      handleSalesTotal(() => updated, customersData)

      return updated
    })

    setCommissionModal({ open: false, productId: null, value: 0 })
  }

  useEffect(() => {
    if (paymentType === 'balance') {
      // When payment type is balance, sync receiveAmount with received_amount_from_balance
      setPaymentValue('receiveAmount', receivedFromBalance || 0)
    }

    // Always calculate due amount: payableAmount - receiveAmount
    const currentReceive = Number(receiveAmount) || 0
    const due = Math.max(0, payableAmount - currentReceive)

    setPaymentValue('dueAmount', due)
  }, [paymentType, receivedFromBalance, receiveAmount, payableAmount, setPaymentValue])

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
          const cartItemId = product.cart_item_id

          // Check if this row has a lot selected
          const hasLot = product.lot_selected && product.lot_selected.lot_name

          if (!hasLot) {
            return (
              <button
                type='button'
                onClick={() =>
                  setLotModal({
                    open: true,
                    cartItemId: cartItemId,
                    productId: product.product_id,
                    productName: product.product_name || '',
                    selectedLot: null
                  })
                }
                className='text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer'
              >
                Select Lot
              </button>
            )
          }

          return (
            <span
              onClick={() =>
                setLotModal({
                  open: true,
                  cartItemId: cartItemId,
                  productId: product.product_id,
                  productName: product.product_name || '',
                  selectedLot: {
                    ...product.lot_selected,
                    sell_qty: product.lot_selected.sell_qty || 0
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
          const val = product.crate_type_one || 0

          return (
            <input
              type='number'
              name='crate_type_one'
              onWheel={e => e.currentTarget.blur()}
              value={val === 0 ? '' : val}
              onChange={e => {
                const parsed = e.target.value === '' ? 0 : parseInt(e.target.value) || 0

                handleCrateCount(setCartProducts, product.cart_item_id, 'type_one', parsed)
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
          const val = product.crate_type_two || 0

          return (
            <input
              type='number'
              name='crate_type_two'
              onWheel={e => e.currentTarget.blur()}
              value={val === 0 ? '' : val}
              onChange={e => {
                const parsed = e.target.value === '' ? 0 : parseInt(e.target.value) || 0

                handleCrateCount(setCartProducts, product.cart_item_id, 'type_two', parsed)
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

  // Validation for balance payment
  const validateBalanceAmount = value => {
    if (paymentType !== 'balance') return true

    const amount = Number(value) || 0
    const availableBalance = selectedCustomer?.account_info?.balance || 0

    if (amount < 0) return 'Amount cannot be negative'

    if (amount > availableBalance) {
      return `Insufficient balance. Available: ৳${availableBalance.toFixed(2)}`
    }

    return true
  }

  const tableData = useMemo(() => cartProducts, [cartProducts])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  // submit payment
  const onSubmitPayment = async data => {
    // Validate
    const missingLot = cartProducts.find(p => !p.lot_selected?.lot_name)

    if (missingLot) {
      toast.error(`Please select a lot for "${missingLot.product_name}"`)

      return
    }

    // ========== STEP 1: Transform cart item to lot with complete structure ==========
    // ========== STEP 1: Transform cart item to lot with complete structure ==========
    const toLot = item => {
      const kg = item.kg || 0
      const discountKg = item.discount_kg || 0
      const sellingPrice = item.selling_price || 0
      const unitCost = item.lot_selected.unit_cost || 0

      // Calculate total_price (selling price calculation)
      const totalPrice = Number((kg * sellingPrice).toFixed(2))

      const discountedPrice = Number(((kg - discountKg) * sellingPrice).toFixed(2))

      // Calculate discount_amount (on cost price)
      const discountAmount = Number((discountKg * unitCost).toFixed(2))

      // ========== LOT COMMISSION (from lot data) ==========
      const lotCommissionRate = item.lot_selected.commission_rate || 0
      const lotCommissionAmount = Number((totalPrice * (lotCommissionRate / 100)).toFixed(2))

      // ========== CUSTOMER COMMISSION (from cart item - now moved to lot level) ==========
      const customerCommissionRate = item.commission_rate || 0
      const customerCommissionAmount = Number((totalPrice * (customerCommissionRate / 100)).toFixed(2))

      // ========== LOT PROFIT CALCULATION ==========
      // For commissionable products: profit = customer commission
      // For non-commissionable products: profit = (selling - cost) for actual kg sold
      let lotProfit = 0

      if (item.isCommissionable) {
        // Profit = customer commission for this lot
        lotProfit = customerCommissionAmount
      } else {
        // Profit = margin (selling - cost) for actual kg sold
        lotProfit = Number(((kg - discountKg) * (sellingPrice - unitCost)).toFixed(2))
        lotProfit = Math.max(0, lotProfit) // Ensure non-negative
      }

      return {
        lotId: item.lot_selected.lot_id,
        kg: kg,
        discount_Kg: discountKg,
        unit_price: sellingPrice,
        selling_price: discountedPrice,
        total_price: totalPrice,
        discount_amount: discountAmount,
        crate_type1: item.crate_type_one || 0,
        crate_type2: item.crate_type_two || 0,

        // ========== LOT COMMISSION ==========
        lot_commission_rate: lotCommissionRate,
        lot_commission_amount: lotCommissionAmount,

        // ========== CUSTOMER COMMISSION (now at lot level) ==========
        customer_commission_rate: customerCommissionRate,
        customer_commission_amount: customerCommissionAmount,

        // ========== LOT PROFIT ==========
        lot_profit: lotProfit
      }
    }

    // ========== STEP 2: Group by product ==========
    const grouped = cartProducts.reduce((acc, item) => {
      if (!acc[item.product_id]) acc[item.product_id] = []
      acc[item.product_id].push(item)

      return acc
    }, {})

    // ========== STEP 3: Build items array ==========
    const items = Object.entries(grouped).map(([pid, items]) => {
      // Get customer commission rate (should be same for all lots of this product)
      const customerCommissionRate = items[0].commission_rate || 0

      const selectedLots = items.map(toLot)

      // Calculate total customer commission for this product
      const customerCommissionAmount = Number(items.reduce((sum, item) => sum + (item.commission || 0), 0).toFixed(2))

      // Profit for all, commissional or no commissional
      const profit = Number(items.reduce((sum, item) => sum + (item.profit || 0), 0).toFixed(2))

      return {
        productId: pid,
        selected_lots: selectedLots

        // product_name: items[0].product_name,
        // customer_commission_rate: customerCommissionRate,
        // customer_commission_amount: customerCommissionAmount,
        // profit: profit
      }
    })

    // ========== STEP 4: Calculate total commissions ==========
    const total_custom_commission = Number(
      items
        .reduce((sum, item) => {
          return (
            sum +
            item.selected_lots.reduce((lotSum, lot) => {
              return lotSum + (lot.customer_commission_amount || 0)
            }, 0)
          )
        }, 0)
        .toFixed(2)
    )

    const total_lots_commission = Number(
      items
        .reduce((sum, item) => {
          return (
            sum +
            item.selected_lots.reduce((lotSum, lot) => {
              return lotSum + (lot.lot_commission_amount || 0)
            }, 0)
          )
        }, 0)
        .toFixed(2)
    )

    const total_profit = Number(
      items
        .reduce((sum, item) => {
          return (
            sum +
            item.selected_lots.reduce((lotSum, lot) => {
              return lotSum + (lot.lot_profit || 0)
            }, 0)
          )
        }, 0)
        .toFixed(2)
    )

    // ========== STEP 6: Build final payload ==========
    const payload = {
      sale_date: date,
      customerId: selectedCustomer._id,
      total_custom_commission: total_custom_commission,
      total_lots_commission: total_lots_commission,
      total_profit: total_profit + total_lots_commission,
      items: items,
      payment_details: {
        extra_crate_type1_price: extraCrateType1Price,
        extra_crate_type2_price: extraCrateType2Price,
        payable_amount: payableAmount || 0,
        received_amount: Number(data.receiveAmount) || 0,
        received_amount_from_balance: Number(data.received_amount_from_balance) || 0,
        due_amount: Number(data.dueAmount) || 0,
        payment_type: data.paymentType || 'cash',
        vat: vatAmount || 0,
        note: data.note || ''
      }
    }

    console.log('Sales payload:', JSON.stringify(payload, null, 2))

    try {
      const result = await createSale(payload)

      if (result.success) {
        toast.success('Product sold successfully!')

        // console.log('Sale response:', result.data)

        // Clear cart and customer
        setCartProducts([])
        setSelectedCustomer({})
      } else {
        toast.error(result.error || 'Failed to create sale')
      }
    } catch (error) {
      console.error('Sale submission error:', error)
      toast.error('An error occurred while creating the sale')
    }
  }

  // Handle confirm click - save the selected lot to the specific cart row
  const handleLotConfirm = () => {
    // Ensure a lot is selected
    if (!lotModal.selectedLot || !lotModal.selectedLot.lot_name) {
      toast.error('Please select a lot before confirming.')

      return
    }

    const lot = lotModal.selectedLot
    const sellQty = parseFloat(lot.sell_qty) || 0
    const currentSold = parseFloat(lot.totalKgSold) || 0 // Use totalKgSold from sales

    // Validate: must enter a quantity
    if (sellQty <= 0) {
      toast.error('Please enter a valid quantity to sell.')

      return
    }

    // Update ONLY the specific cart row identified by cart_item_id
    setCartProducts(prev => {
      const updated = prev.map(item => {
        if (item.cart_item_id === lotModal.cartItemId) {
          return {
            ...item,
            lot_selected: {
              lot_id: lot._id,
              lot_name: lot.lot_name,
              supplier_id: lot.supplierId,
              supplier_name: lot.supplierId?.basic_info?.name,
              product_id: lot.productsId?._id,
              product_name: lot.productsId?.productName,
              unit_cost: lot.costs?.unitCost || 0,
              commission_rate: lot.costs?.commissionRate || 0,
              has_commission: lot.hasCommission,
              totalKgSold: currentSold + sellQty, // Track total sold
              sell_qty: sellQty, // Quantity for this sale
              purchase_date: lot.purchase_date,
              status: lot.status,
              carat_type_1: lot.carat?.carat_Type_1 || 0,
              carat_type_2: lot.carat?.carat_Type_2 || 0
            },
            kg: sellQty, // Auto-fill kg field
            cost_price: lot.costs?.unitCost || 0, // Update cost price from lot
            selling_price: item.selling_price || lot.costs?.unitCost || 0 // Keep current or use cost
          }
        }

        return item
      })

      return updated
    })

    // Show success message
    toast.success(`Added ${sellQty} kg from ${lot.lot_name}`)

    // Close modal and reset
    setLotModal({
      open: false,
      cartItemId: null,
      productId: null,
      productName: '',
      selectedLot: null
    })
  }

  useEffect(() => {
    setPaymentValue('received_amount_from_balance', 0)
    setPaymentValue('receiveAmount', 0)
    setPaymentValue('dueAmount', 0)
    setPaymentValue('paymentType', 'cash')
  }, [selectedCustomer?._id, setPaymentValue])

  return (
    <div className='min-h-[calc(100vh-54px] bg-gray-50 p-1'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex flex-col lg:flex-row items-center justify-between'>
          <PosHeader />

          <SearchProduct
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            categoriesData={categoriesData}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
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
                value={selectedCustomer?._id || ''}
                onChange={e => {
                  const customer = customersData.find(c => c._id === e.target.value)

                  setSelectedCustomer(customer || {})
                }}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none'
              >
                <option value=''>Select Customer</option>
                {customersData.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.basic_info.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Customer Info */}
          {selectedCustomer?._id && (
            <div className='mb-6'>
              <div className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                {/* Left Section - Profile */}
                <div className='flex items-center gap-4 w-full sm:w-auto'>
                  <img
                    src={selectedCustomer.basic_info.avatar || '/placeholder.svg'}
                    alt={selectedCustomer.basic_info.name}
                    className='w-16 h-16 rounded-full border-2 border-white object-cover shadow-md'
                  />

                  <div>
                    <h2 className='text-lg font-semibold'>{selectedCustomer.basic_info.name}</h2>
                    <p className='text-sm opacity-80'>{selectedCustomer.contact_info.phone}</p>
                    <p className='text-xs opacity-60'>{selectedCustomer.contact_info.email}</p>
                    <p className='text-xs opacity-60'>{selectedCustomer.contact_info.location}</p>
                  </div>
                </div>

                {/* Right Section - Stats */}
                <div className='grid grid-cols-2 gap-4 w-full sm:w-auto text-center'>
                  <div className='bg-white/15 backdrop-blur-sm rounded-lg py-2 px-3'>
                    <p className='text-xs opacity-80'>Balance</p>
                    <p className='text-base font-bold'>৳ {(selectedCustomer.account_info.balance || 0).toFixed(2)}</p>
                  </div>

                  <div className='bg-white/15 backdrop-blur-sm rounded-lg py-2 px-3'>
                    <p className='text-xs opacity-80'>Due</p>
                    <p className='text-base font-bold text-yellow-300'>
                      ৳ {(selectedCustomer.account_info.due || 0).toFixed(2)}
                    </p>
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
                      <option value=''>Select Type</option>
                      <option value='cash'>Cash</option>
                      <option value='card'>Card</option>
                      <option value='bkash'>Bkash</option>
                      <option value='balance' disabled={!selectedCustomer?._id}>
                        Balance {!selectedCustomer?._id && '(Select customer first)'}
                      </option>
                    </select>
                  </div>

                  {paymentType === 'balance' && (
                    <div className='flex items-center'>
                      <label className='w-32 text-sm'>Amount from Balance</label>
                      <div className='flex-1'>
                        <input
                          type='number'
                          {...registerPayment('received_amount_from_balance', {
                            validate: validateBalanceAmount
                          })}
                          className={`w-full px-3 py-2 border rounded ${
                            paymentErrors.received_amount_from_balance ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder='0'
                        />
                        {selectedCustomer?._id && (
                          <p className='text-xs text-gray-500 mt-1'>
                            Available Balance: ৳{(selectedCustomer.account_info.balance || 0).toFixed(2)}
                          </p>
                        )}
                        {paymentErrors.received_amount_from_balance && (
                          <p className='text-xs text-red-500 mt-1'>
                            {paymentErrors.received_amount_from_balance.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className='flex items-center'>
                    <label className='w-32 text-sm'>Receive Amount</label>
                    <input
                      type='number'
                      {...registerPayment('receiveAmount')}
                      disabled={paymentType === 'balance'} // Disabled for balance payment
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded ${
                        paymentType === 'balance' ? 'bg-gray-100' : ''
                      }`}
                      placeholder='0'
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
                    <span className='text-sm'>Crate Charges</span>
                    <span className='text-sm'>৳ {totalCratePrice.toFixed(2)}</span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Total Discount</span>
                    <span className='text-sm'>৳ {totalDiscountedAmount}</span>
                  </div>

                  {extraCrateType1 > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Extra Crate Type 1 ({extraCrateType1} pcs)</span>
                      <span className='text-sm'>৳ {extraCrateType1Price.toFixed(2)}</span>
                    </div>
                  )}

                  {extraCrateType2 > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Extra Crate Type 2 ({extraCrateType2} pcs)</span>
                      <span className='text-sm'>৳ {extraCrateType2Price.toFixed(2)}</span>
                    </div>
                  )}

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
                    <span className='text-sm'>
                      ৳ {cartProducts.reduce((sum, item) => sum + (Number(item.commission) || 0), 0)}
                    </span>
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
                      disabled={
                        totalDueAmount < 1 || (paymentType === 'balance' && paymentErrors.received_amount_from_balance)
                      }
                      className={`bg-white text-base text-indigo-600 font-semibold px-6 py-2 rounded-lg transition-all duration-200 w-full sm:w-auto ${
                        totalDueAmount < 1 || (paymentType === 'balance' && paymentErrors.received_amount_from_balance)
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-100 cursor-pointer'
                      }`}
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
        <ShowProductList filteredProducts={filteredProducts} handleCartProductClick={handleCartProductClick} />
      </div>

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
                  // Find the selected lot from lotsData using new structure
                  const selectedLot = lotsData.find(l => l.lot_name === e.target.value)

                  if (selectedLot) {
                    setLotModal(prev => ({
                      ...prev,
                      selectedLot: {
                        ...selectedLot,
                        sell_qty: 0, // Initialize to 0
                        totalKgSold: selectedLot.sales?.totalKgSold || 0
                      }
                    }))
                  } else {
                    setLotModal(prev => ({ ...prev, selectedLot: null }))
                  }
                }}
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none'
              >
                <option value=''>Select a lot...</option>
                {/* Filter lots matching this product _id */}
                {lotsData
                  .filter(l => l.productsId?._id === lotModal.productId)
                  .map(l => (
                    <option key={l._id} value={l.lot_name}>
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
                    <p className='text-sm text-gray-600'>
                      Supplier: {lotModal.selectedLot.supplierId?.basic_info?.name || 'N/A'}
                    </p>
                    <p className='text-sm text-gray-600'>Already Sold: {lotModal.selectedLot.totalKgSold || 0} kg</p>
                    <p className='text-sm text-gray-600'>Unit Cost: ৳{lotModal.selectedLot.costs?.unitCost || 0}</p>
                    <p className='text-sm text-gray-600'>
                      Status: <span className='capitalize'>{lotModal.selectedLot.status}</span>
                    </p>
                  </div>

                  {/* Quantity input */}
                  <div className='flex items-center gap-2'>
                    <label className='text-sm text-gray-600'>Qty:</label>
                    <input
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='0'
                      value={lotModal.selectedLot.sell_qty === 0 ? '' : lotModal.selectedLot.sell_qty}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0

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
                onClick={() =>
                  setLotModal({
                    open: false,
                    cartItemId: null,
                    productId: null,
                    productName: '',
                    selectedLot: null
                  })
                }
                className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium'
              >
                Cancel
              </button>

              <button
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
