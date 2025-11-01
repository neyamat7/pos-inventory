// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'

// Action Imports
import { createCategory } from '@/actions/categoryActions'

const AddCategoryDrawer = props => {
  // Props
  const { open, handleClose } = props

  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      categoryName: '',
      slug: '',
      description: '',
      comment: ''
    }
  })

  // Handle Form Submit
  const handleFormSubmit = async data => {
    setLoading(true)
    setError('')

    try {
      const categoryPayload = {
        categoryName: data.categoryName.trim(),
        slug: data.slug.trim(),
        description: data.description?.trim() || '',
        comment: data.comment?.trim() || ''
      }

      const result = await createCategory(categoryPayload)

      if (result.success) {
        handleReset()

        // You can add a success callback here if needed
        // console.log('Category created successfully')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to create category. Please try again.')
      console.error('Create category error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Form Reset
  const handleReset = () => {
    handleClose()
    resetForm({
      categoryName: '',
      slug: '',
      description: '',
      comment: ''
    })
    setError('')
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
        <Typography variant='h5'>Add Category</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Controller
            name='categoryName'
            control={control}
            rules={{ required: 'Category name is required' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Category Name'
                placeholder='Electronics'
                error={!!errors.categoryName}
                helperText={errors.categoryName?.message}
              />
            )}
          />

          <Controller
            name='slug'
            control={control}
            rules={{
              required: 'Slug is required'
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Slug'
                placeholder='electronics'
                error={!!errors.slug}
                helperText={errors.slug?.message}
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Description'
                placeholder='Enter category description...'
                multiline
                rows={3}
              />
            )}
          />

          <Controller
            name='comment'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Comment'
                placeholder='Additional comments...'
                multiline
                rows={3}
              />
            )}
          />

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? 'Creating...' : 'Add Category'}
            </Button>
            <Button variant='tonal' color='error' type='button' onClick={handleReset} disabled={loading}>
              Discard
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddCategoryDrawer
