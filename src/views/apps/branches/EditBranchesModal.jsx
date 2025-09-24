'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Grid } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import CustomTextField from '@core/components/mui/TextField'

const EditBranchesModal = ({ open, handleClose, rowData, setData }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: rowData
  })

  const onSubmit = data => {
    setData(prev => prev.map(item => (item.sl === rowData.sl ? { ...item, ...data } : item)))
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Branch</DialogTitle>
      <DialogContent dividers>
        <form id='edit-branch-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Branch Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Branch Name'
                    placeholder='Dhaka Main Branch'
                    error={!!errors.name}
                    helperText={errors.name && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='phone'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Phone'
                    placeholder='01711-123456'
                    error={!!errors.phone}
                    helperText={errors.phone && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='email'
                    label='Email'
                    placeholder='branch@example.com'
                    error={!!errors.email}
                    helperText={errors.email && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='address'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Address'
                    placeholder='123 Motijheel, Dhaka'
                    error={!!errors.address}
                    helperText={errors.address && 'Required'}
                  />
                )}
              />
            </Grid>

            {/* Opening Balance */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='openingBalance'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Opening Balance'
                    placeholder='50000'
                    error={!!errors.openingBalance}
                    helperText={errors.openingBalance && 'Required'}
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
                    <MenuItem value='Active'>Active</MenuItem>
                    <MenuItem value='Inactive'>Inactive</MenuItem>
                  </CustomTextField>
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
        <Button type='submit' form='edit-branch-form' color='primary' variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditBranchesModal
