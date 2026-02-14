'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { useForm } from 'react-hook-form'

import CircularProgress from '@mui/material/CircularProgress'
import { FaEdit, FaPlus, FaTimes } from 'react-icons/fa'

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { toast } from 'react-toastify'

import PosHeader from './PosHeader'
import SearchProduct from './SearchProduct'

import { createSale } from '@/actions/saleActions'
import ShowProductList from '@/components/layout/shared/ShowProductList'
import { useGlobalTooltip } from '@/components/layout/shared/useGlobalTooltip'
import { calculateTotalDue } from '@/utils/calculateTotalDue'
import { handleCrateCount } from '@/utils/handleCrateCount'
import { handleSalesTotal } from '@/utils/handleSalesTotal'
import { showError, showSuccess } from '@/utils/toastUtils'

import { getCustomers } from '@/actions/customerActions'
import { Autocomplete, IconButton, TextField } from '@mui/material'
import AddCustomerDrawer from '../../customers/list/AddCustomerDrawer'
import InvoicePrintHandler from '../invoice/InvoicePrintHandler'

export default function POSSystem({ productsData = [], customersData = [], categoriesData = [], lotsData = [] }) {
  // console.log('lotsdata', lotsData)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categorySearch, setCategorySearch] = useState('')

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [cartProducts, setCartProducts] = useState([])
  const [customerOptions, setCustomerOptions] = useState(customersData || [])
  const [customerSearchInput, setCustomerSearchInput] = useState('')
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const showTooltip = useGlobalTooltip()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [commissionModal, setCommissionModal] = useState({
    open: false,
    productId: null,
    supplierId: null,
    value: 0
  })

  // Add Customer Drawer State
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)

  const refreshCustomers = async () => {
    setLoadingCustomers(true)
    try {
      // Fetch all customers (using a large limit to get all)
      const res = await getCustomers(1, 1000)
      
      if (res.success && res.data?.customers) {
        setCustomerOptions(res.data.customers) // Update the options list
      }
    } catch (error) {
      console.error('Failed to refresh customers:', error)
      toast.error('Failed to refresh customer list')
    } finally {
      setLoadingCustomers(false)
    }
  }

  const [lotModal, setLotModal] = useState({
    open: false,
    cartItemId: null,
    productId: null,
    productName: '',
    selectedLot: null
  })

  const [lastSaleData, setLastSaleData] = useState(null)

  // Create a dependency key based on input fields only
  const cartInputKey = useMemo(() => {
    return cartProducts
      .map(
        item =>
          `${item.cart_item_id}-${item.kg}-${item.discount_kg}-${item.discount_amount}-${item.box_quantity}-${item.piece_quantity}-${item.selling_price}-${item.crate_type_one}-${item.crate_type_two}-${item.commission_rate}`
      )
      .join('|')
  }, [cartProducts])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (cartProducts.length > 0 && selectedCustomer?._id) {
        handleSalesTotal(setCartProducts, selectedCustomer)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [cartInputKey, selectedCustomer?._id])

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
        isPieced: product.sell_by_piece,
        isBoxed: product.isBoxed,
        crate_type_one: 0,
        crate_type_one_price: 0,
        crate_type_two: 0,
        crate_type_two_price: 0,
        cratePrice: 0,
        kg: 0,
        box_quantity: 0,
        piece_quantity: 0,
        sell_by_piece: product.sell_by_piece || false,
        discount_kg: 0,
        total_discount_kg: 0,
        discount_amount: 0,
        subtotal: 0,
        total: 0,
        profit: 0,
        cost_price: product.basePrice ?? 0,
        selling_price: product.basePrice ?? 0,
        product_name: product.productName,
        productNameBn: product.productNameBn,
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

  const totalSubtotal = useMemo(() => {
    return cartProducts.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0)
  }, [cartProducts])

  const { totalCrateType1Price, totalCrateType2Price, totalCrateType1, totalCrateType2 } = useMemo(() => {
    if (!selectedCustomer?._id || cartProducts.length === 0) {
      return {
        totalCrateType1Price: 0,
        totalCrateType2Price: 0,
        totalCrateType1: 0,
        totalCrateType2: 0
      }
    }

    // Calculate total crates sold
    const totalCrateType1Sold = cartProducts.reduce((sum, item) => sum + (item.crate_type_one || 0), 0)
    const totalCrateType2Sold = cartProducts.reduce((sum, item) => sum + (item.crate_type_two || 0), 0)

    // Calculate total crate prices
    const totalType1Price = Number((totalCrateType1Sold * (selectedCustomer.crate_info?.type_1_price || 0)).toFixed(2))
    const totalType2Price = Number((totalCrateType2Sold * (selectedCustomer.crate_info?.type_2_price || 0)).toFixed(2))

    return {
      totalCrateType1Price: totalType1Price,
      totalCrateType2Price: totalType2Price,
      totalCrateType1: totalCrateType1Sold,
      totalCrateType2: totalCrateType2Sold
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

  // const receivedFromBalance = watchPayment('received_amount_from_balance')

  const parsePercent = v => {
    if (!v || v === 'Select') return 0
    const n = Number(String(v).replace('%', ''))

    return Number.isFinite(n) ? n / 100 : 0
  }

  const vatRate = parsePercent(vatType)
  const vatAmount = +(totalDueAmount * vatRate).toFixed(2)

  // Update payable amount calculation
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

      handleSalesTotal(() => updated, customersData)

      return updated
    })

    setCommissionModal({ open: false, productId: null, value: 0 })
  }

  useEffect(() => {
    // Always calculate due amount: payableAmount - receiveAmount
    const currentReceive = Number(receiveAmount) || 0
    const due = Math.max(0, payableAmount - currentReceive)

    setPaymentValue('dueAmount', due)
  }, [receiveAmount, payableAmount, setPaymentValue])

  // --- Calculate visibility flags outside useMemo ---
  const showPieceQuantity = cartProducts.some(p => p.sell_by_piece)
  const showBoxQuantity = cartProducts.some(p => p.isBoxed)
  const showCrated = cartProducts.some(p => p.isCrated)
  const showKg = cartProducts.some(p => !p.isBoxed && !p.sell_by_piece)
  const showDiscountKg = cartProducts.some(p => !p.isBoxed && !p.sell_by_piece)
  const showDiscountAmount = cartProducts.some(p => p.isBoxed || p.sell_by_piece || p.is_discountable)

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
                      ? { ...item, selling_price: val === '' ? 0 : val }
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

          if (product.isBoxed) return null

          return (
            <input
              type='number'
              name='kg'
              onWheel={e => e.currentTarget.blur()}
              value={product.kg === 0 ? '' : (product.kg ?? '')}
              onChange={e => {
                const val = e.target.value
                setCartProducts(prev =>
                  prev.map(item => (item.cart_item_id === product.cart_item_id ? { ...item, kg: val } : item))
                )
              }}
              placeholder='0'
              className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      },

      {
        accessorKey: 'box_quantity',
        header: 'Box Quantity',
        cell: ({ row }) => {
          const product = row.original

          if (!product.isBoxed) return null

          return (
            <input
              type='number'
              name='box_quantity'
              min='0'
              onWheel={e => e.currentTarget.blur()}
              value={product.box_quantity === 0 ? '' : (product.box_quantity ?? '')}
              onChange={e => {
                const val = e.target.value
                setCartProducts(prev =>
                  prev.map(item =>
                    item.cart_item_id === product.cart_item_id ? { ...item, box_quantity: val } : item
                  )
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

          if (product.isBoxed || product.sell_by_piece) return null

          return (
            <input
              type='number'
              name='discount_kg'
              onWheel={e => e.currentTarget.blur()}
              value={product.discount_kg === 0 ? '' : (product.discount_kg ?? '')}
              onChange={e => {
                const val = e.target.value
                const parsed = val === '' ? 0 : val

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
        accessorKey: 'discount_amount',
        header: 'Discount (৳)',
        cell: ({ row }) => {
          const product = row.original

          if (!product.isBoxed && !product.sell_by_piece && !product.is_discountable) return null

          return (
            <input
              type='number'
              name='discount_amount'
              onWheel={e => e.currentTarget.blur()}
              value={product.discount_amount === 0 ? '' : (product.discount_amount ?? '')}
              onChange={e => {
                const val = e.target.value
                const parsed = val === '' ? 0 : val

                setCartProducts(prev =>
                  prev.map(item =>
                    item.cart_item_id === product.cart_item_id ? { ...item, discount_amount: parsed } : item
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
                const parsed = val === '' ? 0 : val

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
                const parsed = e.target.value === '' ? 0 : e.target.value

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
                const parsed = e.target.value === '' ? 0 : e.target.value

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
    // --- Piece Quantity Column ---
    const pieceQuantityColumn = {
      accessorKey: 'piece_quantity',
      header: 'Piece Quantity',
      cell: ({ row }) => {
        const product = row.original

        if (!product.sell_by_piece) return null

        return (
          <input
            type='number'
            name='piece_quantity'
            min='0'
            onWheel={e => e.currentTarget.blur()}
            value={product.piece_quantity === 0 ? '' : (product.piece_quantity ?? '')}
            onChange={e => {
              const val = e.target.value
              const parsed = val === '' ? 0 : val

              setCartProducts(prev =>
                prev.map(item =>
                  item.cart_item_id === product.cart_item_id ? { ...item, piece_quantity: parsed } : item
                )
              )
            }}
            placeholder='0'
            className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
          />
        )
      }
    }

    // --- Dynamic Column Visibility ---
    // Use flags passed from outside useMemo
    
    // Filter base columns based on product types
    const filteredBaseColumns = baseColumns.filter(col => {
      if (col.accessorKey === 'kg') return showKg
      if (col.accessorKey === 'box_quantity') return showBoxQuantity
      if (col.accessorKey === 'discount_kg') return showDiscountKg
      if (col.accessorKey === 'discount_amount') return showDiscountAmount
      
      return true
    })

    let finalColumns = [...filteredBaseColumns]
    

    // Insert Piece Quantity if needed
    if (showPieceQuantity) {
       // Find index to insert after 'selling_price' or 'kg'
       const insertIndex = finalColumns.findIndex(c => c.accessorKey === 'selling_price') + 1
       finalColumns.splice(insertIndex, 0, pieceQuantityColumn)
    }

    // Insert Crate Columns if needed
    if (showCrated) {
        const insertIndex = finalColumns.findIndex(c => c.accessorKey === 'selling_price') + 1
        finalColumns.splice(insertIndex, 0, ...crateColumns)
    }

    return finalColumns
  }, [showPieceQuantity, showBoxQuantity, showCrated, showKg, showDiscountKg, showDiscountAmount, showTooltip])

  const tableData = useMemo(() => cartProducts, [cartProducts])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  // submit payment
  const onSubmitPayment = async data => {
    setIsSubmitting(true)

    // Validate
    const missingLot = cartProducts.find(p => !p.lot_selected?.lot_name)

    if (missingLot) {
      toast.error(`Please select a lot for "${missingLot.product_name}"`)
      setIsSubmitting(false)

      return
    }

    // ========== VALIDATE CRATE AND BOX AVAILABILITY ==========
    for (const item of cartProducts) {

      // console.log('item', item)

      // Check if this is a crate-based product
      if (item.isCrated) {
        const selectedCrateType1 = item.crate_type_one || 0
        const selectedCrateType2 = item.crate_type_two || 0

        // Validate that at least one crate is provided
        if (selectedCrateType1 === 0 && selectedCrateType2 === 0) {
          toast.error(`Please provide crate quantity for crated product "${item.product_name}"`)
          setIsSubmitting(false)

          return
        }

        // Get available crates from the selected lot
        const availableCrateType1 = item.lot_selected?.remaining_crate_Type_1 || 0
        const availableCrateType2 = item.lot_selected?.remaining_crate_Type_2 || 0

        // Check if selected crates exceed available crates
        if (selectedCrateType1 > availableCrateType1) {
          toast.error(
            `Crate Type 1 exceeded for "${item.product_name}"! ` +
              `Selected: ${selectedCrateType1}, Available in lot: ${availableCrateType1}`
          )
          setIsSubmitting(false)

          return
        }

        if (selectedCrateType2 > availableCrateType2) {
          toast.error(
            `Crate Type 2 exceeded for "${item.product_name}"! ` +
              `Selected: ${selectedCrateType2}, Available in lot: ${availableCrateType2}`
          )
          setIsSubmitting(false)

          return
        }
      }

      // Check if this is a box-based product
      if (item.isBoxed) {
        const selectedBoxQuantity = item.box_quantity || 0

        // Get remaining boxes from the selected lot
        const remainingBoxes = item.lot_selected?.remaining_boxes || 0

        // Check if selected boxes exceed remaining boxes
        if (selectedBoxQuantity > remainingBoxes) {
          toast.error(
            `Box quantity exceeded for "${item.product_name}"! ` +
              `Selected: ${selectedBoxQuantity}, Available in lot: ${remainingBoxes}`
          )
          setIsSubmitting(false)

          return
        }
      }

      // Check if this is a piece-based product
      if (item.sell_by_piece) {
        const selectedPieceQuantity = item.piece_quantity || 0

        // Get remaining pieces from the selected lot
        const remainingPieces = item.lot_selected?.remaining_pieces || 0

        // Check if selected pieces exceed remaining pieces
        if (selectedPieceQuantity > remainingPieces) {
          toast.error(
            `Piece quantity exceeded for "${item.product_name}"! ` +
              `Selected: ${selectedPieceQuantity}, Available in lot: ${remainingPieces}`
          )
          setIsSubmitting(false)

          return
        }
      }

      // ========== VALIDATE DISCOUNT ==========
      const kg = item.kg || 0
      const totalDiscountKg = item.total_discount_kg || 0

      if (totalDiscountKg > kg) {
        toast.error(
          `Discount Kg exceeded for "${item.product_name}"! ` +
            `Total Discount: ${totalDiscountKg} kg, Total Weight: ${kg} kg`
        )
        setIsSubmitting(false)

        return
      }
    }

    // ========== Transform cart item to lot ==========

    const toLot = item => {
      const kg = item.kg || 0
      const boxQty = item.box_quantity || 0
      const pieceQty = item.piece_quantity || 0
      const discountKg = item.total_discount_kg || 0
      const discountAmount = item.discount_amount || 0
      const sellingPrice = item.selling_price || 0
      const unitCost = item.cost_price || 0
      const isBoxed = item.isBoxed || false
      const isPieced = item.isPieced || item.sell_by_piece || false
      const isCrated = item.isCrated || false

      let totalPrice = 0
      let discountedPrice = 0
      let finalDiscountAmount = 0

      if (isBoxed) {
        // For boxed products
        totalPrice = Number((boxQty * sellingPrice).toFixed(2))
        discountedPrice = Number((totalPrice - discountAmount).toFixed(2))
        finalDiscountAmount = discountAmount
      } else if (isPieced) {
        // For piece-based products
        totalPrice = Number((pieceQty * sellingPrice).toFixed(2))
        discountedPrice = Number((totalPrice - discountAmount).toFixed(2))
        finalDiscountAmount = discountAmount
      } else {
        // For kg-based products
        totalPrice = Number((kg * sellingPrice).toFixed(2))
        discountedPrice = Number(((kg - discountKg) * sellingPrice).toFixed(2))
        finalDiscountAmount = Number((discountKg * sellingPrice).toFixed(2))
      }

      // ========== LOT COMMISSION (from lot data) ==========
      const lotCommissionRate = item.lot_selected.commission_rate || 0
      const lotCommissionAmount = Number((discountedPrice * (lotCommissionRate / 100)).toFixed(2))

      // ========== CUSTOMER COMMISSION (from cart item - now moved to lot level) ==========
      const customerCommissionRate = item.commission_rate || 0
      const customerCommissionAmount = Number((discountedPrice * (customerCommissionRate / 100)).toFixed(2))

      // ========== LOT PROFIT CALCULATION ==========
      let lotProfit = 0

      if (item.isCommissionable) {
        lotProfit = customerCommissionAmount
      } else {
        if (isBoxed) {
          // For boxed products: discountedPrice - (box_qty * unit_cost)
          lotProfit = Number((discountedPrice - boxQty * unitCost).toFixed(2))
        } else if (isPieced) {
          // For piece-based products: discountedPrice - (piece_qty * unit_cost)
          lotProfit = Number((discountedPrice - pieceQty * unitCost).toFixed(2))
        } else {
          // For kg-based products: (kg - discountKg) * (sellingPrice - unitCost)
          lotProfit = Number(((kg - discountKg) * (sellingPrice - unitCost)).toFixed(2))
        }

        lotProfit = Math.max(0, lotProfit)
      }

      return {
        lotId: item.lot_selected.lot_id,
        kg: kg,
        box_quantity: isBoxed ? boxQty : 0,
        isBoxed: isBoxed,
        isPieced: isPieced,
        isCrated: isCrated,
        piece_quantity: isPieced ? pieceQty : 0,
        discount_Kg: isBoxed || isPieced ? 0 : discountKg,
        discount_amount: finalDiscountAmount,
        unit_price: sellingPrice,
        selling_price: discountedPrice,
        total_price: totalPrice,
        crate_type1: Number(item.crate_type_one) || 0,
        crate_type2: Number(item.crate_type_two) || 0,

        // ========== LOT COMMISSION ==========
        lot_commission_rate: lotCommissionRate,
        lot_commission_amount: lotCommissionAmount,

        // ========== CUSTOMER COMMISSION  ==========
        customer_commission_rate: customerCommissionRate,
        customer_commission_amount: customerCommissionAmount,

        // ========== LOT PROFIT ==========
        lot_profit: lotProfit
      }
    }

    // ==========  Group by product ==========
    const grouped = cartProducts.reduce((acc, item) => {
      if (!acc[item.product_id]) acc[item.product_id] = []
      acc[item.product_id].push(item)

      return acc
    }, {})

    // ==========  Build items array ==========
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
        product_name: items[0].productName || '',
        product_name_bn: items[0].productNameBn || '',
        selected_lots: selectedLots
      }
    })

    // ========== Calculate total commissions ==========
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

    // ========== Build final payload ==========
    const payload = {
      sale_date: date,
      customerId: selectedCustomer._id,
      customer_name: selectedCustomer?.basic_info?.name,
      customer_location: selectedCustomer?.contact_info?.location,

      total_custom_commission: total_custom_commission,
      total_lots_commission: total_lots_commission,
      total_profit: total_profit + total_lots_commission,
      items: items,
      payment_details: {
        // total_crate_type1: Number(totalCrateType1) || 0,
        // total_crate_type2: Number(totalCrateType2) || 0,
        total_crate_type1_price: Number(totalCrateType1Price) || 0,
        total_crate_type2_price: Number(totalCrateType2Price) || 0,
        payable_amount: Number(payableAmount) || 0,
        received_amount: Number(data.receiveAmount) || 0,

        // received_amount_from_balance: Number(data.received_amount_from_balance) || 0,
        due_amount: Number(data.dueAmount) || 0,
        payment_type: data.paymentType || 'cash',
        vat: Number(vatAmount) || 0,
        note: data.note || ''
      }
    }

    // console.log('Sales payload:', JSON.stringify(payload, null, 2))

    try {
      const result = await createSale(payload)

      if (result.success) {
        toast.success('Product sold successfully!')

        // console.log('Sale response:', result.data)

        setLastSaleData({
          ...payload,
          printTrigger: Date.now()
        })
      } else {
        toast.error(result.error || 'Failed to create sale')
      }

    } catch (error) {
      console.error('Sale submission error:', error)
      toast.error('An error occurred while creating the sale')
      setIsPrinting(false)
    } finally {
      setIsSubmitting(false)
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
    const currentSold = parseFloat(lot.sales?.totalKgSold || 0)

    // Validate: must enter a quantity
    if (sellQty <= 0) {
      toast.error('Please enter a valid quantity to sell.')

      return
    }

    // Update ONLY the specific cart row identified by cart_item_id
    setCartProducts(prev => {
      const updated = prev.map(item => {
        if (item.cart_item_id === lotModal.cartItemId) {
          const isBoxed = item.isBoxed || lot.isBoxed || false
          const isPieced = item.sell_by_piece || lot.isPieced || false

          return {
            ...item,
            isBoxed,
            isPieced,
            lot_selected: {
              lot_id: lot._id,
              lot_name: lot.lot_name,
              supplier_id: lot.supplierId?._id,
              supplier_name: lot.supplierId?.basic_info?.name,
              product_id: lot.productsId?._id,
              product_name: lot.productsId?.productName,
              unit_cost: lot.costs?.unitCost || 0,
              commission_rate: lot.costs?.commissionRate || 0,
              has_commission: lot.hasCommission,
              totalKgSold: currentSold + sellQty,
              sell_qty: sellQty,
              purchase_date: lot.purchase_date,
              status: lot.status,
              carat_type_1: lot.carat?.carat_Type_1 || 0,
              carat_type_2: lot.carat?.carat_Type_2 || 0,
              remaining_crate_Type_1: lot.carat?.remaining_crate_Type_1,
              remaining_crate_Type_2: lot.carat?.remaining_crate_Type_2,
              remaining_boxes: lot.remaining_boxes,
              remaining_pieces: lot.remaining_pieces
            },

            kg: isBoxed || isPieced ? 0 : sellQty,
            box_quantity: isBoxed ? sellQty : 0,
            piece_quantity: isPieced ? sellQty : 0,
            cost_price: lot.costs?.unitCost || 0,
            selling_price: item.selling_price || lot.costs?.unitCost || 0
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
    // setPaymentValue('received_amount_from_balance', 0)
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
              value={date}
              className='px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              onChange={e => setDate(e.target.value)}
            />

            <div className='flex-1 flex gap-2 items-center'>
              <Autocomplete
                fullWidth
                size='small'
                options={customerOptions}
                loading={loadingCustomers}
                getOptionLabel={option => option.basic_info?.name || ''}
                value={selectedCustomer}
                onChange={(event, newValue) => {
                  setSelectedCustomer(newValue || null)
                }}
                inputValue={customerSearchInput}
                onInputChange={(event, newInputValue) => {
                  setCustomerSearchInput(newInputValue)
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    placeholder='Select Customer'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingCustomers ? <CircularProgress color='inherit' size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props
                  return (
                    <li key={option._id} {...otherProps}>
                      <div className='flex flex-col'>
                        <span>{option.basic_info?.name}</span>
                      </div>
                    </li>
                  )
                }}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
              <IconButton 
                onClick={() => setAddCustomerOpen(true)}
                className='bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200'
                size='medium'
              >
                <FaPlus />
              </IconButton>
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
                    </select>
                  </div>

                  <div className='flex items-center'>
                    <label className='w-32 text-sm'>Receive Amount</label>
                    <input
                      type='number'
                      {...registerPayment('receiveAmount')}
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
                    <span className='font-medium'>৳ {totalSubtotal}</span>
                  </div>

                  {totalCrateType1 > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Crate Type 1 ({totalCrateType1} pcs)</span>
                      <span className='text-sm'>৳ {totalCrateType1Price.toFixed(2)}</span>
                    </div>
                  )}

                  {totalCrateType2 > 0 && (
                    <div className='flex items-center justify-between'>
                      <span className='text-sm'>Crate Type 2 ({totalCrateType2} pcs)</span>
                      <span className='text-sm'>৳ {totalCrateType2Price.toFixed(2)}</span>
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
                      <h2 className='text-2xl font-bold'>৳ {payableAmount}</h2>
                    </div>
                  </div>

                  <div className='flex justify-center sm:justify-end w-full sm:w-auto'>
                    <button
                      type='submit'
                      disabled={totalDueAmount < 1}
                      className={`bg-white text-base text-indigo-600 font-semibold px-6 py-2 rounded-lg transition-all duration-200 w-full sm:w-auto ${
                        totalDueAmount < 1 || (paymentType === 'balance' && paymentErrors.received_amount_from_balance)
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-100 cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? 'Processing...' : 'Sell'}
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

      <AddCustomerDrawer
        open={addCustomerOpen}
        handleClose={() => setAddCustomerOpen(false)}
        refreshData={refreshCustomers}
      />

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
                    <p className='text-sm text-gray-600'>
                      Already Sold: 
                      {lotModal.selectedLot.sales?.totalBoxSold > 0 && ` ${lotModal.selectedLot.sales.totalBoxSold} boxes`}
                      {lotModal.selectedLot.sales?.totalPieceSold > 0 && ` ${lotModal.selectedLot.sales.totalPieceSold} pieces`}
                      {lotModal.selectedLot.sales?.totalKgSold > 0 && ` ${lotModal.selectedLot.sales.totalKgSold} kg`}
                      {!lotModal.selectedLot.sales?.totalBoxSold && !lotModal.selectedLot.sales?.totalPieceSold && !lotModal.selectedLot.sales?.totalKgSold && ' None'}
                    </p>
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
                        const val = e.target.value

                        setLotModal(prev => ({
                          ...prev,
                          selectedLot: { ...prev.selectedLot, sell_qty: val }
                        }))
                      }}
                      className='w-24 px-2 py-1 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-indigo-500 outline-none'
                    />
                    <span className='text-sm'>
                      {cartProducts.find(p => p.cart_item_id === lotModal.cartItemId)?.isBoxed ? 'boxes' : 'kg'}
                    </span>
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

      {/* Add Invoice Print Handler */}
      {lastSaleData && (
        <InvoicePrintHandler
          saleData={lastSaleData}
          customerData={selectedCustomer}
          cartProducts={cartProducts}
          triggerPrint={true}
          onPrintComplete={() => {
            // console.log('Invoice print completed')

            // Clear cart and reset after successful print
            setCartProducts([])
            setSelectedCustomer({})
            setLastSaleData(null)
            showSuccess('Sale completed and invoice printed!')
          }}
          onPrintError={error => {
            console.error('Print failed:', error)
            showError('Print failed, but sale was successful. You can print from sales history.')

            setCartProducts([])
            setSelectedCustomer({})
            setLastSaleData(null)
          }}
        />
      )}
    </div>
  )
}
