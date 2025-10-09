'use client'

import { useEffect, useState, useMemo } from 'react'

import Link from 'next/link'

import { useForm } from 'react-hook-form'

import { FaTimes, FaPlus, FaMinus, FaEdit } from 'react-icons/fa'

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

import PurchaseHeader from './PurchaseHeader'
import SearchProduct from './SearchProduct'
import { handleDistributionExpense } from '@/utils/handleDistribution'
import CategoryModal from '@/components/layout/shared/CategoryModal'
import { categories } from '@/data/productsCategory/productsCategory'
import { filteredProductsData } from '@/utils/filteredProductsData'
import { handleCrateCount } from '@/utils/handleCrateCount'
import { calculateTotalDue } from '@/utils/calculateTotalDue'
import { showAlert } from '@/utils/showAlert'
import ShowProductList from '@/components/layout/shared/ShowProductList'

export default function AddPurchase({ productsData = [], suppliersData = [] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [brandModalOpen, setBrandModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSupplier, setSelectedSupplier] = useState({})
  const [cartProducts, setCartProducts] = useState([])
  const { register, handleSubmit } = useForm()
  const [selectedCategory, setSelectedCategory] = useState([])

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
    if (!selectedSupplier?.sl) {
      showAlert('Please select a supplier first.', 'warning')

      return
    }

    const isAlreadyAdded = cartProducts.some(
      item => item.product_id === product.id && item.supplier_id === selectedSupplier.sl
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
        supplier_id: selectedSupplier.sl,
        supplier_name: selectedSupplier.name,
        crate: {
          type_one: 0,
          type_two: 0
        },
        cratePrice: 0,
        transportation: 0,
        moshjid: 0,
        van_vara: 0,
        total: 0,
        cost: product.price,
        commission_rate: product?.commission_rate || 0,
        trading_post: 0,
        labour: 0,
        expenses: 0,
        purchase_date: date,
        expiry_date: ''
      }

      return [...prevCart, newCartItem]
    })
  }

  // Function to handle distribute form submission
  const handleDistributeSubmit = data => {
    handleDistributionExpense(data, cartProducts, setCartProducts, suppliersData)
  }

  // calculate total due amount
  const totalDueAmount = calculateTotalDue(cartProducts)

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

  // Auto calculate due and change amounts
  // usePaymentCalculation(receiveAmount, totalDueAmount, setPaymentValue)

  const columns = useMemo(
    () => [
      {
        accessorKey: 'supplier_id',
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
            <Link href={`/apps/products/edit/p001`} className='hover:text-blue-600 hover:underline'>
              {product.product_name}
            </Link>
          )
        }
      },

      {
        accessorKey: 'crate_type_one',
        header: 'Crate Type 1',
        cell: ({ row }) => {
          const product = row.original

          return (
            <input
              type='number'
              min='0'
              value={product.crate?.type_one ?? 0}
              onChange={e => {
                const value = parseInt(e.target.value) || 0

                handleCrateCount(setCartProducts, product.product_id, product.supplier_id, 'type_one', value)
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

          return (
            <input
              type='number'
              min='0'
              value={product.crate?.type_two ?? 0}
              onChange={e => {
                const value = parseInt(e.target.value) || 0

                handleCrateCount(setCartProducts, product.product_id, product.supplier_id, 'type_two', value)
              }}
              className='w-20 px-2 py-1 border border-gray-300 rounded text-sm outline-none text-center'
            />
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
                  title='Edit commiss ion'
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

          return (
            <span title={`Commission: ${product.commission ?? 0}`}>{(parseFloat(product.total) || 0).toFixed(2)}</span>
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
              onClick={() => handleRemoveCartItem(product.product_id, product.supplier_id)}
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

  const onSubmitPayment = data => {
    // Group by supplier with only IDs + totals
    const suppliersMap = cartProducts.reduce((acc, item) => {
      const key = item.supplier_id ?? 'unknown'

      if (!acc[key]) {
        acc[key] = {
          supplier_id: item.supplier_id,
          items: [],
          sub_total: 0,
          commission_total: 0
        }
      }

      acc[key].items.push(item)

      acc[key].sub_total += Number(item.total) || 0
      acc[key].commission_total += Number(item.commission) || 0

      return acc
    }, {})

    const suppliers = Object.values(suppliersMap)

    // Grand totals
    const grandSubTotal = suppliers.reduce((s, sup) => s + sup.sub_total, 0)

    const payload = {
      summary: {
        date,
        sub_total: grandSubTotal
      },
      suppliers
    }

    console.log('Purchase payload (multi-supplier):', payload)
    showAlert('Purchased prouducts successfully added to the stock list', 'success')
    setCartProducts([])
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
        <div className='w-4/5 bg-white rounded-lg p-6 flex flex-col'>
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
            <div className='flex'>
              <select
                value={selectedSupplier.sl || ''}
                onChange={e => {
                  const supplier = suppliersData.find(s => s.sl === parseInt(e.target.value))

                  setSelectedSupplier(supplier || {})
                }}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none'
              >
                <option value=''>Select Supplier</option>
                {suppliersData.map(supplier => (
                  <option key={supplier.sl} value={supplier.sl}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              <button className='px-3 py-2 bg-[#7367f0] text-white rounded-r'>
                <span className='text-sm'>+</span>
              </button>
            </div>
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
            <form className='space-y-4 mb-6' onSubmit={handleSubmit(handleDistributeSubmit)}>
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
                className='w-52 py-3 bg-[#7367f0] text-white rounded-lg hover:bg-[#4e43c5] font-medium'
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
                    <p className='text-base opacity-80'>Total Amount</p>
                    <h2 className='text-2xl font-bold'>৳ {totalDueAmount}</h2>
                  </div>
                </div>

                <div className='flex justify-center sm:justify-end w-full sm:w-auto'>
                  <button
                    type='button'
                    onClick={onSubmitPayment}
                    className='bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 w-full sm:w-auto cursor-pointer'
                  >
                    Purchase
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
