'use client'

import { useState } from 'react'

import { Modal, Box, TextField, IconButton, Fade, Slide } from '@mui/material'

import { Search, Close } from '@mui/icons-material'

import PosHeader from './PosHeader'
import SearchProduct from './SearchProduct'

// Dummy data
const products = [
  {
    id: 1,
    name: 'Nike Structure 25',
    price: 40,
    image: 'https://i.postimg.cc/6qMdKHgs/image-1.png',
    category: 'Footwear',
    brand: 'Nike'
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

export default function POSSystem() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [brandModalOpen, setBrandModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [paymentType, setPaymentType] = useState('Cash')
  const [vatType, setVatType] = useState('Select')
  const [discountType, setDiscountType] = useState('Flat (₹)')

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
        <div className='w-2/3 bg-white rounded-lg p-6'>
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
              defaultValue='2025-09-08'
              className='px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <div className='flex'>
              <select
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
                className='flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none '
              >
                <option value=''>Select Customer</option>
                <option value='customer1'>Abdullah Suad</option>
                <option value='customer2'>Tonmoy Sarkar</option>
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
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Image</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Items</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Code</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Batch</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Unit</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Sale Price</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Qty</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Sub Total</th>
                  <th className='border border-gray-200 px-3 py-2 text-left text-sm font-medium'>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='border border-gray-200 px-3 py-8'></td>
                  <td className='border border-gray-200 px-3 py-8'></td>
                  <td className='border border-gray-200 px-3 py-8'></td>
                  <td className='border border-gray-200 px-3 py-8'></td>
                  <td className='border border-gray-200 px-3 py-8'></td>
                  <td className='border border-gray-200 px-3 py-8'></td>
                  <td className='border border-gray-200 px-3 py-8'></td>
                  <td className='border border-gray-200 px-3 py-8'></td>
                  <td className='border border-gray-200 px-3 py-8'></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          <div className='grid grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <label className='w-32 text-sm'>Receive Amount</label>
                <input type='text' defaultValue='0' className='flex-1 px-3 py-2 border border-gray-300 rounded' />
              </div>
              <div className='flex items-center'>
                <label className='w-32 text-sm'>Change Amount</label>
                <input type='text' defaultValue='0' className='flex-1 px-3 py-2 border border-gray-300 rounded' />
              </div>
              <div className='flex items-center'>
                <label className='w-32 text-sm'>Due Amount</label>
                <input type='text' defaultValue='0' className='flex-1 px-3 py-2 border border-gray-300 rounded' />
              </div>
              <div className='flex items-center'>
                <label className='w-32 text-sm'>Payment Type</label>
                <select
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value)}
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
                  placeholder='Type note...'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded h-20 resize-none'
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Sub Total</span>
                <span className='font-medium'>৳ 0</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Vat</span>
                <div className='flex items-center space-x-2'>
                  <select
                    value={vatType}
                    onChange={e => setVatType(e.target.value)}
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
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value)}
                    className='px-2 py-1 border border-gray-300 rounded text-sm'
                  >
                    <option value='Flat (₹)'>Flat (৳)</option>
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
                <span>৳ 0</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Rounding(+/-)</span>
                <span className='text-sm'>৳ 0</span>
              </div>
              <div className='flex items-center justify-between font-bold text-lg'>
                <span>Payable Amount</span>
                <span>৳ 0</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex space-x-4 mt-8'>
            <button className='flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium'>
              Cancel
            </button>
            <button className='flex-1 py-3 bg-[#7367f0] text-white rounded-lg hover:bg-[#4e43c5] font-medium'>
              Save
            </button>
          </div>
        </div>

        {/* Right Side - Products */}
        <div className='w-1/3'>
          <div className='grid grid-cols-2 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto'>
            {filteredProducts.map(product => (
              <div
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
