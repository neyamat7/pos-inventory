'use client'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

const ProductViewModal = ({ product, onClose }) => {
  if (!product) return null

  return (
    <Dialog open={Boolean(product)} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle className='font-bold text-lg'>Product Details</DialogTitle>
      <Divider />
      <DialogContent className='space-y-4'>
        <div className='flex justify-center'>
          <img src={product.images} alt={product.name} className='rounded-lg w-40 h-40 object-cover shadow-md' />
        </div>
        <div className='space-y-2'>
          <Typography variant='h6'>{product.name}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {product.description}
          </Typography>
          <Divider />
          <Typography>
            <strong>SKU:</strong> {product.sku}
          </Typography>
          <Typography>
            <strong>Barcode:</strong> {product.barcode}
          </Typography>
          <Typography>
            <strong>Variant:</strong> {product.variants?.map(v => `${v.option}: ${v.value}`).join(', ')}
          </Typography>
          <Typography>
            <strong>Price:</strong> ৳{product.price}
          </Typography>
          <Typography>
            <strong>Commission Rate:</strong> {product.commision_rate}%
          </Typography>
          <Typography>
            <strong>Category:</strong> {product.category}
          </Typography>
          <Typography>
            <strong>Status:</strong> {product.status}
          </Typography>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductViewModal
