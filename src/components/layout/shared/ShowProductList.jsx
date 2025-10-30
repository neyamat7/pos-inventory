'use client'

import React from 'react'
 
const ShowProductList = ({ filteredProducts = [], handleCartProductClick }) => {
  return (
    <div className='lg:w-4/12 xl:w-4/12'>
      <div className='items-start grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-2 h-[calc(100vh-100px)] sticky top-0 overflow-y-auto content-start'>
        {filteredProducts.map(product => (
          <div
            onClick={() => handleCartProductClick(product)}
            key={product._id}
            className='bg-white rounded-md p-3 border border-gray-200 hover:border-red-400 hover:shadow-md transition-shadow cursor-pointer h-fit'
          >
            <img
              src={product.productImage || '/placeholder.svg'}
              alt={product.productName}
              className='w-full h-28 object-contain mb-2'
            />
            <h3 className='font-medium text-sm mb-1'>{product.productName}</h3>
            <p className='text-lg font-bold'>৳{product.basePrice}</p>
            <p className='text-xs text-gray-500'>{product.categoryId?.categoryName}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ShowProductList
