// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { uploadImage } from '@/actions/imageActions'
import { showError, showSuccess } from '@/utils/toastUtils'

const AddUserDrawer = props => {
  // Props
  const { open, handleClose, userData, setData, onRefresh } = props

  // States
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

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
      phone: '',
      password: '',
      role: '',
      imageUrl: '',
      salary: ''
    }
  })

  // Handle image file selection
  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setImageFile(file)

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)

      setImagePreview(previewUrl)
    }
  }

  // Upload image first, then submit user data
  const onSubmit = async data => {
    setLoading(true)

    try {
      let imageUrl = data.imageUrl // Use provided URL if any

      // console.log('image file', imageFile)

      // If image file is selected, upload it first
      if (imageFile) {
        const formData = new FormData()

        formData.append('image', imageFile)

        // console.log('FormData contents:', formData.get('image'))

        const uploadResult = await uploadImage(formData)

        if (!uploadResult.success) {
          alert(`Image upload failed: ${uploadResult.error}`)
          setLoading(false)

          return
        }

        // console.log('image result', uploadResult)

        // Use the uploaded image URL
        imageUrl = uploadResult.data.filepath || uploadResult.data.imageUrl
      }

      // Now submit user data with the image URL
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: data.role,
          salary: data.salary,
          imageUrl: imageUrl || ''
        })
      })

      const result = await response.json()

      if (response.ok) {
        handleClose()
        resetAll()
        showSuccess('User created successfully!')
        
        // Trigger refresh to fetch updated data from server
        if (onRefresh) {
          onRefresh()
        }
      } else {
        showError(`Error: ${result.message}`)
      }
    } catch (error) {
      alert('Error creating user. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset everything
  const resetAll = () => {
    setImageFile(null)
    setImagePreview('')
    resetForm({ name: '', email: '', phone: '', password: '', role: '', imageUrl: '', salary: '' })
  }

  const handleReset = () => {
    handleClose()
    resetAll()
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
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Add New User</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
          {/* Name */}
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Full Name'
                placeholder='John Doe'
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
                placeholder='johndoe@gmail.com'
                {...(errors.email && { error: true, helperText: 'This field is required.' })}
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
                label='Phone Number'
                placeholder='+1 234 567 8900'
                {...(errors.phone && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          {/* Password */}
          <Controller
            name='password'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='password'
                label='Password'
                placeholder='Enter password'
                {...(errors.password && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          {/* Role */}
          <Controller
            name='role'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Select Role'
                {...field}
                {...(errors.role && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='manager'>Manager</MenuItem>
                <MenuItem value='operator'>Operator</MenuItem>
                <MenuItem value='staff'>Staff</MenuItem>
              </CustomTextField>
            )}
          />

          {/* Salary */}
          <Controller
            name='salary'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Salary'
                placeholder='e.g., 25000'
                {...(errors.salary && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          {/* Image Upload */}
          <div className='flex flex-col gap-2'>
            <Typography variant='body2' color='text.primary'>
              Profile Image
            </Typography>

            {/* File Input */}
            <input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='block w-full text-sm text-textSecondary
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary file:text-white
                hover:file:bg-primaryDark'
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className='mt-2'>
                <Typography variant='body2' className='mbe-2'>
                  Preview:
                </Typography>
                <img src={imagePreview} alt='Preview' className='w-20 h-20 rounded-full object-cover border' />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
            <Button variant='tonal' color='error' type='button' onClick={handleReset} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
