'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Grid } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'

const EditStockAdjustmentsModal = ({ open, handleClose, rowData, setData }) => {
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
      <DialogTitle>Edit Stock Adjustment</DialogTitle>
      <DialogContent dividers>
        <form id='edit-stock-adjustment-form' onSubmit={handleSubmit(onSubmit)}>
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
                    label='Adjustment Date'
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

            {/* Location */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='location'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Location'
                    placeholder='Warehouse A'
                    error={!!errors.location}
                    helperText={errors.location && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Adjustment Type */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='adjustmentType'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Adjustment Type'
                    {...field}
                    error={!!errors.adjustmentType}
                    helperText={errors.adjustmentType && 'Required'}
                  >
                    <MenuItem value='Damage'>Damage</MenuItem>
                    <MenuItem value='Expiry'>Expiry</MenuItem>
                    <MenuItem value='Shortage'>Shortage</MenuItem>
                    <MenuItem value='Surplus'>Surplus</MenuItem>
                  </CustomTextField>
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

            {/* Total Amount Recovered */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='totalAmountRecovered'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Total Amount Recovered'
                    placeholder='2000'
                    error={!!errors.totalAmountRecovered}
                    helperText={errors.totalAmountRecovered && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Reason */}
            <Grid item xs={12}>
              <Controller
                name='reason'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={2}
                    label='Reason'
                    placeholder='Enter reason for adjustment'
                    error={!!errors.reason}
                    helperText={errors.reason && 'Required'}
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
        <Button type='submit' form='edit-stock-adjustment-form' color='primary' variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditStockAdjustmentsModal
