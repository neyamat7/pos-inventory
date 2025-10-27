'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Button, Typography, Alert, CircularProgress, Box } from '@mui/material'

import Swal from 'sweetalert2'

import CustomTextField from '@core/components/mui/TextField'
import { updateCategory } from '@/actions/categoryActions'

const EditCategoryModal = ({ open, handleClose, rowData, setData }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      categoryName: '',
      slug: '',
      description: '',
      comment: ''
    }
  })

  // Reset form when rowData changes
  useEffect(() => {
    if (rowData) {
      reset({
        categoryName: rowData.categoryName || '',
        slug: rowData.slug || '',
        description: rowData.description || '',
        comment: rowData.comment || ''
      })
    }

    setError('')
  }, [rowData, reset, open])

  const onSubmit = async values => {
    if (!rowData?._id) {
      setError('Invalid category data')

      return
    }

    setLoading(true)
    setError('')

    try {
      const categoryPayload = {
        categoryName: values.categoryName.trim(),
        slug: values.slug.trim(),
        description: values.description?.trim() || '',
        comment: values.comment?.trim() || ''
      }

      const result = await updateCategory(rowData._id, categoryPayload)

      if (result.success) {
        // Update local state if needed
        if (setData) {
          setData(prev => prev.map(item => (item._id === rowData._id ? { ...item, ...categoryPayload } : item)))
        }

        Swal.fire({
          title: 'Success!',
          text: 'Category has been updated successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
        handleClose()
      } else {
        setError(result.error || 'Failed to update category')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Update category error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    if (isDirty) {
      Swal.fire({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to close?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, close it!'
      }).then(result => {
        if (result.isConfirmed) {
          handleClose()
        }
      })
    } else {
      handleClose()
    }
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto'>
        <Typography variant='h6' className='mb-4 font-semibold text-gray-900'>
          Edit Category — <span className='text-primary'>{rowData?.categoryName}</span>
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <CustomTextField
            fullWidth
            label='Category Name'
            {...register('categoryName', {
              required: 'Category name is required',
              minLength: {
                value: 2,
                message: 'Category name must be at least 2 characters'
              }
            })}
            error={!!errors.categoryName}
            helperText={errors.categoryName?.message}
            disabled={loading}
          />

          <CustomTextField
            fullWidth
            label='Slug'
            {...register('slug', {
              required: 'Slug is required',
              pattern: {
                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: 'Slug can only contain lowercase letters, numbers, and hyphens'
              }
            })}
            error={!!errors.slug}
            helperText={errors.slug?.message}
            disabled={loading}
          />

          <CustomTextField
            fullWidth
            multiline
            rows={3}
            label='Description'
            {...register('description')}
            disabled={loading}
          />

          <CustomTextField fullWidth multiline rows={3} label='Comment' {...register('comment')} disabled={loading} />

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-6'>
            <Button
              variant='outlined'
              color='inherit'
              onClick={handleModalClose}
              disabled={loading}
              className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition'
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='primary'
              className='px-5 py-2 rounded-lg shadow-md min-w-[120px]'
              type='submit'
              disabled={loading || !isDirty}
            >
              {loading ? (
                <Box className='flex items-center gap-2'>
                  <CircularProgress size={16} color='inherit' />
                  Updating...
                </Box>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCategoryModal
