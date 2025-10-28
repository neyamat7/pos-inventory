'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

const ProductAddHeader = ({ mode = 'create' }) => {
  return (
    <Card>
      <CardContent className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <Box>
          <Typography variant='h4' className='font-semibold'>
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {mode === 'create' ? 'Add a new product to your inventory' : 'Update product information'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProductAddHeader
