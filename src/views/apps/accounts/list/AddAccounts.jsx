// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import { Alert } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import { addAccount } from '@/actions/accountActions'

// Vars
const initialData = {
  name: '',
  account_type: '',
  account_name: '',
  account_number: '',
  balance: '',
  account_details: ''
}

const AddAccounts = props => {
  // Props
  const { open, handleClose, setData, transferData } = props

  // States
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)
  const [error, setError] = useState('')

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  })

  const onSubmit = async data => {
    setLoading(true)
    setError('')

    try {
      const accountPayload = {
        name: data.name.trim(),
        account_type: data.account_type,
        account_name: data.account_name?.trim() || '',
        account_number: data.account_number?.trim() || '',
        balance: Number(data.balance || 0),
        account_details: data.account_details?.trim() || ''
      }

      const result = await addAccount(accountPayload)

      if (result.success) {
        // Update local state with new account data
        const newAccount = {
          id: result.data._id || Date.now(),
          name: accountPayload.name,
          account_type: accountPayload.account_type,
          account_name: accountPayload.account_name,
          account_number: accountPayload.account_number,
          balance: accountPayload.balance,
          account_details: accountPayload.account_details,
          createdAt: new Date().toISOString()
        }

        setData([...(transferData ?? []), newAccount])
        resetForm(initialData)
        setFormData(initialData)
        handleClose()

        // console.log('Account created successfully!', result.data)
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error in onSubmit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm(initialData)
    setFormData(initialData)
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
        <Typography variant='h5'>Add Account</Typography>
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

            <Typography color='text.primary' className='font-medium'>
              Account Information
            </Typography>

            {/* Account Name (Required) */}
            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Name'
                  placeholder='Brac Bank'
                  {...(errors.name && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Account Type (Required) */}
            <Controller
              name='account_type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Account Type'
                  {...field}
                  {...(errors.account_type && { error: true, helperText: 'This field is required.' })}
                >
                  <MenuItem value='bank'>Bank</MenuItem>
                  <MenuItem value='mobile_wallet'>Mobile Wallet</MenuItem>
                  <MenuItem value='cash'>Cash</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Account Name (Optional) */}
            <Controller
              name='account_name'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Account Holder Name' placeholder='John Doe' />
              )}
            />

            {/* Account Number (Optional) */}
            <Controller
              name='account_number'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth label='Account Number' placeholder='123456789' />
              )}
            />

            {/* Balance (Optional) */}
            <Controller
              name='balance'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} fullWidth type='number' label='Initial Balance' placeholder='50000' />
              )}
            />

            {/* Account Details (Optional) */}
            <Controller
              name='account_details'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label='Account Details'
                  placeholder='Main business account with Brac Bank'
                />
              )}
            />

            {/* Buttons */}
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? 'Adding...' : 'Add Account'}
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

export default AddAccounts
