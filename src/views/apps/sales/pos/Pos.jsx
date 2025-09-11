'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa'

import { Modal, Box, TextField, IconButton, Fade, Slide } from '@mui/material'

import { Search, Close } from '@mui/icons-material'

import PosHeader from './PosHeader'
import SearchProduct from './SearchProduct'

import { handleSalesDistributionExpense } from '@/utils/handleSalesDistribution'

// Dummy data
const products = [
  {
    id: 1,
    name: 'Mango',
    price: 40,
    image: 'https://i.postimg.cc/2yhsJDLj/Mangoes.jpg',
    category: 'Fruits',
    brand: 'Fresh'
  },
  {
    id: 2,
    name: 'T-shirt',
    price: 30,
    image: 'https://i.postimg.cc/6qMdKHgs/image-1.png',
    category: 'Clothing',
    brand: 'Generic'
  },
  {
    id: 3,
    name: 'Watch',
    price: 120,
    image: 'https://i.postimg.cc/6qMdKHgs/image-1.png',
    category: 'Electronics',
    brand: 'Samsung'
  },
  {
    id: 4,
    name: 'Ladies Bag',
    price: 30,
    image: 'https://i.postimg.cc/6qMdKHgs/image-1.png',
    category: 'Accessories',
    brand: 'Fashion'
  },
  {
    id: 5,
    name: 'Banana',
    price: 233.2,
    image: 'https://i.postimg.cc/6qMdKHgs/image-1.png',
    category: 'Food',
    brand: 'Fresh'
  },
  {
    id: 6,
    name: 'Shoe',
    price: 100,
    image: 'https://i.postimg.cc/6qMdKHgs/image-1.png',
    category: 'Footwear',
    brand: 'Leather Co'
  },
  {
    id: 7,
    name: 'Laptop',
    price: 300,
    image: 'https://i.postimg.cc/6qMdKHgs/image-1.png',
    category: 'Electronics',
    brand: 'Apple'
  },
  {
    id: 8,
    name: 'iPhone',
    price: 1000,
    image: 'https://i.postimg.cc/6qMdKHgs/image-1.png',
    category: 'Electronics',
    brand: 'Apple'
  }
]

const categories = [
  { id: 1, name: 'Footwear', image: 'https://i.postimg.cc/Zq9dp3Hr/078a6ff06185c0b984bce2877e9d2d691fbf6d5c.png' },
  { id: 2, name: 'Clothing', image: 'https://i.postimg.cc/Zq9dp3Hr/078a6ff06185c0b984bce2877e9d2d691fbf6d5c.png' },
  { id: 3, name: 'Electronics', image: 'https://i.postimg.cc/Zq9dp3Hr/078a6ff06185c0b984bce2877e9d2d691fbf6d5c.png' },
  { id: 4, name: 'Accessories', image: 'https://i.postimg.cc/Zq9dp3Hr/078a6ff06185c0b984bce2877e9d2d691fbf6d5c.png' },
  { id: 5, name: 'Food', image: 'https://i.postimg.cc/Zq9dp3Hr/078a6ff06185c0b984bce2877e9d2d691fbf6d5c.png' }
]

const brands = [
  { id: 1, name: 'Nike', image: 'https://i.postimg.cc/764hqV0C/optimize-website-seo-conversions-6-768x512.jpg' },
  { id: 2, name: 'Apple', image: 'https://i.postimg.cc/764hqV0C/optimize-website-seo-conversions-6-768x512.jpg' },
  { id: 3, name: 'Samsung', image: 'https://i.postimg.cc/764hqV0C/optimize-website-seo-conversions-6-768x512.jpg' },
  { id: 4, name: 'Fashion', image: 'https://i.postimg.cc/764hqV0C/optimize-website-seo-conversions-6-768x512.jpg' },
  { id: 5, name: 'Leather Co', image: 'https://i.postimg.cc/764hqV0C/optimize-website-seo-conversions-6-768x512.jpg' }
]

const suppliers = [
  { id: 103, name: 'Abdullah Suad' },
  { id: 203, name: 'Tonmoy Sarkar' },
  { id: 302, name: 'Rahim Traders' }
]

export default function POSSystem() {
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

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const filteredBrands = brands.filter(brand => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

  const modalStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '500px',
    height: '100vh',
    bgcolor: 'white',
    boxShadow: 24,
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease-in-out',
    overflowY: 'auto'
  }

  // Function to remove item from cart
  const handleRemoveCartItem = (productId, supplierId) => {
    setCartProducts(prevCart =>
      prevCart.filter(item => !(item.product_id === productId && item.supplier_id === supplierId))
    )
  }

  const handleBoxChange = (productId, supplierId, increment = true) => {
    setCartProducts(prevCart =>
      prevCart.map(item => {
        if (item.product_id === productId && item.supplier_id === supplierId) {
          const newBox = increment ? item.box + 1 : Math.max(0, item.box - 1)

          const expenses = item.expenses || 0 // keep current expenses
          const baseTotal = item.cost * newBox + expenses

          const total =
            item.product_name === 'Mango' || item.product_name === 'Pineapple'
              ? (baseTotal * 1.1).toFixed(2)
              : baseTotal.toFixed(2)

          return { ...item, box: newBox, total }
        }

        return item
      })
    )
  }

  const handleCartProductClick = product => {
    if (!selectedSupplier?.id) {
      alert('Please select a supplier first.')

      return
    }

    const isAlreadyAdded = cartProducts.some(
      item => item.product_id === product.id && item.supplier_id === selectedSupplier.id
    )

    if (isAlreadyAdded) {
      alert('This product is already in the cart.')

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

  const handleDistributeSubmit = data => {
    handleSalesDistributionExpense(data, cartProducts, setCartProducts)
  }

  // console.log('selected customer', selectedSupplier)
  // console.log('cart products', cartProducts)

  const totalDueAmount = cartProducts.reduce((acc, item) => {
    return acc + parseFloat(item.total || 0)
  }, 0)

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
  useEffect(() => {
    const receive = parseFloat(receiveAmount) || 0
    const total = parseFloat(totalDueAmount) || 0

    if (receive < total) {
      setPaymentValue('dueAmount', total - receive)
      setPaymentValue('changeAmount', 0)
    } else {
      setPaymentValue('dueAmount', 0)
      setPaymentValue('changeAmount', receive - total)
    }
  }, [receiveAmount, totalDueAmount, setPaymentValue])

  const onSubmitPayment = data => {
    console.log('Payment form data:', data)
  }

  return (
    <div className='min-h-[calc(100vh-54px] bg-gray-50 p-4'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
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
                <option value=''>Select Customer</option>
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
                <tr className='bg-gray-50'>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>SL</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Supplier</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Product</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Box</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Cost(unit)</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Transportation</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Moshjid</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Van Vara</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Expenses</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Total</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Action</th>
                </tr>
              </thead>

              {cartProducts.length > 0 && (
                <tbody>
                  {cartProducts.map((product, index) => (
                    <tr key={product.product_id + product.supplier_id + index}>
                      <td className='border border-gray-200 px-3 py-2'>{product.supplier_id}</td>
                      <td className='border border-gray-200 px-3 py-2'>{product.supplier_name}</td>
                      <td className='border border-gray-200 px-3 py-2'>{product.product_name}</td>

                      {/* Box with plus/minus */}
                      <td className='border border-gray-200 px-3 py-2'>
                        <div className='flex justify-between gap-2 items-center'>
                          <button
                            onClick={() => handleBoxChange(product.product_id, product.supplier_id, false)}
                            className='text-red-500 bg-transparent border-none outline-none h-full w-full flex items-center justify-center'
                          >
                            <FaMinus />
                          </button>

                          <span>{product.box}</span>
                          <button
                            onClick={() => handleBoxChange(product.product_id, product.supplier_id, true)}
                            className='text-green-500 bg-transparent border-none outline-none w-full h-full flex items-center justify-center'
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </td>

                      <td className='border border-gray-200 px-3 py-2'>{product.cost}</td>
                      <td className='border border-gray-200 px-3 py-2'>{product.transportation}</td>
                      <td className='border border-gray-200 px-3 py-2'>{product.moshjid}</td>
                      <td className='border border-gray-200 px-3 py-2'>{product.van_vara}</td>
                      <td className='border border-gray-200 px-3 py-2'>{product.expenses}</td>
                      <td className='border border-gray-200 px-3 py-2'>{product.total}</td>

                      {/* Remove button */}
                      <td className='border border-gray-200 px-3 py-2'>
                        <button
                          onClick={() => handleRemoveCartItem(product.product_id, product.supplier_id)}
                          className='text-red-500 bg-transparent border-none outline-none w-full h-full'
                        >
                          <FaTimes />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

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
        <div className='w-1/5'>
          <div className='grid grid-cols-1 gap-4 h-[calc(100vh-100px)] sticky top-0 overflow-y-auto'>
            {filteredProducts.map(product => (
              <div
                onClick={() => handleCartProductClick(product)}
                key={product.id}
                className='bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
              >
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.name}
                  className='w-full h-24 object-cover rounded mb-2'
                />
                <h3 className='font-medium text-sm mb-1'>{product.name}</h3>
                <p className='text-lg font-bold'>৳{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} closeAfterTransition>
        <Slide direction='left' in={categoryModalOpen} timeout={500}>
          <Box sx={modalStyle}>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold'>Categories</h2>
                <IconButton onClick={() => setCategoryModalOpen(false)}>
                  <Close />
                </IconButton>
              </div>

              <div className='mb-4'>
                <TextField
                  fullWidth
                  placeholder='Search categories...'
                  value={categorySearch}
                  onChange={e => setCategorySearch(e.target.value)}
                  InputProps={{
                    startAdornment: <Search className='mr-2 text-gray-400' />
                  }}
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                {filteredCategories.map(category => (
                  <div
                    key={category.id}
                    className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors'
                  >
                    <img
                      src={category.image || '/placeholder.svg'}
                      alt={category.name}
                      className='w-12 h-12 object-cover rounded mb-2 mx-auto'
                    />
                    <p className='text-center text-sm font-medium'>{category.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </Box>
        </Slide>
      </Modal>

      {/* Brand Modal */}
      <Modal open={brandModalOpen} onClose={() => setBrandModalOpen(false)} closeAfterTransition>
        <Slide direction='left' in={brandModalOpen} timeout={500}>
          <Box sx={modalStyle}>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold'>Brands</h2>
                <IconButton onClick={() => setBrandModalOpen(false)}>
                  <Close />
                </IconButton>
              </div>

              <div className='mb-4'>
                <TextField
                  fullWidth
                  placeholder='Search brands...'
                  value={brandSearch}
                  onChange={e => setBrandSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <Search className='mr-2 text-gray-400' />
                  }}
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                {filteredBrands.map(brand => (
                  <div
                    key={brand.id}
                    className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors'
                  >
                    <img
                      src={brand.image || '/placeholder.svg'}
                      alt={brand.name}
                      className='w-12 h-12 object-cover rounded mb-2 mx-auto'
                    />
                    <p className='text-center text-sm font-medium'>{brand.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </Box>
        </Slide>
      </Modal>
    </div>
  )
}
