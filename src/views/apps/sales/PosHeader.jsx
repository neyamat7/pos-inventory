const PosHeader = () => {
  return (
    <div className='flex items-center justify-between space-x-4 px-6 pr-12 w-2/3'>
      <h1 className='text-lg font-medium'>Quick Action</h1>
      <div className='flex space-x-2'>
        <button className='flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm'>
          <span>🛒</span>
          <span>Product List</span>
        </button>
        <button className='flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm'>
          <span>📊</span>
          <span>Today Sales</span>
        </button>
        <button className='flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm'>
          <span>🧮</span>
          <span>Calculator</span>
        </button>
        <button className='flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm'>
          <span>📈</span>
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  )
}

export default PosHeader
