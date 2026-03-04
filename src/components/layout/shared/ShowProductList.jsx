'use client'

import { useEffect, useMemo, useState } from 'react'

import { getInStockLots } from '@/actions/lotActions/lot.action'
import { getImageUrl } from '@/utils/getImageUrl'

const ShowProductList = ({ filteredProducts = [], handleCartProductClick }) => {
  const [lots, setLots] = useState([])

  useEffect(() => {
    const fetchLots = async () => {
      const res = await getInStockLots()

      if (res?.lots) {
        setLots(res.lots)
      }
    }

    fetchLots()
  }, [])

  // Process lots into a product-wise availability map
  const productAvailability = useMemo(() => {
    const map = {}

    lots.forEach(lot => {
      const productId = lot.productsId?._id || lot.productsId

      if (!productId) return

      if (!map[productId]) {
        map[productId] = {
          lotCount: 0,
          totalBoxes: 0,
          totalPieces: 0,
          totalCrate1: 0,
          totalCrate2: 0
        }
      }

      map[productId].lotCount += 1
      map[productId].totalBoxes += lot.remaining_boxes || 0
      map[productId].totalPieces += lot.remaining_pieces || 0
      map[productId].totalCrate1 += lot.carat?.remaining_crate_Type_1 || 0
      map[productId].totalCrate2 += lot.carat?.remaining_crate_Type_2 || 0
    })

    return map
  }, [lots])
  return (
    <div className='lg:w-4/12 xl:w-4/12'>
      <div className='items-start grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-2 h-[calc(100vh-100px)] sticky top-0 overflow-y-auto content-start'>
        {filteredProducts.map(product => {
          const availability = productAvailability[product._id]

          return (
            <div
              onClick={() => handleCartProductClick(product)}
              key={product._id}
              className='bg-white rounded-md p-3 border border-gray-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer h-fit relative'
            >
              <img
                src={getImageUrl(product.productImage) || '/placeholder.svg'}
                alt={product.productName}
                className='w-full h-28 object-contain mb-2'
              />
              <h3 className='font-medium text-sm line-clamp-2 min-h-[2.5rem]'>
                {product.productNameBn || product.productName}
              </h3>

              <div className='flex items-center justify-between mt-auto'>
                <p className='text-lg font-bold text-gray-900'>৳{product.basePrice}</p>
                <p className='text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded'>
                  {product.categoryId?.categoryName}
                </p>
              </div>

              {/* Lot Availability Info */}
              <div className='mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-[13px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 rounded'>
                    {availability?.lotCount || 0} Lots
                  </span>

                  <div className='flex flex-wrap justify-end gap-x-2 gap-y-0.5 max-w-[70%]'>
                    {product.isBoxed && availability?.totalBoxes > 0 && (
                      <span className='text-[13px] text-gray-600 font-medium'>B: {availability.totalBoxes}</span>
                    )}
                    {product.sell_by_piece && availability?.totalPieces > 0 && (
                      <span className='text-[13px] text-gray-600 font-medium'>P: {availability.totalPieces}</span>
                    )}
                    {product.isCrated && (availability?.totalCrate1 > 0 || availability?.totalCrate2 > 0) && (
                      <div className='flex gap-1'>
                        {availability.totalCrate1 > 0 && (
                          <span className='text-[13px] text-orange-600 font-medium'>C1: {availability.totalCrate1}</span>
                        )}
                        {availability.totalCrate2 > 0 && (
                          <span className='text-[13px] text-teal-600 font-medium'>C2: {availability.totalCrate2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ShowProductList
