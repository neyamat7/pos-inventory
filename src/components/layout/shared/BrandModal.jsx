// BrandModal.js
import React from 'react'

import { Modal, Box, Slide, Fade, IconButton, TextField } from '@mui/material'
import { Close, Search } from '@mui/icons-material'

const BrandModal = ({
  open,
  onClose,
  searchValue,
  onSearchChange,
  items = [],
  setSelectedBrand,
  title = 'Brands',
  timeout = 400
}) => {
  const modalStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '250px',
    height: '100vh',
    bgcolor: 'white',
    boxShadow: 24,
    transform: 'translateX(0)',
    transition: 'transform 0.3s ease-in-out',
    overflowY: 'auto'
  }

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open} timeout={timeout}>
        <Slide direction='left' in={open} timeout={timeout}>
          <Box sx={modalStyle}>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold'>{title}</h2>
                <IconButton onClick={onClose}>
                  <Close />
                </IconButton>
              </div>

              <div className='mb-4'>
                <TextField
                  fullWidth
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={searchValue}
                  onChange={onSearchChange}
                  InputProps={{
                    startAdornment: <Search className='mr-2 text-gray-400' />
                  }}
                />
              </div>

              <div className='grid grid-cols-1 gap-3'>
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBrand(prev => (prev.includes(item.id) ? prev : [...prev, item.id]))}
                    className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors'
                  >
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className='w-12 h-12 object-cover rounded mb-2 mx-auto'
                    />
                    <p className='text-center text-sm font-medium'>{item.name}</p>
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

export default BrandModal
