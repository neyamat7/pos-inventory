import { Search } from '@mui/icons-material'

const SearchProduct = ({
  searchTerm,
  setSearchTerm,
  categoryModalOpen,
  setCategoryModalOpen,
  brandModalOpen,
  setBrandModalOpen,
  categorySearch,
  setCategorySearch,
  brandSearch,
  setBrandSearch
}) => {
  return (
    <div className='flex flex-col sm:flex-row gap-3 items-center space-x-2 w-1/3 mt-6 lg:mt-0'>
      <div className='flex'>
        <input
          type='text'
          placeholder='Search product...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='w-[280px] px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none'
        />
        <button className='bg-[#7367f0] text-white flex items-center justify-center px-2 py-2 rounded-r-lg'>
          <Search className='w-5 h-full' />
        </button>
      </div>
      <button
        onClick={() => setCategoryModalOpen(true)}
        className='px-4 py-3 bg-[#3f3e4b] text-white rounded-lg hover:bg-gray-500 cursor-pointer'
      >
        Category
      </button>
    </div>
  )
}

export default SearchProduct
