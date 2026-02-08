'use client'

import { useMemo, useState } from 'react'

import Link from 'next/link'

import { useForm } from 'react-hook-form'

import { FaEdit, FaTimes } from 'react-icons/fa'


import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { toast } from 'react-toastify'

import CategoryModal from '@/components/layout/shared/CategoryModal'
import { filteredProductsData } from '@/utils/filteredProductsData'
import { handleDistributionExpense } from '@/utils/handleDistribution'
import PurchaseHeader from './PurchaseHeader'
import SearchProduct from './SearchProduct'

import { createPurchase } from '@/actions/purchaseActions'
import ShowProductList from '@/components/layout/shared/ShowProductList'
import { showAlert } from '@/utils/showAlert'
import { showError } from '@/utils/toastUtils'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'

const handleCrateCount = (setCartProducts, productId, personId, type, value) => {
  console.log('📝 handleCrateCount:', { productId, personId, type, value })
  setCartProducts(prevCart =>
    prevCart.map(item => {
      if (item.product_id === productId && (item.supplier_id === personId || item.customer_id === personId)) {
        return {
          ...item,
          [`crate_type_${type}`]: value < 0 ? 0 : value
        }
      }

      return item
    })
  )
}

const handleBoxQuantity = (setCartProducts, productId, personId, value) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      if (item.product_id === productId && (item.supplier_id === personId || item.customer_id === personId)) {
        return {
          ...item,
          box_quantity: value < 0 ? 0 : value
        }
      }

      return item
    })
  )
}

const handlePieceQuantity = (setCartProducts, productId, personId, value) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      if (item.product_id === productId && (item.supplier_id === personId || item.customer_id === personId)) {
        return {
          ...item,
          piece_quantity: value < 0 ? 0 : value
        }
      }

      return item
    })
  )
}

const handleDiscountChange = (setCartProducts, productId, personId, value) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      if (item.product_id === productId && (item.supplier_id === personId || item.customer_id === personId)) {
        return {
          ...item,
          discount_amount: value < 0 ? 0 : value
        }
      }

      return item
    })
  )
}

export default function AddPurchase({ productsData = [], suppliersData = [], categoriesData = [] }) {
  // console.log('🎨 AddPurchase Rendered')

  // const skipNextEffect = useRef(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [brandModalOpen, setBrandModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [cartProducts, setCartProducts] = useState([])
  const { register, handleSubmit } = useForm()
  const [selectedCategory, setSelectedCategory] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [supplierOptions, setSupplierOptions] = useState(suppliersData || [])
  const [supplierSearchInput, setSupplierSearchInput] = useState('')
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)

  const [commissionModal, setCommissionModal] = useState({
    open: false,
    productId: null,
    supplierId: null,
    value: 0
  })

  const [hasExpenseChanges, setHasExpenseChanges] = useState(false)

  const filteredProducts = filteredProductsData(productsData, searchTerm, selectedCategory)

  const filteredCategories = (categoriesData || []).filter(category =>
    (category.name || '').toString().toLowerCase().includes(categorySearch.toLowerCase())
  )

  const handleExpenseChange = () => {
    setHasExpenseChanges(true)
  }

  // Function to remove item from cart
  const handleRemoveCartItem = (productId, supplierId) => {
    setCartProducts(prevCart =>
      prevCart.filter(item => !(item.product_id === productId && item.supplier_id === supplierId))
    )
  }

  // Function to remove category
  const handleRemoveCategory = categoryToRemove => {
    setSelectedCategory(prev => prev.filter(category => category !== categoryToRemove))
  }

  const handleCartProductClick = product => {
    if (!selectedSupplier?._id) {
      toast.warning('Please select a supplier first.', {
        position: 'top-center'
      })

      return
    }

    const isAlreadyAdded = cartProducts.some(
      item => item.product_id === product._id && item.supplier_id === selectedSupplier._id
    )

    if (isAlreadyAdded) {
      toast.warning('This product is already added to the cart.', {
        position: 'top-center'
      })

      return
    }

    const isPieceType = product.sell_by_piece || false
    const hasPieceTypeInCart = cartProducts.some(item => item.sell_by_piece)

    // --- Piece-Type Exclusivity Logic ---
    if (isPieceType) {
      // If clicking a piece-type product, clear the cart and add only this one
      setCartProducts([
        {
          ...product,
          product_id: product._id,
          product_name: product.productName,
          supplier_id: selectedSupplier._id,
          supplier_sl: selectedSupplier.basic_info?.sl || '',
          supplier_name: selectedSupplier.basic_info?.name || '',
          crate_type_one: 0,
          crate_type_two: 0,
          cratePrice: 0,
          cost: product.basePrice ?? 0,
          commission_rate: product.commissionRate ?? 0,
          transportation: 0,
          moshjid: 0,
          van_vara: 0,
          trading_post: 0,
          labour: 0,
          expenses: 0,
          other_expenses: 0,
          box_quantity: 0,
          isBoxed: product.isBoxed || false,
          isCrated: product.isCrated || false,
          allowCommission: product.allowCommission || false,
          sell_by_piece: true,
          piece_quantity: 0,
          is_discountable: product.is_discountable || false,
          discount_amount: 0
        }
      ])

      return
    }

    // If clicking a non-piece product but cart has a piece product, block it
    if (hasPieceTypeInCart) {
      toast.warning('Piece-type products must be purchased separately. Please remove it first.', {
        position: 'top-center'
      })

      return
    }

    setCartProducts(prevCart => {
      const newCartItem = {
        ...product,
        product_id: product._id,
        product_name: product.productName,
        supplier_id: selectedSupplier._id,
        supplier_sl: selectedSupplier.basic_info?.sl || '',
        supplier_name: selectedSupplier.basic_info?.name || '',
        crate_type_one: 0,
        crate_type_two: 0,
        cratePrice: 0,
        cost: product.basePrice ?? 0,
        commission_rate: product.commissionRate ?? 0,
        transportation: 0,
        moshjid: 0,
        van_vara: 0,
        trading_post: 0,
        labour: 0,
        expenses: 0,
        other_expenses: 0,
        box_quantity: 0,
        isBoxed: product.isBoxed || false,
        isCrated: product.isCrated || false,
        allowCommission: product.allowCommission || false,
        sell_by_piece: product.sell_by_piece || false,
        piece_quantity: 0,
        is_discountable: product.is_discountable || false,
        discount_amount: 0
      }

      return [...prevCart, newCartItem]
    })
  }

  // Function to handle distribute form submission
  const handleDistributeSubmit = data => {
    // skipNextEffect.current = true

    handleDistributionExpense(data, cartProducts, setCartProducts, suppliersData)
    setHasExpenseChanges(false)
  }



  /*
  useEffect(() => {
    if (cartProducts.length > 0) {
      handleDistributionExpense({}, cartProducts, setCartProducts, suppliersData)
    }
  }, [cartProducts, setCartProducts, suppliersData])
  */

  // Open the commission editor for a row
  const openCommissionEditor = item => {
    setCommissionModal({
      open: true,
      productId: item.product_id,
      supplierId: item.supplier_id,
      value: Number(item.commission_rate) || 0
    })
  }

  // Save only the commission value
  const updateCommissionForProduct = () => {
    const { productId, supplierId, value } = commissionModal

    setCartProducts(prev =>
      prev.map(item =>
        item.product_id === productId && item.supplier_id === supplierId
          ? { ...item, commission_rate: Number(value) || 0 }
          : item
      )
    )

    setCommissionModal({ open: false, productId: null, supplierId: null, value: 0 })
  }

  // Calculate which columns should be visible based on cart content
  const showPieceQuantity = cartProducts.some(p => p.sell_by_piece)
  const showBoxQuantity = cartProducts.some(p => p.isBoxed)
  const showCrated = cartProducts.some(p => p.isCrated)
  const showDiscount = cartProducts.some(p => p.is_discountable)
  const showCommission = cartProducts.some(p => p.allowCommission)

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          accessorKey: 'supplier_sl',
          header: 'SL'
        },
        {
          accessorKey: 'supplier_name',
          header: 'Supplier'
        },
        {
          accessorKey: 'product_name',
          header: 'Product',
          cell: ({ row }) => {
            const product = row.original

            return (
              <Link href={`/apps/products/edit/${product.product_id}`} className='hover:text-blue-600 hover:underline'>
                {product.product_name}
              </Link>
            )
          }
        }
      ]

      if (showPieceQuantity) {
        baseColumns.push({
          accessorKey: 'piece_quantity',
          header: 'Piece Quantity',
          cell: ({ row }) => {
            const product = row.original

            if (!product.sell_by_piece) {
              return null
            }

            return (
              <input
                type='number'
                min='0'
                value={product.piece_quantity === 0 ? '' : (product.piece_quantity ?? '')}
                placeholder='0'
                onChange={e => {
                  const value = parseInt(e.target.value) || 0

                  handlePieceQuantity(setCartProducts, product.product_id, product.supplier_id, value)
                  handleExpenseChange()
                }}
                className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center'
              />
            )
          }
        })
      }

      if (showBoxQuantity) {
        baseColumns.push({
          accessorKey: 'box_quantity',
          header: 'Box Quantity',
          cell: ({ row }) => {
            const product = row.original

            if (!product.isBoxed) {
              return null
            }

            return (
              <input
                type='number'
                min='0'
                value={product.box_quantity === 0 ? '' : (product.box_quantity ?? '')}
                placeholder='0'
                onChange={e => {
                  const value = parseInt(e.target.value) || 0

                  handleBoxQuantity(setCartProducts, product.product_id, product.supplier_id, value)
                  handleExpenseChange()
                }}
                className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center'
              />
            )
          }
        })
      }

      if (showCrated) {
        baseColumns.push(
          {
            accessorKey: 'crate_type_one',
            header: 'Crate Type 1',
            cell: ({ row }) => {
              const product = row.original

              if (!product.isCrated) {
                return null
              }

              return (
                <input
                  type='number'
                  min='0'
                  value={product.crate_type_one === 0 ? '' : (product.crate_type_one ?? '')}
                  placeholder='0'
                  onChange={e => {
                    const value = parseInt(e.target.value) || 0

                    handleCrateCount(setCartProducts, product.product_id, product.supplier_id, 'one', value)
                    handleExpenseChange()
                  }}
                  className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center'
                />
              )
            }
          },
          {
            accessorKey: 'crate_type_two',
            header: 'Crate Type 2',
            cell: ({ row }) => {
              const product = row.original

              if (!product.isCrated) {
                return null
              }

              return (
                <input
                  type='number'
                  min='0'
                  value={product.crate_type_two === 0 ? '' : (product.crate_type_two ?? '')}
                  placeholder='0'
                  onChange={e => {
                    const value = parseInt(e.target.value) || 0

                    handleCrateCount(setCartProducts, product.product_id, product.supplier_id, 'two', value)
                    handleExpenseChange()
                  }}
                  className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center'
                />
              )
            }
          }
        )
      }

      baseColumns.push({
        accessorKey: 'cost',
        header: 'Cost(unit)',
        cell: ({ row }) => {
          const product = row.original

          return (
            <input
              type='number'
              onWheel={e => e.currentTarget.blur()}
              value={product.cost === 0 ? '' : (product.cost ?? '')}
              onChange={e => {
                const rawValue = e.target.value

                setCartProducts(prev =>
                  prev.map(item =>
                    item.product_id === product.product_id && item.supplier_id === product.supplier_id
                      ? { ...item, cost: rawValue === '' ? 0 : parseFloat(rawValue) }
                      : item
                  )
                )
              }}
              placeholder='0'
              className='w-24 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center whitespace-nowrap'
            />
          )
        }
      })

      if (showDiscount) {
        baseColumns.push({
          accessorKey: 'discount_amount',
          header: 'Discount',
          cell: ({ row }) => {
            const product = row.original

            if (!product.is_discountable) {
              return null
            }

            return (
              <input
                type='number'
                min='0'
                value={product.discount_amount === 0 ? '' : (product.discount_amount ?? '')}
                placeholder='0'
                onChange={e => {
                  const value = parseFloat(e.target.value) || 0

                  handleDiscountChange(setCartProducts, product.product_id, product.supplier_id, value)
                  handleExpenseChange()
                }}
                className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center'
              />
            )
          }
        })
      }

      baseColumns.push(
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
          accessorKey: 'trading_post',
          header: 'Trading Post'
        },
        {
          accessorKey: 'labour',
          header: 'Labour'
        }
      )

      if (showCommission) {
        baseColumns.push({
          accessorKey: 'commission_rate',
          header: 'Commission',
          cell: ({ row }) => {
            const product = row.original

            if (!product.allowCommission) {
              return null
            }

            const pct = Number(product?.commission_rate) || 0

            return (
              <div className='flex items-center gap-2'>
                <span>{pct > 0 ? `${pct}%` : 'N/A'}</span>
                {pct > 0 && (
                  <button
                    type='button'
                    onClick={() => openCommissionEditor(product)}
                    className='text-blue-600 hover:text-blue-800'
                    title='Edit commiss ion'
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
            )
          }
        })
      }

      baseColumns.push({
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          const product = row.original

          return (
            <button
              onClick={() => handleRemoveCartItem(product.product_id, product.supplier_id)}
              className='text-red-500 bg-transparent border-none outline-none w-full h-full'
            >
              <FaTimes />
            </button>
          )
        }
      })

      return baseColumns
    },
    [showPieceQuantity, showBoxQuantity, showCrated, showDiscount, showCommission]
  )

  const tableData = useMemo(() => cartProducts, [cartProducts])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const handleSubmitPurchaseOrder = async () => {
    // Validation: Check for zero or negative quantities based on product type
    for (const item of cartProducts) {
      // Check for crated products
      if (item.isCrated) {
        const crateType1 = Number(item.crate_type_one) || 0
        const crateType2 = Number(item.crate_type_two) || 0
        
        if (crateType1 <= 0 && crateType2 <= 0) {
          showError(`Product "${item.product_name}" must have at least one crate (Type 1 or Type 2) with a value greater than 0`, 'error')
          return
        }
      }
      
      // Check for boxed products
      if (item.isBoxed) {
        const boxQuantity = Number(item.box_quantity) || 0
        
        if (boxQuantity <= 0) {
          showError(`Product "${item.product_name}" must have box quantity greater than 0`, 'error')
          return
        }
      }
      
      // Check for piece products
      if (item.sell_by_piece) {
        const pieceQuantity = Number(item.piece_quantity) || 0
        
        if (pieceQuantity <= 0) {
          showAlert(`Product "${item.product_name}" must have piece quantity greater than 0`, 'error')
          return
        }
      }
      
      // Check unit cost is not zero or negative
      const cost = Number(item.cost) || 0
      if (cost <= 0) {
        showAlert(`Product "${item.product_name}" must have a unit cost greater than 0`, 'error')
        return
      }
    }

    setIsSubmitting(true)

    //  generate lot_name for each cart item
    const updatedCartProducts = cartProducts.map(item => {
      const supplierName = item.supplier_name?.trim() || ''
      const supplierParts = supplierName.split(' ').filter(Boolean)
      const firstLetter = supplierParts[0]?.[0]?.toUpperCase() || ''
      const lastLetter = supplierParts.length > 1 ? supplierParts[supplierParts.length - 1][0]?.toUpperCase() : ''
      const initials = `${firstLetter}${lastLetter}`

      const formattedDate = date.split('-').reverse().join('').slice(0, 6)

      // Get current time in HHMM format
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const formattedTime = `${hours}${minutes}`

      const cleanProductName = item.product_name?.replace(/\s+/g, '_').toUpperCase() || 'ITEM'

      // const totalCrates = (item.crate_type_one || 0) + (item.crate_type_two || 0)
      let totalUnits = 0

      if (item.sell_by_piece) {
        totalUnits = item.piece_quantity || 0
      } else if (item.isBoxed) {
        totalUnits = item.box_quantity || 0
      } else {
        totalUnits = (item.crate_type_one || 0) + (item.crate_type_two || 0)
      }

      const lot_name = `${initials}-${formattedDate}-${formattedTime}-${cleanProductName}-${totalUnits}`

      return { ...item, lot_name }
    })

    // group lots by supplier _id
    const suppliersMap = updatedCartProducts.reduce((acc, item) => {
      const supplierKey = item.supplier_id ?? 'unknown'

      if (!acc[supplierKey]) {
        acc[supplierKey] = {
          supplier: supplierKey,
          lots: []
        }  
      }

      // Build the lot object
      acc[supplierKey].lots.push({
        productId: item.product_id,
        lot_name: item.lot_name,
        unit_Cost: item.cost ?? 0,
        commission_rate: item.commission_rate ?? 0,
        isCrated: item.isCrated || false,
        isBoxed: item.isBoxed || false,
        isPieced: item.sell_by_piece || false,
        carat: {
          carat_Type_1: item.crate_type_one || 0,
          carat_Type_2: item.crate_type_two || 0
        },
        box_quantity: item.box_quantity || 0,
        piece_quantity: item.piece_quantity || 0,
        expenses: {
          labour: item.labour || 0,
          transportation: item.transportation || 0,
          van_vara: item.van_vara || 0,
          moshjid: item.moshjid || 0,
          trading_post: item.trading_post || 0,
          other_expenses: item.other_expenses || 0
        }
      })

      return acc
    }, {})

    //   convert suppliersMap to items array
    const items = Object.values(suppliersMap)

    //   calculate total_expenses across ALL lots
    const totalExpenses = updatedCartProducts.reduce(
      (acc, it) => {
        return {
          labour: Number((acc.labour + (it.labour || 0)).toFixed(2)),
          transportation: Number((acc.transportation + (it.transportation || 0)).toFixed(2)),
          van_vara: Number((acc.van_vara + (it.van_vara || 0)).toFixed(2)),
          moshjid: Number((acc.moshjid + (it.moshjid || 0)).toFixed(2)),
          trading_post: Number((acc.trading_post + (it.trading_post || 0)).toFixed(2)),
          other_expenses: Number((acc.other_expenses + (it.other_expenses || 0)).toFixed(2))
        }
      },
      { labour: 0, transportation: 0, van_vara: 0, moshjid: 0, trading_post: 0, other_expenses: 0 }
    )

    //  build final payload exactly in the requested shape
    const payload = {
      purchase_date: new Date(date).toISOString(),
      status: 'on the way',
      is_lots_created: false,
      items,
      total_expenses: totalExpenses
    }

    // console.log('Purchase payload:', payload)

    try {
      //  submit via server action createPurchase
      const res = await createPurchase(payload)

      if (res?.success) {
        showAlert('Purchased products successfully added to the stock list', 'success')
        setCartProducts([])
      } else {
        showAlert(res?.error || 'Failed to create purchase', 'error')
      }

      // console.log('Purchase payload:', payload)
    } catch (err) {
      console.error('handleSubmitPurchaseOrder error:', err)
      showAlert('Failed to create purchase', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-[calc(100vh-54px] bg-gray-50 p-4 ml-0 '>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex flex-col lg:flex-row items-center justify-between'>
          <PurchaseHeader />

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
        <div className='w-full lg:w-8/12 xl:w-8/12 bg-white rounded-lg p-6 flex flex-col'>
          {/* Order Details */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
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
            <div className='flex-1'>
              <Autocomplete
                fullWidth
                size='small'
                options={supplierOptions}
                loading={loadingSuppliers}
                getOptionLabel={option => option.basic_info?.name || ''}
                value={selectedSupplier}
                onChange={(event, newValue) => {
                  setSelectedSupplier(newValue || null)
                }}
                inputValue={supplierSearchInput}
                onInputChange={(event, newInputValue) => {
                  setSupplierSearchInput(newInputValue)
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    placeholder='Select Supplier'
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingSuppliers ? <CircularProgress color='inherit' size={20} /> : null}
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
            </div>

              {/* {selectedSupplier.basic_info?.avatar && (
                <img
                  src={selectedSupplier.basic_info.avatar}
                  alt={selectedSupplier.basic_info.name}
                  className='w-10 h-10 rounded-full border ml-2'
                />
              )} */}
          </div>

          {/* Items Table */}
          <div className='mb-6 overflow-x-auto'>
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
                      <td key={cell.id} className='border border-gray-200 px-3 py-2 whitespace-nowrap'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expense Distribution< */}
          {cartProducts.length > 0 && (
            <form
              className='space-y-4 mb-6'
              onSubmit={handleSubmit(handleDistributeSubmit)}
              onChange={handleExpenseChange}
            >
              <h1>Expense Distribution</h1>

              {/* Transportation */}
              <div className='flex gap-5'>
                <div className='flex items-center flex-1'>
                  <label className='w-32 text-sm'>Transportation</label>
                  <input
                    type='number'
                    defaultValue='0'
                    {...register('transportationAmount')}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded'
                  />
                </div>
                <div className='w-1/4'>
                  <select
                    {...register('transportationType')}
                    className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                  >
                    <option value='divided'>Divided</option>
                    <option value='each'>Each</option>
                  </select>
                </div>
              </div>

              {/* Moshjid */}
              <div className='flex gap-5'>
                <div className='flex items-center flex-1'>
                  <label className='w-32 text-sm'>Moshjid</label>
                  <input
                    type='number'
                    defaultValue='0'
                    {...register('moshjidAmount')}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded'
                  />
                </div>
                <div className='w-1/4'>
                  <select
                    {...register('moshjidType')}
                    className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                  >
                    <option value='divided'>Divided</option>
                    <option value='each'>Each</option>
                  </select>
                </div>
              </div>

              {/* Van Vara */}
              <div className='flex gap-5'>
                <div className='flex items-center flex-1'>
                  <label className='w-32 text-sm'>Van Vara</label>
                  <input
                    type='number'
                    defaultValue='0'
                    {...register('vanVaraAmount')}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded'
                  />
                </div>
                <div className='w-1/4'>
                  <select
                    {...register('vanVaraType')}
                    className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                  >
                    <option value='divided'>Divided</option>
                    <option value='each'>Each</option>
                  </select>
                </div>
              </div>

              {/* Trading Post */}
              <div className='flex gap-5'>
                <div className='flex items-center flex-1'>
                  <label className='w-32 text-sm'>Trading Post</label>
                  <input
                    type='number'
                    defaultValue='0'
                    {...register('tradingPostAmount')}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded'
                  />
                </div>
                <div className='w-1/4'>
                  <select
                    {...register('tradingPostType')}
                    className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                  >
                    <option value='divided'>Divided</option>
                    <option value='each'>Each</option>
                  </select>
                </div>
              </div>

              {/* Labour */}
              <div className='flex gap-5'>
                <div className='flex items-center flex-1'>
                  <label className='w-32 text-sm'>Labour</label>
                  <input
                    type='number'
                    defaultValue='0'
                    {...register('labourAmount')}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded'
                  />
                </div>
                <div className='w-1/4'>
                  <select
                    {...register('labourType')}
                    className='flex-1 px-3 py-2 border border-gray-300 focus:outline-none rounded w-full'
                  >
                    <option value='divided'>Divided</option>
                    <option value='each'>Each</option>
                  </select>
                </div>
              </div>

              <button
                type='submit'
                className='w-52 py-3 bg-[#7367f0] text-white rounded-lg hover:bg-[#4e43c5] font-medium disabled:opacity-55 disabled:cursor-not-allowed'
                disabled={!hasExpenseChanges || cartProducts.length === 0}
              >
                Distribute Expenses
              </button>
            </form>
          )}

          {/* Purchase Summary Section */}
          {cartProducts.length > 0 && (
            <div className=''>
              <div className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10'>
                <div className='flex flex-col sm:flex-row sm:gap-10 text-center sm:text-left w-full justify-between'>
                  <div>
                    <p className='text-base opacity-80'>Total Products</p>
                    <h2 className='text-2xl font-bold'>{cartProducts.length}</h2>
                  </div>
                  <div>
                    <p className='text-base opacity-80'>Total Suppliers</p>
                    <h2 className='text-2xl font-bold'>{[...new Set(cartProducts.map(p => p.supplier_id))].length}</h2>
                  </div>
                  <div>
                    {/* <p className='text-base opacity-80'>Total Amount</p>
                    <h2 className='text-2xl font-bold'>৳ {totalDueAmount}</h2> */}
                  </div>
                </div>

                <div className='flex justify-center sm:justify-end w-full sm:w-auto'>
                  <button
                    type='button'
                    onClick={handleSubmitPurchaseOrder}
                    className='bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 w-full sm:w-auto cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
                    disabled={isSubmitting || hasExpenseChanges || cartProducts.length === 0}
                  >
                    {isSubmitting ? 'Submitting...' : 'Purchase'}
                  </button>
                </div>
              </div>
            </div>
          )}
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
                onClick={() => setCommissionModal({ open: false, productId: null, supplierId: null, value: 0 })}
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
