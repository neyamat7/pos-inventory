'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

import { getImageUrl } from '@/utils/getImageUrl'

const ProductViewModal = ({ product, onClose }) => {
  if (!product) return null

  return (
    <Dialog open={Boolean(product)} onClose={onClose} fullWidth maxWidth='md' PaperProps={{ className: 'rounded-2xl' }}>
      <DialogTitle className='font-bold text-xl bg-gradient-to-r from-primary to-purple-600 text-white'>
        Product Details
      </DialogTitle>
      <Divider />
      <DialogContent className='p-6'>
        <Grid container spacing={4}>
          {/* Product Image Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card className='rounded-xl shadow-lg overflow-hidden'>
              <Box className='flex justify-center p-6 bg-gray-50'>
                <img
                  src={getImageUrl(product.productImage) || '/images/product-fallback.jpg'}
                  alt={product.productName}
                  className='rounded-lg w-48 h-48 object-cover shadow-md'
                  onError={e => {
                    e.target.src = '/images/product-fallback.jpg'
                  }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Product Details Section */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card className='rounded-xl shadow-lg'>
              <CardContent className='p-4 space-y-4'>
                {/* Product Name and Description */}
                <div>
                  <Typography variant='h5' className='font-bold text-gray-900 mb-2'>
                    {product.productNameBn || product.productName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' className='leading-relaxed'>
                    {product.description || 'No description available'}
                  </Typography>
                </div>

                <Divider />

                {/* Pricing Information */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant='subtitle2' color='text.secondary' className='font-medium'>
                      Base Price
                    </Typography>
                    <Typography variant='h6' className='text-primary font-bold'>
                      ৳{product.basePrice?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant='subtitle2' color='text.secondary' className='font-medium'>
                      Commission Rate
                    </Typography>
                    <Typography variant='h6' className='font-bold'>
                      {product.allowCommission ? `${product.commissionRate}%` : 'Not Allowed'}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider />

                {/* Status Information */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant='subtitle2' color='text.secondary' className='font-medium mb-1'>
                      Product Type
                    </Typography>
                    <Chip
                      label={
                        product.isCrated
                          ? 'Crate'
                          : product.isBoxed
                            ? 'Box'
                            : product.isBagged
                              ? 'Bag'
                              : product.sell_by_piece
                                ? 'Piece'
                                : 'General'
                      }
                      color='primary'
                      variant='tonal'
                      size='medium'
                      className='font-bold'
                    />
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant='subtitle2' color='text.secondary' className='font-medium mb-1'>
                      Status
                    </Typography>
                    <Box className='flex gap-2 flex-wrap'>
                      {product.allowCommission && (
                        <Chip label='Commission' color='success' variant='outlined' size='small' />
                      )}
                      {product.is_discountable && (
                        <Chip label='Discountable' color='info' variant='outlined' size='small' />
                      )}
                      {!product.allowCommission && !product.is_discountable && (
                        <Typography variant='body2' color='text.secondary'>
                          Regular
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Divider />

                {/* Category Information */}
                <div>
                  <Typography variant='subtitle2' color='text.secondary' className='font-medium mb-2'>
                    Category
                  </Typography>
                  <Chip
                    label={product.categoryId?.categoryName || 'Uncategorized'}
                    color='primary'
                    variant='outlined'
                  />
                </div>

                <Divider />

                {/* Dates Information */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant='subtitle2' color='text.secondary' className='font-medium'>
                      Created At
                    </Typography>
                    <Typography variant='body2'>{new Date(product.createdAt).toLocaleDateString()}</Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant='subtitle2' color='text.secondary' className='font-medium'>
                      Updated At
                    </Typography>
                    <Typography variant='body2'>{new Date(product.updatedAt).toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>

                {/* Product ID */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <Typography variant='caption' color='text.secondary' className='font-medium'>
                    Product ID
                  </Typography>
                  <Typography variant='body2' className='font-mono text-sm'>
                    {product._id}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions className='p-4'>
        <Button
          onClick={onClose}
          variant='contained'
          className='rounded-lg'
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductViewModal
