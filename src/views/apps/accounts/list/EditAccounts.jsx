'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Grid } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'

const EditAccounts = ({ open, handleClose, rowData, setData }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: rowData
  })

  const onSubmit = data => {
    setData(prev => prev.map(item => (item.id === rowData.id ? { ...item, ...data } : item)))
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Account</DialogTitle>
      <DialogContent dividers>
        <form id='edit-account-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Account Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Account Name'
                    placeholder='Cash in Hand'
                    error={!!errors.name}
                    helperText={errors.name && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Account Type */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='accountType'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Account Type'
                    {...field}
                    error={!!errors.accountType}
                    helperText={errors.accountType && 'Required'}
                  >
                    <MenuItem value='Cash'>Cash</MenuItem>
                    <MenuItem value='Bank'>Bank</MenuItem>
                    <MenuItem value='Mobile Wallet'>Mobile Wallet</MenuItem>
                    <MenuItem value='Loan'>Loan</MenuItem>
                    <MenuItem value='Equity'>Equity</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Account Number */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='accountNumber'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Account Number'
                    placeholder='ACC-12345'
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Balance */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='balance'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Balance'
                    placeholder='50000'
                    error={!!errors.balance}
                    helperText={errors.balance && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Account Details */}
            <Grid item xs={12}>
              <Controller
                name='accountDetails'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Account Details'
                    placeholder='Main Cash'
                    error={!!errors.accountDetails}
                    helperText={errors.accountDetails && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Added By */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='addedBy'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Added By'
                    placeholder='Admin'
                    error={!!errors.addedBy}
                    helperText={errors.addedBy && 'Required'}
                  />
                )}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='error' variant='outlined'>
          Cancel
        </Button>
        <Button type='submit' form='edit-account-form' color='primary' variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditAccounts
