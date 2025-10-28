import React from 'react'

import { Modal, Slide, Box, TextField, IconButton, Fade } from '@mui/material'
import { Close, Search } from '@mui/icons-material'

const modalStyle = {
  position: 'fixed',
  top: 0,
  right: 0,
  minWidth: '300px',
  maxWidth: '400px',
  width: '100%',
  height: '100vh',
  bgcolor: 'white',
  boxShadow: 24,
  transform: 'translateX(0)',
  transition: 'transform 0.3s ease-in-out',
  overflowY: 'auto'
}

const CategoryModal = ({
  open,
  onClose,
  categorySearch,
  setCategorySearch,
  filteredCategories,
  selectedCategory,
  setSelectedCategory
}) => {
  const handleCategoryClick = categoryName => {
    setSelectedCategory(prev => (prev.includes(categoryName) ? prev : [...prev, categoryName]))
  }

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open} timeout={400}>
        <Slide direction='left' in={open} timeout={400}>
          <Box sx={modalStyle}>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold'>Categories</h2>
                <IconButton onClick={onClose}>
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
                    onClick={() => handleCategoryClick(category.categoryName)}
                    key={category._id}
                    className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors'
                  >
                    <img
                      src={'/placeholder.svg'}
                      alt={category.categoryName}
                      className='w-full h-[100px] object-cover rounded mb-2 mx-auto'
                    />
                    <p className='text-center text-sm font-medium'>{category.categoryName}</p>
                  </div>
                ))}
              </div>
            </div>
          </Box>
        </Slide>
      </Fade>
    </Modal>
  )
}

export default CategoryModal
