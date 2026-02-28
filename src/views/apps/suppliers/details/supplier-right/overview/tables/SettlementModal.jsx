'use client'

import { useRouter } from 'next/navigation'
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

const SettlementModal = ({ open, onClose, supplierData }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    actuallyPaidAmount: 0,
    amountFromBalance: 0,
    discountReceived: 0,
    payment_method: 'cash',
    transactionId: '',
    note: ''
  })

  const totalDue = supplierData?.account_info?.due || 0
  const availableBalance = supplierData?.account_info?.balance || 0

  // Update actuallyPaidAmount when discount, balance, or totalDue changes
  useEffect(() => {
    if (open) {
      const remaining = Math.max(0, totalDue - formData.discountReceived - formData.amountFromBalance)
      setFormData(prev => ({
        ...prev,
        actuallyPaidAmount: remaining
      }))
    }
  }, [open, totalDue, formData.discountReceived, formData.amountFromBalance])

  const handleInputChange = e => {
    const { name, value } = e.target
    const val = Number(value) || 0

    if (name === 'discountReceived') {
      const remainingForPaid = Math.max(0, totalDue - val - formData.amountFromBalance)
      setFormData(prev => ({
        ...prev,
        discountReceived: val,
        actuallyPaidAmount: remainingForPaid
      }))
    } else if (name === 'amountFromBalance') {
      const balanceToUse = Math.min(val, availableBalance)
      const remainingForPaid = Math.max(0, totalDue - balanceToUse - formData.discountReceived)
      setFormData(prev => ({
        ...prev,
        amountFromBalance: balanceToUse,
        actuallyPaidAmount: remainingForPaid
      }))
    } else if (name === 'actuallyPaidAmount') {
      setFormData(prev => ({
        ...prev,
        actuallyPaidAmount: val
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleUseFullBalance = () => {
    const balanceToUse = Math.min(availableBalance, totalDue - formData.discountReceived)
    setFormData(prev => ({
      ...prev,
      amountFromBalance: balanceToUse
    }))
  }

  const handleSubmit = async () => {
    if (formData.actuallyPaidAmount < 0 || formData.discountReceived < 0 || formData.amountFromBalance < 0) {
      showError('Amounts cannot be negative')
      return
    }

    if (formData.amountFromBalance > availableBalance) {
      showError('Cannot use more than available balance')
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
        router.refresh()
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
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #dcfce7' }}>
              <Typography variant='caption' color='text.secondary'>
                Outstanding Due
              </Typography>
              <Typography variant='h6' fontWeight='bold' color='success.main'>
                ৳ {totalDue.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #dbeafe' }}>
              <Typography variant='caption' color='text.secondary'>
                Balance
              </Typography>
              <Typography variant='h6' fontWeight='bold' color='primary.main'>
                ৳ {availableBalance.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type='number'
                label='Use From Balance'
                name='amountFromBalance'
                value={formData.amountFromBalance}
                onChange={handleInputChange}
                helperText={`Max: ৳${availableBalance}`}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>৳</Typography>
                }}
              />
              <Button size='small' onClick={handleUseFullBalance} sx={{ mt: 0.5, textTransform: 'none' }}>
                Use Full Balance
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type='number'
                label='Cash/Bank Paid'
                name='actuallyPaidAmount'
                value={formData.actuallyPaidAmount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>৳</Typography>,
                  endAdornment: <Wallet size={18} className='text-gray-400' />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
            label='Transaction ID / Reference'
            name='transactionId'
            value={formData.transactionId}
            onChange={handleInputChange}
            placeholder='e.g. Check #, BKash TrxID, etc.'
          />

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
