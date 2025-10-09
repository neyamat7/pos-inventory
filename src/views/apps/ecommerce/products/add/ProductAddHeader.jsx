'use client'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

const ProductAddHeader = ({ mode = 'create' }) => {
  const isEdit = mode === 'edit'

  return (
    <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
      <div>
        <Typography variant='h4' className='mbe-1'>
          {isEdit ? 'Edit product' : 'Add a new product'}
        </Typography>
        <Typography>
          {isEdit ? 'Update details for your existing product' : 'Orders placed across your store'}
        </Typography>
      </div>
    </div>
  )
}

export default ProductAddHeader
