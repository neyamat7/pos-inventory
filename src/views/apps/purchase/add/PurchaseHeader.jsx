import Link from 'next/link'

const PurchaseHeader = () => {
  return (
    <div className='flex items-center justify-between space-x-4 px-6 pr-12 w-2/3'>
      <h1 className='text-lg font-medium'>Quick Action</h1>
      <div className='flex flex-wrap space-x-2'>
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

export default PurchaseHeader
