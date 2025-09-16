'use client'

import { useEffect, useState, useMemo } from 'react'

import { useForm } from 'react-hook-form'

import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa'

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

import PurchaseHeader from './PurchaseHeader'
import SearchProduct from './SearchProduct'
import { handleDistributionExpense } from '@/utils/handleDistribution'
import CategoryModal from '@/components/layout/shared/CategoryModal'
import BrandModal from '@/components/layout/shared/BrandModal'
import { categories, brands } from '@/data/productsCategory/productsCategory'
import { suppliers } from '@/data/supplierData/supplierData'
import { filteredProductsData } from '@/utils/filteredProductsData'
import { removeCartItem } from '@/utils/removeCartItem'
import { handleBoxCount } from '@/utils/handleBoxCount'
import { calculateTotalDue } from '@/utils/calculateTotalDue'
import { usePaymentCalculation } from '@/utils/usePaymentCalculation'
import { showAlert } from '@/utils/showAlert'
import ShowProductList from '@/components/layout/shared/ShowProductList'

export default function AddPurchase({ productsData = [] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [brandModalOpen, setBrandModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [paymentType, setPaymentType] = useState('Cash')
  const [vatType, setVatType] = useState('Select')
  const [discountType, setDiscountType] = useState('Flat (₹)')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSupplier, setSelectedSupplier] = useState({})
  const [cartProducts, setCartProducts] = useState([])
  const { register, handleSubmit } = useForm()
  const [selectedCategory, setSelectedCategory] = useState([])
  const [selectedBrand, setSelectedBrand] = useState([])

  const filteredProducts = filteredProductsData(productsData, searchTerm, selectedCategory)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const filteredBrands = brands.filter(brand => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

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
    if (!selectedSupplier?.id) {
      showAlert('Please select a supplier first.', 'warning')

      return
    }

    const isAlreadyAdded = cartProducts.some(
      item => item.product_id === product.id && item.supplier_id === selectedSupplier.id
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
        supplier_id: selectedSupplier.id,
        supplier_name: selectedSupplier.name,
        box: 1,
        transportation: 0,
        moshjid: 0,
        van_vara: 0,
        total: 0,
        cost: product.price,
        discount: 0,
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
    handleDistributionExpense(data, cartProducts, setCartProducts)
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

  // Auto calculate due and change amounts
  usePaymentCalculation(receiveAmount, totalDueAmount, setPaymentValue)

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
        header: 'Product'
      },
      {
        accessorKey: 'box',
        header: 'Box',
        cell: ({ row }) => {
          const product = row.original

          return (
            <div className='flex justify-between gap-2 items-center'>
              <button
                onClick={() => handleBoxCount(setCartProducts, product.product_id, product.supplier_id, false)}
                className='text-red-500 bg-transparent border-none outline-none h-full w-full flex items-center justify-center'
              >
                <FaMinus />
              </button>
              <span>{product.box}</span>
              <button
                onClick={() => handleBoxCount(setCartProducts, product.product_id, product.supplier_id, true)}
                className='text-green-500 bg-transparent border-none outline-none w-full h-full flex items-center justify-center'
              >
                <FaPlus />
              </button>
            </div>
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
    // console.log('Payment form data:', data)
  }

  return (
    <div className='min-h-[calc(100vh-54px] bg-gray-50 p-4'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
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

      <div className='flex gap-6'>
        {/* Left Side - Form */}
        <div className='w-4/5 bg-white rounded-lg p-6 flex flex-col'>
          {/* Order Details */}
          <div className='grid grid-cols-3 gap-4 mb-6'>
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
                value={selectedSupplier.id || ''}
                onChange={e => {
                  const supplier = suppliers.find(s => s.id === parseInt(e.target.value))

                  setSelectedSupplier(supplier || {})
                }}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none'
              >
                <option value=''>Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
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
          <div className='mb-6'>
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

          {/* Payment Details */}
          <form onSubmit={handleSubmitPayment(onSubmitPayment)} className='mt-auto'>
            <h1 className='mb-4'>Payment Details</h1>

            <div className='grid grid-cols-2 gap-8'>
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
                  <span className='font-medium'>৳ 0</span>
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
                    <span className='text-sm'>0.00</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
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
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Shipping Charge</span>
                  <span className='text-sm'>0</span>
                </div>
                <div className='flex items-center justify-between font-medium'>
                  <span className='text-sm'>Total Amount</span>
                  <span>৳ {totalDueAmount}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Rounding(+/-)</span>
                  <span className='text-sm'>৳ 0</span>
                </div>
                <div className='flex items-center justify-between font-bold text-lg'>
                  <span>Payable Amount</span>
                  <span>৳ {totalDueAmount}</span>
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
      <BrandModal
        open={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        searchValue={brandSearch}
        onSearchChange={e => setBrandSearch(e.target.value)}
        items={filteredBrands}
        setSelectedBrand={setSelectedBrand}
      />
    </div>
  )
}
