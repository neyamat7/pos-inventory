import Link from 'next/link'

const PosHeader = () => {
  return (
    <div className='flex flex-col gap-3 lg:flex-row items-center justify-between space-x-4 px-6 pr-12 w-2/3'>
      <h1 className='text-2xl xl:text-3xl font-semibold'>Sell Product</h1>
      <div className='flex space-x-2'>
        <button className='flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm'>
          <span>🛒</span>
          <span>Product List</span>
        </button>
        <button className='flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm'>
          <span>📊</span>
          <span>Today Sales</span>
        </button>

        <Link href='/dashboard'>
          <button className='flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm'>
            <span>📈</span>
            <span>Dashboard</span>
          </button>
        </Link>
      </div>
    </div>
  )
}

export default PosHeader
