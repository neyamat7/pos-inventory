'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Grid } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'

const EditReport = ({ open, handleClose, rowData, setData }) => {
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
      <DialogTitle>Edit Payment Report</DialogTitle>
      <DialogContent dividers>
        <form id='edit-report-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='date'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='date'
                    label='Payment Date'
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Payment Ref No */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='paymentRefNo'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Payment Ref No.'
                    placeholder='PAY-1001'
                    error={!!errors.paymentRefNo}
                    helperText={errors.paymentRefNo && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Invoice No */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='invoiceNo'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Invoice No.'
                    placeholder='INV-2001'
                    error={!!errors.invoiceNo}
                    helperText={errors.invoiceNo && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='amount'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Amount'
                    placeholder='5000'
                    error={!!errors.amount}
                    helperText={errors.amount && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Payment Type */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='paymentType'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Payment Type'
                    {...field}
                    error={!!errors.paymentType}
                    helperText={errors.paymentType && 'Required'}
                  >
                    <MenuItem value='Cash'>Cash</MenuItem>
                    <MenuItem value='Bank'>Bank</MenuItem>
                    <MenuItem value='Mobile Wallet'>Mobile Wallet</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Account */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='account'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Account'
                    placeholder='Cash in Hand'
                    error={!!errors.account}
                    helperText={errors.account && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name='description'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={2}
                    label='Description'
                    placeholder='Payment for supplier'
                    error={!!errors.description}
                    helperText={errors.description && 'Required'}
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
        <Button type='submit' form='edit-report-form' color='primary' variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditReport
