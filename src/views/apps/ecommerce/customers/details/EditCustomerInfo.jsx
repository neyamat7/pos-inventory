'use client'

// React Imports
import { useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const EditCustomerInfo = ({ open, handleClose, customerData, onSave }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      image: '',
      balance: '',
      location: '',
      crateType1Qty: '',
      crateType1Price: '',
      crateType2Qty: '',
      crateType2Price: ''
    }
  })

  // Prefill values when dialog opens
  useEffect(() => {
    if (customerData) {
      reset({
        name: customerData.name || '',
        email: customerData.email || '',
        image: customerData.image || '',
        balance: customerData.balance || '',
        location: customerData.location || '',
        crateType1Qty: customerData.crate?.type1?.qty || 0,
        crateType1Price: customerData.crate?.type1?.price || 0,
        crateType2Qty: customerData.crate?.type2?.qty || 0,
        crateType2Price: customerData.crate?.type2?.price || 0
      })
    }
  }, [customerData, reset])

  const onSubmit = data => {
    const updated = {
      ...customerData,
      name: data.name,
      email: data.email,
      image: data.image,
      balance: Number(data.balance),
      location: data.location,
      crate: {
        type1: { qty: Number(data.crateType1Qty), price: Number(data.crateType1Price) },
        type2: { qty: Number(data.crateType2Qty), price: Number(data.crateType2Price) }
      }
    }

    onSave(updated)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit User Information</DialogTitle>
      <Typography className='px-6 -mt-3 mb-3 text-sm text-gray-500'>
        Updating user details will receive a privacy audit.
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Supplier Name'
                    placeholder='Supplier Name'
                    error={!!errors.name}
                    helperText={errors.name && 'Required'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Email'
                    placeholder='Supplier Email'
                    error={!!errors.email}
                    helperText={errors.email && 'Required'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='image'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Image Url' placeholder='Supplier image url' />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='balance'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth type='number' label='Balance' placeholder='Balance' />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='location'
                control={control}
                render={({ field }) => <CustomTextField {...field} fullWidth label='Location' placeholder='Location' />}
              />
            </Grid>

            {/* Crates */}
            <Grid item xs={12}>
              <Typography variant='subtitle1'>Crates</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name='crateType1Qty'
                control={control}
                render={({ field }) => <CustomTextField {...field} type='number' label='Type 1 Qty' fullWidth />}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name='crateType1Price'
                control={control}
                render={({ field }) => <CustomTextField {...field} type='number' label='Type 1 Price' fullWidth />}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name='crateType2Qty'
                control={control}
                render={({ field }) => <CustomTextField {...field} type='number' label='Type 2 Qty' fullWidth />}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name='crateType2Price'
                control={control}
                render={({ field }) => <CustomTextField {...field} type='number' label='Type 2 Price' fullWidth />}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button type='submit' variant='contained'>
            Submit
          </Button>
          <Button onClick={handleClose} color='secondary' variant='tonal'>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditCustomerInfo
