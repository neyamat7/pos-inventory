// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import { useSession } from 'next-auth/react'

import CustomTextField from '@core/components/mui/TextField'

// Action Imports
import { createExpense } from '@/actions/expenseActions'
import { getAccounts } from '@/actions/accountActions'

const AddExpenseDrawer = props => {
  // Props
  const { open, handleClose, setData, expenseData } = props

  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(false)

  const { data: session, status } = useSession()
  const currentUserId = session?.user?.id

  const sessionLoading = status === 'loading'

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      date: '',
      amount: '',
      expense_for: '',
      payment_type: '',
      reference_num: '',
      choose_account: ''
    }
  })

  // Fetch accounts when drawer opens
  useEffect(() => {
    const fetchAccounts = async () => {
      if (open) {
        setAccountsLoading(true)

        try {
          const result = await getAccounts(1, 50) // Get 50 accounts

          if (result.success) {
            setAccounts(result.data.accounts || [])
          } else {
            setError('Failed to load accounts')
          }
        } catch (err) {
          setError('Error loading accounts')
          console.error('Accounts fetch error:', err)
        } finally {
          setAccountsLoading(false)
        }
      }
    }

    fetchAccounts()
  }, [open])

  const onSubmit = async data => {
    setLoading(true)
    setError('')

    try {
      const expensePayload = {
        date: data.date,
        amount: Number(data.amount),
        expense_for: data.expense_for.trim(),
        payment_type: data.payment_type,
        reference_num: data.reference_num?.trim() || '',
        choose_account: data.choose_account,
        expense_by: currentUserId
      }

      const result = await createExpense(expensePayload)

      if (result.success) {
        // Update local state if needed
        if (setData && expenseData) {
          const newData = {
            _id: result.data._id, // Use the ID from the response
            sl: (expenseData?.length && expenseData?.length + 1) || 1,
            ...expensePayload
          }

          setData([...(expenseData ?? []), newData])
        }

        // Reset form and close
        resetForm()
        handleClose()

        // Show success message
        console.log('Expense created successfully')
      } else {
        setError(result.error || 'Failed to create expense')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Create expense error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm()
    setError('')
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-6 plb-5'>
        <Typography variant='h5'>Add Expense</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {sessionLoading && (
              <Alert severity='info' sx={{ mb: 2 }}>
                Loading user session...
              </Alert>
            )}

            <Typography color='text.primary' className='font-medium'>
              Expense Information
            </Typography>

            {/* Date */}
            <Controller
              name='date'
              control={control}
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='date'
                  label='Date'
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                  disabled={sessionLoading || loading}
                />
              )}
            />

            {/* Amount */}
            <Controller
              name='amount'
              control={control}
              rules={{
                required: 'Amount is required',
                min: { value: 1, message: 'Amount must be greater than 0' }
              }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label='Amount'
                  placeholder='2500'
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  disabled={loading}
                />
              )}
            />

            {/* Expense For */}
            <Controller
              name='expense_for'
              control={control}
              rules={{ required: 'Expense for is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Expense For'
                  placeholder='Raw Materials'
                  error={!!errors.expense_for}
                  helperText={errors.expense_for?.message}
                  disabled={loading}
                />
              )}
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
                  <MenuItem value='bank'>Bank</MenuItem>
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

            {/* Reference Number */}
            <Controller
              name='reference_num'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Reference Number'
                  placeholder='REF-1001'
                  disabled={loading}
                />
              )}
            />

            {/* Buttons */}
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={loading} className='min-w-[100px]'>
                {loading ? (
                  <Box className='flex items-center gap-2'>
                    <CircularProgress size={16} color='inherit' />
                    Adding...
                  </Box>
                ) : (
                  'Add Expense'
                )}
              </Button>
              <Button variant='tonal' color='error' type='button' onClick={handleReset} disabled={loading}>
                Discard
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AddExpenseDrawer
