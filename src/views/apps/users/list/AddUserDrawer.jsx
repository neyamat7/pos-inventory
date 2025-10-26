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

const AddUserDrawer = props => {
  // Props
  const { open, handleClose, userData, setData } = props

  // States
  const [loading, setLoading] = useState(false)

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
      password: '',
      role: '',
      imageUrl: ''
    }
  })

  const onSubmit = async data => {
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          imageUrl: data.imageUrl
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Add new user to local state
        const newUser = {
          id: Date.now(),
          name: data.name,
          email: data.email,
          role: data.role,
          image: data.imageUrl || `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 99)}.jpg`
        }

        setData([...(userData ?? []), newUser])
        handleClose()
        resetForm({ name: '', email: '', password: '', role: '', imageUrl: '' })
        alert('User created successfully!')
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      alert('Error creating user. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm({ name: '', email: '', password: '', role: '', imageUrl: '' })
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

          {/* Image URL */}
          <Controller
            name='imageUrl'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Image URL (Optional)'
                placeholder='https://example.com/avatar.jpg'
              />
            )}
          />

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
