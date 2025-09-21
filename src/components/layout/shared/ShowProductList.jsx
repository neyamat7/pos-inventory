'use client'

import React from 'react'

const ShowProductList = ({
  selectedCategory = [],
  handleRemoveCategory,
  filteredProducts = [],
  handleCartProductClick
}) => {
  return (
    <div className='lg:w-1/5'>
      {selectedCategory.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {selectedCategory.map(category => (
            <div key={category} className='flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm'>
              <span className='capitalize'>{category}</span>
              <button onClick={() => handleRemoveCategory(category)} className='text-red-500 hover:text-red-700'>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

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
  )
}

export default ShowProductList
