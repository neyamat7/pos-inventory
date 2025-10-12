'use client'

import React from 'react'

import { RxCross1 } from 'react-icons/rx'

const ShowProductList = ({
  selectedCategory = [],
  handleRemoveCategory,
  filteredProducts = [],
  handleCartProductClick
}) => {
  return (
    <div className='lg:w-4/12 xl:w-4/12'>
      {selectedCategory.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4'>
          {selectedCategory.map(category => (
            <div key={category} className='flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm'>
              <span className='capitalize'>{category}</span>
              <button
                onClick={() => handleRemoveCategory(category)}
                className='text-red-500 hover:text-red-700 bg-transparent'
              >
                <RxCross1 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className='items-start grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-2 h-[calc(100vh-100px)] sticky top-0 overflow-y-auto content-start'>
        {filteredProducts.map(product => (
          <div
            onClick={() => handleCartProductClick(product)}
            key={product.id}
            className='bg-white rounded-md p-3 border border-gray-200 hover:border-red-400 hover:shadow-md transition-shadow cursor-pointer h-fit'
          >
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className='w-full h-28 object-contain mb-2'
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
