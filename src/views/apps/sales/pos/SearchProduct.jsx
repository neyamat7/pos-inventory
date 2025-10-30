import { Search } from '@mui/icons-material'
import { RxCross1 } from 'react-icons/rx'

const SearchProduct = ({ searchTerm, setSearchTerm, categoriesData, selectedCategory, setSelectedCategory }) => {
  return (
    <div className='flex gap-2 items-center'>
      {/* Search Input */}
      <input
        type='text'
        placeholder='Search products...'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className='px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
      />

      {/* Category Dropdown */}
      <select
        value={selectedCategory}
        onChange={e => setSelectedCategory(e.target.value)}
        className='px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
      >
        <option value=''>All Categories</option>
        {categoriesData.map(category => (
          <option key={category._id} value={category._id}>
            {category.categoryName}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SearchProduct
