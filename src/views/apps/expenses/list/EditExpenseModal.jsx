'use client'

import { useEffect, useState } from 'react'

import { useForm, Controller } from 'react-hook-form'
import { Button, Typography, Alert, CircularProgress, Box, Card, CardContent, MenuItem } from '@mui/material'

import Swal from 'sweetalert2'

import CustomTextField from '@/@core/components/mui/TextField'
import { updateExpense } from '@/actions/expenseActions'
import { getAccounts } from '@/actions/accountActions'

const EditExpenseModal = ({ open, handleClose, rowData, setData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      date: '',
      amount: '',
      expense_for: '',
      payment_type: '',
      reference_num: '',
      choose_account: '',
      expense_by: ''
    }
  })

  // Fetch accounts and reset form when modal opens
  useEffect(() => {
    const fetchAccountsAndReset = async () => {
      if (open && rowData) {
        setAccountsLoading(true)

        try {
          // Fetch accounts
          const accountsResult = await getAccounts(1, 50)

          if (accountsResult.success) {
            setAccounts(accountsResult.data.accounts || [])
          }

          // Reset form with current data - properly mapped to schema field names
          reset({
            date: rowData.date || '',
            amount: rowData.amount || '',
            expense_for: rowData.expense_for || '',
            payment_type: rowData.payment_type || '',
            reference_num: rowData.reference_num || '',
            choose_account: rowData.choose_account || '',
            expense_by: rowData.expense_by || ''
          })
        } catch (err) {
          console.error('Error fetching accounts:', err)
        } finally {
          setAccountsLoading(false)
          setError('')
        }
      }
    }

    fetchAccountsAndReset()
  }, [rowData, reset, open])

  const onSubmit = async values => {
    if (!rowData?._id) {
      setError('Invalid expense data')

      return
    }

    setLoading(true)
    setError('')

    try {
      const expensePayload = {
        date: values.date,
        amount: Number(values.amount),
        expense_for: values.expense_for.trim(),
        payment_type: values.payment_type,
        reference_num: values.reference_num?.trim() || '',
        choose_account: values.choose_account,
        expense_by: values.expense_by
      }

      const result = await updateExpense(rowData._id, expensePayload)

      if (result.success) {
        // Update local state if needed
        if (setData) {
          setData(prev => prev.map(item => (item._id === rowData._id ? { ...item, ...expensePayload } : item)))
        }

        Swal.fire({
          title: 'Success!',
          text: 'Expense has been updated successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        handleClose()
      } else {
        setError(result.error || 'Failed to update expense')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Update expense error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    if (isDirty) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to close?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, close it!'
      }).then(result => {
        if (result.isConfirmed) {
          handleClose()
        }
      })
    } else {
      handleClose()
    }
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <Card className='w-full max-w-md rounded-xl shadow-2xl overflow-hidden'>
        {/* Header with gradient background */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)'
            }}
          />
          <CardContent className='p-6 relative'>
            <Typography variant='h5' className='font-semibold mb-1 text-white'>
              Edit Expense
            </Typography>
            <Typography variant='body2' sx={{ opacity: 0.9 }} className='text-gray-300'>
              Update expense details
            </Typography>
            {rowData?.reference_num && (
              <Typography variant='caption' sx={{ opacity: 0.8, mt: 1, display: 'block' }} className='text-gray-300'>
                Reference: {rowData.reference_num}
              </Typography>
            )}
          </CardContent>
        </Box>

        <CardContent className='p-6'>
          {error && (
            <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Date */}
            <CustomTextField
              fullWidth
              type='date'
              label='Date'
              InputLabelProps={{ shrink: true }}
              {...register('date', {
                required: 'Date is required'
              })}
              error={!!errors.date}
              helperText={errors.date?.message}
              disabled={loading}
            />

            {/* Amount */}
            <CustomTextField
              fullWidth
              type='number'
              label='Amount'
              placeholder='0.00'
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 1, message: 'Amount must be greater than 0' }
              })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              disabled={loading}
            />

            {/* Expense For */}
            <CustomTextField
              fullWidth
              label='Expense For'
              placeholder='What was this expense for?'
              {...register('expense_for', {
                required: 'Expense description is required',
                minLength: {
                  value: 3,
                  message: 'Expense description must be at least 3 characters'
                }
              })}
              error={!!errors.expense_for}
              helperText={errors.expense_for?.message}
              disabled={loading}
            />

            {/* Payment Type */}
            <Controller
              name='payment_type'
              control={control}
              rules={{ required: 'Payment type is required' }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Payment Type'
                  {...field}
                  error={!!errors.payment_type}
                  helperText={errors.payment_type?.message}
                  disabled={loading}
                >
                  <MenuItem value='cash'>Cash</MenuItem>
                  <MenuItem value='card'>Card</MenuItem>
                  <MenuItem value='bank'>Bank Transfer</MenuItem>
                  <MenuItem value='mobile_wallet'>Mobile Wallet</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Choose Account */}
            <Controller
              name='choose_account'
              control={control}
              rules={{ required: 'Account selection is required' }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Choose Account'
                  {...field}
                  error={!!errors.choose_account}
                  helperText={errors.choose_account?.message}
                  disabled={loading || accountsLoading}
                >
                  {accountsLoading ? (
                    <MenuItem value='' disabled>
                      Loading accounts...
                    </MenuItem>
                  ) : accounts.length > 0 ? (
                    accounts.map(account => (
                      <MenuItem key={account._id} value={account._id}>
                        {account.account_name || account.accountNumber || `Account ${account._id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value='' disabled>
                      No accounts available
                    </MenuItem>
                  )}
                </CustomTextField>
              )}
            />

            {/* Expense By */}
            <CustomTextField
              fullWidth
              label='Expense By'
              placeholder='Who made this expense?'
              {...register('expense_by', {
                required: 'Expense by is required'
              })}
              error={!!errors.expense_by}
              helperText={errors.expense_by?.message}
              disabled={loading}
            />

            {/* Reference Number */}
            <CustomTextField
              fullWidth
              label='Reference Number'
              placeholder='Optional reference number'
              {...register('reference_num')}
              disabled={loading}
            />

            {/* Actions */}
            <Box className='flex justify-end gap-3 pt-4'>
              <Button
                variant='outlined'
                color='inherit'
                onClick={handleModalClose}
                disabled={loading}
                className='px-6 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200'
                sx={{
                  minWidth: 100,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                color='primary'
                className='px-6 py-2 rounded-lg shadow-lg transition-all duration-200'
                type='submit'
                disabled={loading || !isDirty}
                sx={{
                  minWidth: 140,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                {loading ? (
                  <Box className='flex items-center gap-2'>
                    <CircularProgress size={16} color='inherit' />
                    Updating...
                  </Box>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditExpenseModal
