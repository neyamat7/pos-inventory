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
import CustomTextField from '@core/components/mui/TextField'

// Vars
const initialData = {
  phone: '',
  due: '',
  image: ''
}

const AddSupplierDrawer = props => {
  // Props
  const { open, handleClose, setData, supplierData } = props

  // States
  const [formData, setFormData] = useState(initialData)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      type: ''
    }
  })

  const onSubmit = data => {
    console.log('data', data)

    const newData = {
      sl: (supplierData?.length && supplierData?.length + 1) || 1,
      image: formData.image || `/images/avatars/${Math.floor(Math.random() * 8) + 1}.png`, // use user input OR fallback
      name: data.name,
      email: data.email,
      type: data.type,
      phone: formData.phone,
      due: formData.due
    }

    console.log('newData', newData)

    setData([...(supplierData ?? []), newData])
    resetForm({ name: '', email: '', type: '' })
    setFormData(initialData)
    handleClose()
  }

  const handleReset = () => {
    handleClose()
    resetForm({ name: '', email: '', type: '' })
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
        <Typography variant='h5'>Add a Supplier</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Supplier Information
            </Typography>

            {/* Name */}
            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Name'
                  placeholder='Supplier Name'
                  {...(errors.name && { error: true, helperText: 'This field is required.' })}
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
                  placeholder='supplier@email.com'
                  {...(errors.email && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Type dropdown */}
            <Controller
              name='type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Type'
                  {...field}
                  {...(errors.type && { error: true, helperText: 'This field is required.' })}
                >
                  <MenuItem value='Supplier'>Supplier</MenuItem>
                  <MenuItem value='Distributor'>Distributor</MenuItem>
                  <MenuItem value='Wholesaler'>Wholesaler</MenuItem>
                  <MenuItem value='Retailer'>Retailer</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Phone */}
            <CustomTextField
              label='Phone'
              type='number'
              fullWidth
              placeholder='+(123) 456-7890'
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />

            {/* Due */}
            <CustomTextField
              label='Due Amount'
              type='number'
              fullWidth
              placeholder='1000'
              value={formData.due}
              onChange={e => setFormData({ ...formData, due: e.target.value })}
            />

            {/* Image URL */}
            <CustomTextField
              label='Image URL'
              type='text'
              fullWidth
              placeholder='https://example.com/supplier.png'
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
            />

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

export default AddSupplierDrawer
