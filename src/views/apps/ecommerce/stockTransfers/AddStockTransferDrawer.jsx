// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Vars
const initialData = {
  date: '',
  referenceNo: '',
  locationFrom: '',
  locationTo: '',
  status: '',
  shippingCharges: '',
  totalAmount: ''
}

const AddStockTransferDrawer = props => {
  // Props
  const { open, handleClose, setData, transferData } = props

  // States
  const [formData, setFormData] = useState(initialData)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  })

  const onSubmit = data => {
    const newData = {
      id: (transferData?.length && transferData?.length + 1) || 1,
      date: data.date,
      referenceNo: data.referenceNo,
      locationFrom: data.locationFrom,
      locationTo: data.locationTo,
      status: data.status,
      shippingCharges: Number(data.shippingCharges),
      totalAmount: Number(data.totalAmount)
    }

    setData([...(transferData ?? []), newData])
    resetForm(initialData)
    setFormData(initialData)
    handleClose()
  }

  const handleReset = () => {
    handleClose()
    resetForm(initialData)
    setFormData(initialData)
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
        <Typography variant='h5'>Add Stock Transfer</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Transfer Information
            </Typography>

            {/* Date */}
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
                  {...(errors.date && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Reference No */}
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
                  {...(errors.referenceNo && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Location From */}
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
                  {...(errors.locationFrom && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Location To */}
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
                  {...(errors.locationTo && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Status */}
            <Controller
              name='status'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  id='status'
                  label='Status'
                  {...field}
                  {...(errors.status && { error: true, helperText: 'This field is required.' })}
                >
                  <MenuItem value='Pending'>Pending</MenuItem>
                  <MenuItem value='In Transit'>In Transit</MenuItem>
                  <MenuItem value='Delivered'>Delivered</MenuItem>
                  <MenuItem value='Cancelled'>Cancelled</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Shipping Charges */}
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
                  {...(errors.shippingCharges && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Total Amount */}
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
                  {...(errors.totalAmount && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Switch - keep same as before (dummy toggle) */}
            <div className='flex justify-between'>
              <div className='flex flex-col items-start gap-1'>
                <Typography color='text.primary' className='font-medium'>
                  Mark as Verified?
                </Typography>
                <Typography variant='body2'>Please confirm after approval.</Typography>
              </div>
              <Switch defaultChecked />
            </div>

            {/* Buttons */}
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit'>
                Add
              </Button>
              <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
                Discard
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AddStockTransferDrawer
