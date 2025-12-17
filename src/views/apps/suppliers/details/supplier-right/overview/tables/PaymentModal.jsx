'use client'

import { useState, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Divider,
  IconButton,
  Paper,
  Alert
} from '@mui/material'
import { X, Plus } from 'lucide-react'
import Grid from '@mui/material/Grid2'

import { showError, showInfo, showSuccess } from '@/utils/toastUtils'
import { addPayment } from '@/actions/supplierAction'
import { uploadImage } from '@/actions/imageActions'

const PaymentModal = ({ open, onClose, supplierData, lotsData, supplierId, onPaymentSuccess }) => {


const [lotRows, setLotRows] = useState([
    {
      id: 1,
      selectedLotId: '',
      totalSell: 0,
      baseExpense: 0,
      extraExpense: 0,
      totalExpense: 0,
      profit: 0,
      originalProfit: 0,
      discountPercentage: 0,
      discountAmount: 0,
      paidAmount: 0
    }
  ])

  // State for payment summary fields
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [amountFromBalance, setAmountFromBalance] = useState(0)
  const [transactionId, setTransactionId] = useState('')
  const [paidAmountInput, setPaidAmountInput] = useState(0) // Changed name from receiveAmount
  const [documentUrl, setDocumentUrl] = useState('')
  const [note, setNote] = useState('')

  const [documentFile, setDocumentFile] = useState(null)
  const [documentUploading, setDocumentUploading] = useState(false)
  const [documentPreview, setDocumentPreview] = useState('')

  // State for validation error
  const [balanceError, setBalanceError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ============ CALCULATED VALUES ============
  // Calculate summary totals
  const calculateSummary = () => {
    const totalSell = lotRows.reduce((sum, row) => sum + (row.totalSell || 0), 0)
    const totalProfit = lotRows.reduce((sum, row) => sum + (row.profit || 0), 0)
    const totalLotsExpenses = lotRows.reduce((sum, row) => sum + (row.totalExpense || 0), 0)
    const totalExtraExpenses = lotRows.reduce((sum, row) => sum + (row.extraExpense || 0), 0)
    const payableAmount = lotRows.reduce((sum, row) => sum + (row.paidAmount || 0), 0)

    // Calculate need to pay due
    const needToPayDue = payableAmount - (Number(amountFromBalance) || 0) - (Number(paidAmountInput) || 0)

    return {
      totalSell,
      totalProfit,
      totalLotsExpenses,
      totalExtraExpenses,
      payableAmount,
      needToPayDue: Math.max(0, needToPayDue) // Don't show negative
    }
  }

  const summary = calculateSummary()

  // ============ VALIDATION - Amount from Balance ============
  useEffect(() => {
    const availableBalance = supplierData?.account_info?.balance || 0

    if (Number(amountFromBalance) > availableBalance) {
      setBalanceError(`Cannot exceed available balance of ${availableBalance}`)
    } else {
      setBalanceError('')
    }
  }, [amountFromBalance, supplierData])

  // ============ HANDLER FUNCTIONS ============

  // Calculate individual lot values when lot is selected or discount changes
  const calculateLotValues = (lot, discountPercentage) => {
    const totalSell = lot?.sales?.totalSoldPrice || 0
    const totalExpense = lot?.expenses?.total_expenses || 0
    const extraExpense = lot?.expenses?.extra_expense || 0
    const originalProfit = lot?.profits?.lotProfit || 0

    // Calculate discount amount from percentage
    const discountAmount = (totalSell * Number(discountPercentage || 0)) / 100

    // Calculate new profit after discount
    const newProfit = originalProfit - discountAmount

    // Calculate paid amount: totalSell - totalExpense - discountAmount - newProfit
    const paidAmount = Math.max(0, totalSell - totalExpense - newProfit)

    // Calculate baseExpense
    const baseExpense = totalExpense - extraExpense

    return {
      totalSell,
      totalExpense,
      baseExpense,
      extraExpense,
      originalProfit,
      profit: newProfit,
      discountAmount,
      paidAmount
    }
  }

  // Handle lot selection
  const handleLotChange = (rowId, lotId) => {
    const selectedLot = lotsData?.find(lot => lot._id === lotId)

    if (!selectedLot) return

    // Calculate values for the selected lot
    const calculatedValues = calculateLotValues(selectedLot, 0)

    setLotRows(
      lotRows.map(row =>
        row.id === rowId
          ? {
              ...row,
              selectedLotId: lotId,
              ...calculatedValues,
              discountPercentage: 0 // Reset discount
            }
          : row
      )
    )
  }

  // Handle discount change for individual lot
  const handleDiscountChange = (rowId, discountPercentage) => {
    setLotRows(
      lotRows.map(row => {
        if (row.id === rowId) {
          const selectedLot = lotsData?.find(lot => lot._id === row.selectedLotId)

          if (!selectedLot) return row

          // Recalculate all values with new discount
          const calculatedValues = calculateLotValues(selectedLot, discountPercentage)

          console.log('Calculated Values:', calculatedValues)

          return {
            ...row,
            discountPercentage: Number(discountPercentage) || 0,
            ...calculatedValues
          }
        }

        return row
      })
    )
  }

  // Add new lot row (adds above the plus button)
  const handleAddLotRow = () => {
    const newRow = {
      id: Date.now(),
      selectedLotId: '',
      totalSell: 0,
      baseExpense: 0,
      extraExpense: 0,
      totalExpense: 0,
      profit: 0,
      originalProfit: 0,
      discountPercentage: 0,
      discountAmount: 0,
      paidAmount: 0
    }

    setLotRows([...lotRows, newRow])
  }

  // ============ NEW: Remove lot row ============
  const handleRemoveLotRow = rowId => {
    // Don't allow removing if only one row exists
    if (lotRows.length === 1) {
      return
    }

    setLotRows(lotRows.filter(row => row.id !== rowId))
  }

  // Handle amount from balance change with validation
  const handleAmountFromBalanceChange = value => {
    const numValue = Number(value) || 0
    const availableBalance = supplierData?.account_info?.balance || 0

    // Don't allow more than available balance
    if (numValue <= availableBalance) {
      setAmountFromBalance(numValue)
    }
  }

  // Handle document file upload
  const handleDocumentUpload = async event => {
    const file = event.target.files[0]

    if (!file) return

    const localPreview = URL.createObjectURL(file)

    setDocumentPreview(localPreview)

    setDocumentUploading(true)

    try {
      const formData = new FormData()

      formData.append('image', file)

      const uploadResult = await uploadImage(formData)

      if (uploadResult.success) {
        // Extract filename and construct proper URL
        const imagePath = uploadResult.data?.filepath || uploadResult.data.imageUrl

        // Set the document URL
        setDocumentUrl(imagePath)
      } else {
        console.error('Document upload failed:', uploadResult.error)
        showError(`Document upload failed: ${uploadResult.error}`)
      }
    } catch (error) {
      console.error('Document upload error:', error)
      showError('Error uploading document. Please try again.')
    } finally {
      setDocumentUploading(false)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    // console.log('submit called')

    // Validation: Check if at least one lot is selected
    const hasSelectedLots = lotRows.some(row => row.selectedLotId !== '')

    if (!hasSelectedLots) {
      showInfo('Please select at least one lot')

      return
    }

    // Validation: Check balance error
    if (balanceError) {
      showError('Please fix the balance amount error')

      return
    }

    setIsSubmitting(true)

    // Build payload object
    const payload = {
      date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
      supplierId: supplierId,
      selected_lots_info: lotRows
        .filter(row => row.selectedLotId !== '')
        .map(row => ({
          lot_id: row.selectedLotId,
          total_sell: row.totalSell,
          base_expense: row.baseExpense || 0,
          extra_expense: row.extraExpense || 0,
          total_expense: row.totalExpense,
          profit: row.profit,
          discount: row.discountPercentage,
          paid_amount: row.paidAmount
        })),
      payment_method: paymentMethod,
      payable_amount: summary.payableAmount,
      total_lots_expenses: summary.totalLotsExpenses,
      amount_from_balance: Number(amountFromBalance) || 0,
      total_paid_amount: Number(paidAmountInput) || 0,
      need_to_pay_due: summary.needToPayDue,
      transactionId: transactionId,
      proof_img: documentUrl,
      note: note
    }

    console.log('Payment Payload:', payload)

    try {
      const result = await addPayment(payload)

      if (result.success) {
        showSuccess('Payment added successfully!')
        resetDocumentState()
        
        // Call success callback to refresh data
        if (onPaymentSuccess) {
          onPaymentSuccess()
        }
        
        onClose()
      } else {
        showError(result.error || 'Failed to add payment')
      }
    } catch (error) {
      showError('An error occurred while submitting payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetDocumentState = () => {
    setDocumentFile(null)
    setDocumentPreview('')
    setDocumentUrl('')
    setDocumentUploading(false)
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetDocumentState()
        onClose()
      }}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      {/* ============ MODAL HEADER ============ */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          py: 2
        }}
      >
        Clear Payment
        <IconButton
          onClick={() => {
            resetDocumentState()
            onClose()
          }}
          sx={{ color: 'white' }}
        >
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* ============ SUPPLIER INFORMATION SECTION ============ */}
        <Paper elevation={2} sx={{ p: 2.5, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
            Supplier Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Name
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {supplierData?.basic_info?.name || 'N/A'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Account No
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {supplierData?.account_info?.accountNumber || 'N/A'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Phone
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {supplierData?.contact_info?.phone || 'N/A'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Balance
              </Typography>
              <Typography variant='body1' fontWeight='600' color='success.main'>
                {supplierData?.account_info?.balance || 0}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Due
              </Typography>
              <Typography variant='body1' fontWeight='600' color='error.main'>
                {supplierData?.account_info?.due || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ============ LOT SELECTION TABLE ============ */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' fontWeight='bold' gutterBottom>
            Select Lots
          </Typography>

          {/* Table Container with Horizontal Scroll */}
          <Box
            sx={{
              overflowX: 'auto',
              mb: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              backgroundColor: '#fafafa',
              width: '100%'
            }}
          >
            {/* Table Header */}
            <Box
              sx={{
                display: 'flex',
                minWidth: { xs: '1200px', lg: 'auto' }, // Only set minWidth on small screens
                py: 1.5,
                px: 2,
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5'
              }}
            >
              {/* Lot Name - Fixed width */}
              <Box sx={{ width: 200, minWidth: 200, px: 1 }}>
                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                  Lot Name
                </Typography>
              </Box>

              {/* Total Sell */}
              <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                  Total Sell
                </Typography>
              </Box>

              {/* Extra Expense */}
              <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                  Extra Expense
                </Typography>
              </Box>

              {/* Total Expense */}
              <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                  Total Expense
                </Typography>
              </Box>

              {/* Profit */}
              <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                  Profit
                </Typography>
              </Box>

              {/* Discount (%) */}
              <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                  Discount (%)
                </Typography>
              </Box>

              {/* Paid Amount */}
              <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                  Total Amount
                </Typography>
              </Box>

              {/* Action */}
              <Box sx={{ width: 80, minWidth: 80, px: 1 }}>
                <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                  Action
                </Typography>
              </Box>
            </Box>

            {/* Dynamic Lot Rows */}
            {lotRows.map((row, index) => (
              <Paper
                key={row.id}
                elevation={0}
                sx={{
                  display: 'flex',
                  minWidth: { xs: '1200px', lg: 'auto' }, // Only set minWidth on small screens
                  p: 2,
                  borderBottom: '1px solid #e0e0e0',
                  '&:hover': { backgroundColor: '#f9f9f9' },
                  borderRadius: 0
                }}
              >
                {/* Lot Dropdown */}
                <Box sx={{ width: 200, minWidth: 200, px: 1 }}>
                  <TextField
                    select
                    fullWidth
                    size='small'
                    label='Select Lot'
                    value={row.selectedLotId}
                    onChange={e => handleLotChange(row.id, e.target.value)}
                  >
                    {lotsData?.map(lot => (
                      <MenuItem
                        key={lot._id}
                        value={lot._id}
                        disabled={lotRows.some(r => r.selectedLotId === lot._id && r.id !== row.id)}
                      >
                        {lot.lot_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Total Sell */}
                <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`${row.totalSell.toFixed(2)}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                {/* Extra Expense (Read-only) */}
                <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`${row.extraExpense?.toFixed(2) || '0.00'}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                {/* Total Expense (Read-only) */}
                <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`${row.totalExpense?.toFixed(2) || '0.00'}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                {/* Profit (Calculated after discount) */}
                <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`${row.profit.toFixed(2)}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                {/* Discount Percentage Input */}
                <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                  <TextField
                    fullWidth
                    size='small'
                    type='number'
                    placeholder='0'
                    value={row.discountPercentage}
                    onChange={e => handleDiscountChange(row.id, e.target.value)}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    InputProps={{
                      endAdornment: <Typography variant='body2'>%</Typography>
                    }}
                  />
                </Box>

                {/* Paid Amount (Calculated) */}
                <Box sx={{ width: 120, minWidth: 120, px: 1 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`${row.paidAmount.toFixed(2)}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                {/* Remove Button */}
                <Box sx={{ width: 80, minWidth: 80, px: 1, display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    color=''
                    onClick={() => handleRemoveLotRow(row.id)}
                    disabled={lotRows.length === 1}
                    sx={{
                      bgcolor: '',
                      '&:hover': { bgcolor: 'error.main' },
                      '&.Mui-disabled': { bgcolor: 'grey.300' }
                    }}
                  >
                    <X size={18} />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* Plus Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant='outlined'
              startIcon={<Plus size={18} />}
              onClick={handleAddLotRow}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Add Another Lot
            </Button>
          </Box>
        </Box>

        {/* ============ DOCUMENT UPLOAD SECTION ============ */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='body1' fontWeight='medium' gutterBottom>
            Payment Proof Document
          </Typography>

          <div className='flex flex-col gap-2'>
            <input
              type='file'
              accept='image/*'
              onChange={handleDocumentUpload}
              disabled={documentUploading}
              className='block w-full text-sm text-textSecondary
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-medium
        file:bg-primary file:text-white
        hover:file:bg-primaryDark disabled:opacity-50'
            />

            {documentUploading && (
              <Typography variant='body2' color='text.secondary'>
                Uploading document...
              </Typography>
            )}

            {documentPreview && (
              <div className='flex flex-col items-center gap-2 mt-2'>
                <Typography variant='body2' color='text.secondary'>
                  Preview:
                </Typography>
                <img
                  src={documentPreview}
                  alt='Document preview'
                  className='max-h-40 rounded-lg shadow-md object-contain border border-gray-200'
                  onError={e => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        </Box>

        {/* ============ PAYMENT SUMMARY SECTION ============ */}
        <Paper elevation={2} sx={{ p: 2.5, bgcolor: '#f0f4ff', borderRadius: 2 }}>
          <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
            Payment Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Payment Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type='date'
                label='Payment Date'
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size='small'
              />
            </Grid>

            {/* Payment Method */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label='Payment Method'
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                size='small'
              >
                <MenuItem value='MFS'>MFS</MenuItem>
                <MenuItem value='bank'>Bank</MenuItem>
                <MenuItem value='cash'>Cash</MenuItem>
                <MenuItem value='balance'>Balance</MenuItem>
              </TextField>
            </Grid>

            {/* Amount from Balance */}
            {paymentMethod === 'balance' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type='number'
                  label='Amount from Balance'
                  placeholder='0'
                  value={amountFromBalance}
                  onChange={e => handleAmountFromBalanceChange(e.target.value)}
                  size='small'
                  error={!!balanceError}
                  helperText={balanceError || `Available Balance: ${supplierData?.account_info?.balance || 0}`}
                  inputProps={{ min: 0, max: supplierData?.account_info?.balance || 0 }}
                />
              </Grid>
            )}

            {/* Transaction ID */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Transaction ID'
                placeholder='TXN123456'
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                size='small'
              />
            </Grid>

            {/* Paid Amount */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type='number'
                label='Paid Amount'
                placeholder='0'
                value={paidAmountInput}
                onChange={e => setPaidAmountInput(e.target.value)}
                size='small'
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Payable Amount */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Payable Amount'
                value={`${summary.payableAmount.toFixed(2)}`}
                disabled
                size='small'
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* Need to Pay Amount */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Need to Pay'
                value={`${summary.needToPayDue.toFixed(2)}`}
                disabled
                size='small'
                InputProps={{ readOnly: true }}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: summary.needToPayDue > 0 ? 'error.main' : 'success.main',
                    fontWeight: 600,
                    WebkitTextFillColor: summary.needToPayDue > 0 ? '#d32f2f' : '#2e7d32'
                  }
                }}
              />
            </Grid>

            {/* Total Profit Display */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Total Profit'
                value={`${summary.totalProfit.toFixed(2)}`}
                disabled
                size='small'
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* Total Lots Expenses Display */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='Total Lots Expenses'
                value={`${summary.totalLotsExpenses.toFixed(2)}`}
                disabled
                size='small'
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* Note/Remarks */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Note / Remarks'
                placeholder='Add any additional notes here...'
                value={note}
                onChange={e => setNote(e.target.value)}
                size='small'
              />
            </Grid>
          </Grid>

          {/* Show validation error alert if exists */}
          {balanceError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {balanceError}
            </Alert>
          )}
        </Paper>
      </DialogContent>

      {/* ============ MODAL FOOTER / SUBMIT BUTTON ============ */}
      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8f9fa' }}>
        <Button onClick={onClose} variant='outlined' sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          sx={{ textTransform: 'none', minWidth: 120 }}
          disabled={!!balanceError || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaymentModal
