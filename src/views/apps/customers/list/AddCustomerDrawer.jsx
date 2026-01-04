import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import PerfectScrollbar from 'react-perfect-scrollbar'

import { uploadImage } from '@/actions/imageActions'
import { showError, showSuccess } from '@/utils/toastUtils'

// Component Imports
import { createCustomer } from '@/actions/customerActions'
import CustomTextField from '@core/components/mui/TextField'

const AddCustomerDrawer = props => {
  const { open, handleClose, setData, customerData, refreshData } = props

  // Add these states
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      image: '',
      phone: '',
      location: '',
      account_number: '',
      account_number: '',
      due: '',
      type_1_qty: '',
      type_1_price: '',
      type_2_qty: '',
      type_2_price: ''
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
        setValue('image', avatarUrl)
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
      // Prepare customer data according to MongoDB model structure
      const customerPayload = {
        // Basic Information
        basic_info: {
          name: data.name.trim(),
          role: 'customer',
          avatar: data.image
        },

        // Contact Information
        contact_info: {
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          location: data.location?.trim() || ''
        },

        // Account & Balance Information
        account_info: {
          account_number: data.account_number?.trim() || '',
          account_number: data.account_number?.trim() || '',
          due: Number(data.due || 0)
        },

        // Crate Information
        crate_info: {
          type_1: Number(data.type_1_qty || 0),
          type_1_price: Number(data.type_1_price || 0),
          type_2: Number(data.type_2_qty || 0),
          type_2_price: Number(data.type_2_price || 0)
        }
      }

      // Call the server action
      const result = await createCustomer(customerPayload)

      if (result.success) {
        if (refreshData) {
          refreshData()
        }
        
        reset()
        handleClose()

        // console.log('Customer created successfully!', result.data)
        showSuccess('Customer created successfully!')
      } else {
        console.error('Failed to create customer:', result.error)
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error in onSubmit:', error)
      alert('Failed to create customer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setAvatarFile(null)
    setAvatarPreview('')
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 420 } } }}
    >
      <div className='flex items-center justify-between pli-6 plb-5'>
        <Typography variant='h5'>Add Customer</Typography>
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


            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label='Name'
                  placeholder='Stanfield Baser'
                  fullWidth
                  {...(errors.name && { error: true, helperText: 'Required' })}
                />
              )}
            />

            <div className='flex flex-col gap-2'>
              <Typography color='text.primary' className='font-medium'>
                Customer Avatar
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
                  <img
                    src={avatarPreview}
                    alt='Avatar preview'
                    className='w-20 h-20 rounded-full object-cover border'
                  />
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Contact Information
            </Typography>

            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  type='email'
                  label='Email'
                  placeholder='sbaser0@boston.com'
                  fullWidth
                  {...(errors.email && { error: true, helperText: 'Required' })}
                />
              )}
            />

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

            <Controller
              name='location'
              control={control}
              render={({ field }) => <CustomTextField {...field} label='Location' placeholder='Australia' fullWidth />}
            />

            {/* Account Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Account Information
            </Typography>

            <Controller
              name='account_number'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} label='Account Number' placeholder='ACC001' fullWidth />
              )}
            />

            <div className='grid grid-cols-1 gap-4'>
              <Controller
                name='due'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} type='number' label='Due' placeholder='2000' fullWidth />
                )}
              />
            </div>



            {/* Crate Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Crate Information
            </Typography>

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  Type 1
                </Typography>

                <Controller
                  name='type_1_price'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Price' placeholder='0' fullWidth />
                  )}
                />
              </div>

              <div className='flex flex-col gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  Type 2
                </Typography>

                <Controller
                  name='type_2_price'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Price' placeholder='0' fullWidth />
                  )}
                />
              </div>
            </div>

            <div className='flex items-center gap-4 mt-2'>
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? 'Adding...' : 'Add Customer'}
              </Button>

              <Button variant='tonal' color='error' type='button' onClick={handleReset}>
                Discard
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AddCustomerDrawer
