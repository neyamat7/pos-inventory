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
  sl: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  openingBalance: '',
  status: 'Active'
}

const AddBranchesDrawer = props => {
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
      sl: (transferData?.length && transferData?.length + 1) || 1,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      openingBalance: Number(data.openingBalance),
      status: data.status
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
        <Typography variant='h5'>Add Branch</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Branch Information
            </Typography>

            {/* Branch Name */}
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
                  {...(errors.name && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Phone */}
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
                  {...(errors.phone && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Email */}
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
                  {...(errors.email && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Address */}
            <Controller
              name='address'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={2}
                  label='Address'
                  placeholder='123 Motijheel, Dhaka'
                  {...(errors.address && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Opening Balance */}
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
                  {...(errors.openingBalance && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Status */}
            <Controller
              name='status'
              control={control}
              render={({ field }) => (
                <CustomTextField select fullWidth label='Status' {...field}>
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Inactive'>Inactive</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Switch (optional verification) */}
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

export default AddBranchesDrawer
