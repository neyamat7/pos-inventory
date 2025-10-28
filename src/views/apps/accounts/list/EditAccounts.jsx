'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Alert } from '@mui/material'
import Grid from '@mui/material/Grid2'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Action Imports
import { updateAccount } from '@/actions/accountActions'

const EditAccounts = ({ open, handleClose, rowData, setData }) => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form Hook
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: rowData?.name || '',
      account_type: rowData?.account_type || '',
      account_name: rowData?.account_name || '',
      account_number: rowData?.account_number || '',
      balance: rowData?.balance || 0,
      account_details: rowData?.account_details || ''
    }
  })

  // Handle form submission
  const onSubmit = async data => {
    if (!rowData?.id) {
      setError('No account ID provided')

      return
    }

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

      const result = await updateAccount(rowData.id, accountPayload)

      if (result.success) {
        // Update local state with updated account data
        const updatedAccount = {
          ...rowData,
          ...accountPayload,
          balance: accountPayload.balance
        }

        setData(prev => prev.map(item => (item.id === rowData.id ? updatedAccount : item)))

        handleClose()
        console.log('Account updated successfully!', result.data)
      } else {
        setError(result.error || 'Failed to update account')
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Error in onSubmit:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle dialog close
  const handleDialogClose = () => {
    reset()
    setError('')
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Account</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form id='edit-account-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Account Name (Required) */}
            <Grid xs={12}>
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
                    error={!!errors.name}
                    helperText={errors.name ? 'This field is required.' : ''}
                  />
                )}
              />
            </Grid>

            {/* Account Type (Required) */}
            <Grid xs={12}>
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
                    error={!!errors.account_type}
                    helperText={errors.account_type ? 'This field is required.' : ''}
                  >
                    <MenuItem value='bank'>Bank</MenuItem>
                    <MenuItem value='mobile_wallet'>Mobile Wallet</MenuItem>
                    <MenuItem value='cash'>Cash</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Account Holder Name (Optional) */}
            <Grid xs={12} sm={6}>
              <Controller
                name='account_name'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Account Holder Name' placeholder='John Doe' />
                )}
              />
            </Grid>

            {/* Account Number (Optional) */}
            <Grid xs={12} sm={6}>
              <Controller
                name='account_number'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Account Number' placeholder='123456789' />
                )}
              />
            </Grid>

            {/* Balance (Optional) */}
            <Grid xs={12} sm={6}>
              <Controller
                name='balance'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Balance' placeholder='50000' />
                )}
              />
            </Grid>

            {/* Account Details (Optional) */}
            <Grid xs={12}>
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
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color='error' variant='outlined' disabled={loading}>
          Cancel
        </Button>
        <Button type='submit' form='edit-account-form' color='primary' variant='contained' disabled={loading}>
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditAccounts
