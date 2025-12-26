// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { createSupplier } from '@/actions/supplierAction'
import { uploadImage } from '@/actions/imageActions'
import { showError } from '@/utils/toastUtils'

// Action Imports
// import { createSupplier } from '@/app/actions/supplier-actions'

const AddSupplierDrawer = props => {
  const { open, handleClose, setData, supplierData, refreshData } = props

  const [loading, setLoading] = useState(false)

  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      // Basic Info
      sl: '',
      name: '',
      avatar: '',

      // Contact Info
      email: '',
      phone: '',
      location: '',

      // Account Info
      accountNumber: '',
      balance: '',
      due: '',

      // Crate Info
      crate1Price: '',
      crate2Price: ''
    }
  })

  // Add image upload handler
  const handleAvatarUpload = async event => {
    const file = event.target.files[0]

    if (!file) return

    const localPreview = URL.createObjectURL(file)

    setAvatarPreview(localPreview)

    try {
      const formData = new FormData()

      formData.append('image', file)

      const uploadResult = await uploadImage(formData)

      if (uploadResult.success) {
        // Extract filename and construct proper URL
        const imagePath = uploadResult.data?.filepath || uploadResult.data.imageUrl

        const avatarUrl = imagePath

        // Set the avatar URL in the form
        setValue('avatar', avatarUrl)
      } else {
        console.error('Avatar upload failed:', uploadResult.error)
        showError(`Avatar upload failed: ${uploadResult.error}`)
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      showError('Error uploading avatar. Please try again.')
    }
  }

  const onSubmit = async data => {
    setLoading(true)

    try {
      const supplierPayload = {
        // Basic Information
        basic_info: {
          sl: data.sl.toString(),
          name: data.name.trim(),
          role: 'supplier',
          avatar: data.avatar
        },

        // Contact Information
        contact_info: {
          email: data.email?.trim() || '',
          phone: data.phone?.trim() || '',
          location: data.location?.trim() || ''
        },

        // Account & Balance Information
        account_info: {
          accountNumber: data.accountNumber?.trim() || '',
          balance: Number(data.balance || 0),
          due: Number(data.due || 0)
        },

        // Crate Information
        crate_info: {
          crate1Price: Number(data.crate1Price || 0),
          crate2Price: Number(data.crate2Price || 0)
        }
      }

      // Call the create supplier action
      const result = await createSupplier(supplierPayload)

      if (result.success) {
        // Update local state with new supplier data
        if (refreshData) {
          refreshData()
        }
        
        reset()
        handleClose()

        // console.log('Supplier created successfully!', result.data)
      } else {
        console.error('Failed to create supplier:', result.error)
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error in onSubmit:', error)
      alert('Failed to create supplier. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 500 } } }}
    >
      <div className='flex items-center justify-between pli-6 plb-5'>
        <Typography variant='h5'>Add Supplier</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            {/* Basic Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='sl'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label='SL Number'
                      placeholder='1'
                      fullWidth
                      {...(errors.sl && { error: true, helperText: 'Required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label='Supplier Name'
                      placeholder='Rahim Traders'
                      fullWidth
                      {...(errors.name && { error: true, helperText: 'Required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <div className='flex flex-col gap-2'>
                  <Typography color='text.primary' className='font-medium'>
                    Product Image
                  </Typography>
                  {/* File Upload Input */}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleAvatarUpload}
                    disabled={loading}
                    className='block w-full text-sm text-textSecondary
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-medium
        file:bg-primary file:text-white
        hover:file:bg-primaryDark disabled:opacity-50'
                  />

                  {/* Avatar Preview */}
                  {avatarPreview && (
                    <div className='flex justify-center mt-2'>
                      <img src={avatarPreview} alt='Avatar preview' className='w-20 h-20 object-cover border' />
                    </div>
                  )}
                </div>
              </Grid>
            </Grid>

            {/* Contact Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Contact Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      type='email'
                      label='Email'
                      placeholder='rahimtraders@gmail.com'
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='phone'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label='Phone'
                      placeholder='+8801711000001'
                      fullWidth
                      {...(errors.phone && { error: true, helperText: 'Required' })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='location'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} label='Location' placeholder='Chandpur, Bangladesh' fullWidth />
                  )}
                />
              </Grid>
            </Grid>

            {/* Account Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Account Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name='accountNumber'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} label='Account Number' placeholder='ACC123456' fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='balance'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Balance' placeholder='5000' fullWidth onWheel={e => e.target.blur()} />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='due'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Due Amount' placeholder='3875' fullWidth onWheel={e => e.target.blur()} />
                  )}
                />
              </Grid>
            </Grid>

            {/* Crate Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Crate Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='crate1Price'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Crate 1 Price' placeholder='0' fullWidth onWheel={e => e.target.blur()} />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name='crate2Price'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Crate 2 Price' placeholder='0' fullWidth onWheel={e => e.target.blur()} />
                  )}
                />
              </Grid>
            </Grid>

            <div className='flex items-end text-right w-full gap-4 mt-2'>
              <Button variant='tonal' color='error' type='button' onClick={handleReset} disabled={loading}>
                Discard
              </Button>

              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? 'Adding...' : 'Add Supplier'}
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AddSupplierDrawer
