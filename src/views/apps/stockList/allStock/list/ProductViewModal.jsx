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
        <div className='space-y-2'>
          <Typography variant='h6'>{product.product}</Typography>
          <Divider />
          <Typography>
            <strong>Code:</strong> {product.code}
          </Typography>
          <Typography>
            <strong>Category:</strong> {product.category}
          </Typography>
          <Typography>
            <strong>Cost:</strong> ${product.cost}
          </Typography>
          <Typography>
            <strong>Quantity:</strong> {product.qty}
          </Typography>
          <Typography>
            <strong>Sale Price:</strong> ${product.sale}
          </Typography>
          <Typography>
            <strong>Stock Value:</strong> ${product.cost * product.qty}
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
