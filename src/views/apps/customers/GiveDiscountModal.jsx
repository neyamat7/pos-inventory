'use client'

import { useState } from 'react'

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material'

import { applyCustomerDiscount } from '@/actions/balanceActions/balance.action'
import { showError, showSuccess } from '@/utils/toastUtils'
import CustomTextField from '@core/components/mui/TextField'

const GiveDiscountModal = ({ open, handleClose, customerId, customerName, currentDue, onSave }) => {
  const [discountAmount, setDiscountAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!discountAmount || isNaN(discountAmount) || Number(discountAmount) <= 0) {
      setError('Please enter a valid discount amount')

      return
    }

    if (Number(discountAmount) > currentDue) {
      setError(`Discount cannot exceed current due: ৳${currentDue}`)

      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        amount: Number(discountAmount),
        note: note || 'Customer discount given',
        balance_for: customerId,
        date: new Date()
      }

      const result = await applyCustomerDiscount(payload)

      if (result.success) {
        showSuccess('Discount applied successfully!')
        onSave()
        handleClose()
        setDiscountAmount('')
        setNote('')
      } else {
        setError(result.error)
        showError(result.error)
      }
    } catch (err) {
      console.error('Error applying discount:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', mb: 2 }}>
        <Typography variant='h5' component='span' fontWeight='bold'>
          Apply Customer Discount
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          {error && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
                <Typography variant='body1'>
                  Giving discount to: <strong>{customerName}</strong>
                </Typography>
                <Typography variant='h6' sx={{ color: 'error.main', mt: 1 }}>
                  Current Due: ৳{currentDue?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Discount Amount (৳)'
                type='number'
                placeholder='e.g. 500'
                value={discountAmount}
                onChange={e => setDiscountAmount(e.target.value)}
                autoFocus
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={3}
                label='Reason/Note'
                placeholder='Why are you giving this discount?'
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} color='secondary' variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained' color='info' disabled={loading || !discountAmount}>
          {loading ? 'Applying...' : 'Apply Discount'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GiveDiscountModal
