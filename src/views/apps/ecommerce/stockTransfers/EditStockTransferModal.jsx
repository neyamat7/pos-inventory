'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Grid, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'

const EditStockTransferModal = ({ open, handleClose, rowData, setData }) => {
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
      <DialogTitle>Edit Stock Transfer</DialogTitle>
      <DialogContent dividers>
        <form id='edit-stock-transfer-form' onSubmit={handleSubmit(onSubmit)}>
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
                    label='Transfer Date'
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Reference No */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='referenceNo'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Reference No'
                    placeholder='REF-1001'
                    error={!!errors.referenceNo}
                    helperText={errors.referenceNo && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Location From */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='locationFrom'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Location (From)'
                    placeholder='Dhaka Warehouse'
                    error={!!errors.locationFrom}
                    helperText={errors.locationFrom && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Location To */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='locationTo'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Location (To)'
                    placeholder='Chittagong Outlet'
                    error={!!errors.locationTo}
                    helperText={errors.locationTo && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='status'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Status'
                    {...field}
                    error={!!errors.status}
                    helperText={errors.status && 'Required'}
                  >
                    <MenuItem value='Pending'>Pending</MenuItem>
                    <MenuItem value='In Transit'>In Transit</MenuItem>
                    <MenuItem value='Delivered'>Delivered</MenuItem>
                    <MenuItem value='Cancelled'>Cancelled</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Shipping Charges */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='shippingCharges'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Shipping Charges'
                    placeholder='250'
                    error={!!errors.shippingCharges}
                    helperText={errors.shippingCharges && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Total Amount */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='totalAmount'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Total Amount'
                    placeholder='5000'
                    error={!!errors.totalAmount}
                    helperText={errors.totalAmount && 'Required'}
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
        <Button type='submit' form='edit-stock-transfer-form' color='primary' variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditStockTransferModal
