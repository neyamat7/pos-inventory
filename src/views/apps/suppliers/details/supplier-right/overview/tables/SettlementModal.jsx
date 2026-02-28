'use client'

import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { Calculator, Tag, Wallet, X } from 'lucide-react'

import { clearSupplierSettlement } from '@/actions/supplierAction'
import { showError, showSuccess } from '@/utils/toastUtils'

const SettlementModal = ({ open, onClose, supplierData, onSettlementSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    actuallyPaidAmount: 0,
    discountReceived: 0,
    payment_method: 'cash',
    note: ''
  })

  const totalDue = supplierData?.account_info?.due || 0

  // Update actuallyPaidAmount when discount changes or totalDue is available
  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        actuallyPaidAmount: totalDue - prev.discountReceived
      }))
    }
  }, [open, totalDue])

  const handleInputChange = e => {
    const { name, value } = e.target

    if (name === 'discountReceived') {
      const discount = Number(value) || 0
      setFormData(prev => ({
        ...prev,
        discountReceived: discount,
        actuallyPaidAmount: Math.max(0, totalDue - discount)
      }))
    } else if (name === 'actuallyPaidAmount') {
      const paid = Number(value) || 0
      setFormData(prev => ({
        ...prev,
        actuallyPaidAmount: paid,
        discountReceived: Math.max(0, totalDue - paid)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async () => {
    if (formData.actuallyPaidAmount < 0 || formData.discountReceived < 0) {
      showError('Amounts cannot be negative')
      return
    }

    setLoading(true)
    try {
      const payload = {
        supplierId: supplierData._id,
        ...formData
      }

      const result = await clearSupplierSettlement(payload)

      if (result.success) {
        showSuccess('Supplier settlement completed successfully')
        if (onSettlementSuccess) {
          onSettlementSuccess()
        }
        onClose()
      } else {
        showError(result.error || 'Failed to complete settlement')
      }
    } catch (error) {
      console.error('Settlement Error:', error)
      showError('An error occurred during settlement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-white/20 rounded-lg'>
            <Calculator size={24} />
          </div>
          <Typography variant='h6' fontWeight='bold'>
            Clear All Payment
          </Typography>
        </div>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, mt: 2 }}>
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#f0fdf4', borderRadius: 2, mb: 4, border: '1px solid #dcfce7' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='subtitle2' color='text.secondary'>
                Total Outstanding Due
              </Typography>
              <Typography variant='h4' fontWeight='bold' color='success.main'>
                ৳ {totalDue.toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Box component='form' className='flex flex-col gap-5'>
          <TextField
            fullWidth
            type='date'
            label='Settlement Date'
            name='date'
            value={formData.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            variant='outlined'
          />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Actually Paid Amount'
                name='actuallyPaidAmount'
                value={formData.actuallyPaidAmount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>৳</Typography>,
                  endAdornment: <Wallet size={18} className='text-gray-400' />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Discount Received'
                name='discountReceived'
                value={formData.discountReceived}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>৳</Typography>,
                  endAdornment: <Tag size={18} className='text-gray-400' />
                }}
              />
            </Grid>
          </Grid>

          <TextField
            select
            fullWidth
            label='Payment Method'
            name='payment_method'
            value={formData.payment_method}
            onChange={handleInputChange}
          >
            <MenuItem value='cash'>Cash</MenuItem>
            <MenuItem value='bank'>Bank</MenuItem>
            <MenuItem value='MFS'>MFS (Mobile Financial Services)</MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={2}
            label='Note'
            name='note'
            value={formData.note}
            onChange={handleInputChange}
            placeholder='Add a remark about this settlement...'
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, bgcolor: '#f9fafb' }}>
        <Button onClick={onClose} disabled={loading} color='inherit'>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color='success'
          disabled={loading || totalDue === 0}
          sx={{ px: 4, py: 1.2, fontWeight: 'bold' }}
        >
          {loading ? <CircularProgress size={24} color='inherit' /> : 'Confirm Full Settlement'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettlementModal
