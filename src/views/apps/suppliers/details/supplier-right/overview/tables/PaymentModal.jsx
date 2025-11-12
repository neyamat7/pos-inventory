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
  Grid,
  IconButton,
  Paper,
  Alert
} from '@mui/material'
import { X, Plus } from 'lucide-react'

import { showError, showSuccess } from '@/utils/toastUtils'
import { addPayment } from '@/actions/supplierAction'

const PaymentModal = ({ open, onClose, supplierData, lotsData, supplierId }) => {
  const [lotRows, setLotRows] = useState([
    {
      id: 1,
      selectedLotId: '',
      totalSell: 0,
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

  // State for validation error
  const [balanceError, setBalanceError] = useState('')

  // ============ CALCULATED VALUES ============
  // Calculate summary totals
  const calculateSummary = () => {
    const totalSell = lotRows.reduce((sum, row) => sum + (row.totalSell || 0), 0)
    const totalProfit = lotRows.reduce((sum, row) => sum + (row.profit || 0), 0)
    const totalLotsExpenses = lotRows.reduce((sum, row) => sum + (row.totalExpense || 0), 0)
    const payableAmount = lotRows.reduce((sum, row) => sum + (row.paidAmount || 0), 0)

    // Calculate need to pay due
    const needToPayDue = payableAmount - (Number(amountFromBalance) || 0) - (Number(paidAmountInput) || 0)

    return {
      totalSell,
      totalProfit,
      totalLotsExpenses,
      payableAmount,
      needToPayDue: Math.max(0, needToPayDue) // Don't show negative
    }
  }

  const summary = calculateSummary()

  // ============ VALIDATION - Amount from Balance ============
  useEffect(() => {
    const availableBalance = supplierData?.account_info?.balance || 0

    if (Number(amountFromBalance) > availableBalance) {
      setBalanceError(`Cannot exceed available balance of $${availableBalance}`)
    } else {
      setBalanceError('')
    }
  }, [amountFromBalance, supplierData])

  // ============ HANDLER FUNCTIONS ============

  // Calculate individual lot values when lot is selected or discount changes
  const calculateLotValues = (lot, discountPercentage) => {
    const totalSell = lot?.sales?.totalSoldPrice || 0
    const totalExpense = lot?.expenses?.total_expenses || 0
    const originalProfit = lot?.profits?.lotProfit || 0

    // Calculate discount amount from percentage
    const discountAmount = (totalSell * Number(discountPercentage || 0)) / 100

    // Calculate new profit after discount
    const newProfit = originalProfit - discountAmount

    // Calculate paid amount: totalSell - totalExpense - discountAmount - newProfit
    const paidAmount = totalSell - totalExpense - newProfit

    return {
      totalSell,
      totalExpense,
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

  // Handle submit
  const handleSubmit = async () => {
    // Validation: Check if at least one lot is selected
    const hasSelectedLots = lotRows.some(row => row.selectedLotId !== '')

    if (!hasSelectedLots) {
      alert('Please select at least one lot')

      return
    }

    // Validation: Check balance error
    if (balanceError) {
      alert('Please fix the balance amount error')

      return
    }

    // Build payload object
    const payload = {
      date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
      supplierId: supplierId,
      selected_lots_info: lotRows
        .filter(row => row.selectedLotId !== '') // Only include selected lots
        .map(row => ({
          lot_id: row.selectedLotId,
          total_sell: row.totalSell,
          total_expense: row.totalExpense,
          profit: row.profit,
          discount: row.discountPercentage, // Store percentage, not amount
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

    const result = await addPayment(payload)

    if (result.success) {
      showSuccess('Payment added successfully!')
      onClose()
    } else {
      showError(result.error || 'Failed to add payment')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Typography variant='h5' fontWeight='bold'>
          Clear Payment
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
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
            <Grid item xs={6} sm={4}>
              <Typography variant='body2' color='text.secondary'>
                Name
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {supplierData?.basic_info?.name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='body2' color='text.secondary'>
                Account No
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {supplierData?.account_info?.accountNumber || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='body2' color='text.secondary'>
                Phone
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {supplierData?.contact_info?.phone || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='body2' color='text.secondary'>
                Balance
              </Typography>
              <Typography variant='body1' fontWeight='600' color='success.main'>
                ${supplierData?.account_info?.balance || 0}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='body2' color='text.secondary'>
                Due
              </Typography>
              <Typography variant='body1' fontWeight='600' color='error.main'>
                ${supplierData?.account_info?.due || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ============ LOT SELECTION TABLE ============ */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' fontWeight='bold' gutterBottom>
            Select Lots
          </Typography>

          {/* Table Header - UPDATED: Added Total Expense column and Actions */}
          <Grid container spacing={2} sx={{ mb: 1, px: 1 }}>
            <Grid item xs={12} sm={3}>
              <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                Lot Name
              </Typography>
            </Grid>
            <Grid item xs={3} sm={1.5}>
              <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                Total Sell
              </Typography>
            </Grid>
            <Grid item xs={3} sm={1.5}>
              <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                Total Expense {/* NEW COLUMN */}
              </Typography>
            </Grid>
            <Grid item xs={3} sm={1.5}>
              <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                Profit
              </Typography>
            </Grid>
            <Grid item xs={3} sm={1.5}>
              <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                Discount (%)
              </Typography>
            </Grid>
            <Grid item xs={3} sm={1.5}>
              <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                Paid Amount {/* NEW: Calculated value */}
              </Typography>
            </Grid>
            <Grid item xs={3} sm={1.5}>
              <Typography variant='body2' fontWeight='bold' color='text.secondary'>
                Action {/* NEW: Remove button column */}
              </Typography>
            </Grid>
          </Grid>

          {/* Dynamic Lot Rows - UPDATED: Added Total Expense, Paid Amount, and Remove button */}
          {lotRows.map((row, index) => (
            <Paper key={row.id} elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems='center'>
                {/* Lot Dropdown */}
                <Grid item xs={12} sm={3}>
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
                        disabled={lotRows.some(r => r.selectedLotId === lot._id && r.id !== row.id)} // Prevent duplicate selection
                      >
                        {lot.lot_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Total Sell */}
                <Grid item xs={3} sm={1.5}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`$${row.totalSell.toFixed(2)}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* NEW: Total Expense */}
                <Grid item xs={3} sm={1.5}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`$${row.totalExpense.toFixed(2)}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* Profit (Calculated after discount) */}
                <Grid item xs={3} sm={1.5}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`$${row.profit.toFixed(2)}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* Discount Percentage Input */}
                <Grid item xs={3} sm={1.5}>
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
                </Grid>

                {/* NEW: Paid Amount (Calculated) */}
                <Grid item xs={3} sm={1.5}>
                  <TextField
                    fullWidth
                    size='small'
                    value={`$${row.paidAmount.toFixed(2)}`}
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* NEW: Remove Button */}
                <Grid item xs={3} sm={1.5}>
                  <IconButton
                    color='error'
                    onClick={() => handleRemoveLotRow(row.id)}
                    disabled={lotRows.length === 1} // Disable if only one row
                    sx={{
                      bgcolor: 'error.light',
                      '&:hover': { bgcolor: 'error.main' },
                      '&.Mui-disabled': { bgcolor: 'grey.300' }
                    }}
                  >
                    <X size={18} />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          {/* ============ PLUS BUTTON (Below all rows) ============ */}
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

        {/* ============ DOCUMENT URL INPUT ============ */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label='Document/Image URL'
            placeholder='https://example.com/payment-proof.jpg'
            value={documentUrl}
            onChange={e => setDocumentUrl(e.target.value)}
            size='small'
          />
        </Box>

        {/* ============ PAYMENT SUMMARY SECTION ============ */}
        <Paper elevation={2} sx={{ p: 2.5, bgcolor: '#f0f4ff', borderRadius: 2 }}>
          <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
            Payment Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {/* Payment Date */}
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label='Payment Method'
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                size='small'
              >
                <MenuItem value='mfs'>MFS</MenuItem>
                <MenuItem value='bank'>Bank</MenuItem>
                <MenuItem value='cash'>Cash</MenuItem>
                <MenuItem value='balance'>Balance</MenuItem>
              </TextField>
            </Grid>

            {/* ============ CONDITIONAL: Amount from Balance with VALIDATION ============ */}
            {paymentMethod === 'balance' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type='number'
                  label='Amount from Balance'
                  placeholder='0'
                  value={amountFromBalance}
                  onChange={e => handleAmountFromBalanceChange(e.target.value)}
                  size='small'
                  error={!!balanceError}
                  helperText={balanceError || `Available Balance: $${supplierData?.account_info?.balance || 0}`}
                  inputProps={{ min: 0, max: supplierData?.account_info?.balance || 0 }}
                />
              </Grid>
            )}

            {/* Transaction ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Transaction ID'
                placeholder='TXN123456'
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                size='small'
              />
            </Grid>

            {/* UPDATED: Paid Amount (was Receive Amount) - WITH LIVE CALCULATION */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Paid Amount'
                placeholder='0'
                value={paidAmountInput}
                onChange={e => setPaidAmountInput(e.target.value)} // Live update triggers recalculation
                size='small'
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* NEW: Payable Amount (Display only - calculated) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Payable Amount'
                value={`$${summary.payableAmount.toFixed(2)}`}
                disabled
                size='small'
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* Need to Pay Amount (Display only - calculated with LIVE updates) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Need to Pay'
                value={`$${summary.needToPayDue.toFixed(2)}`}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Total Profit'
                value={`$${summary.totalProfit.toFixed(2)}`}
                disabled
                size='small'
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* NEW: Total Lots Expenses Display */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Total Lots Expenses'
                value={`$${summary.totalLotsExpenses.toFixed(2)}`}
                disabled
                size='small'
                InputProps={{ readOnly: true }}
              />
            </Grid>

            {/* Note/Remarks */}
            <Grid item xs={12}>
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
          disabled={!!balanceError} // Disable if balance error exists
        >
          Payment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaymentModal
