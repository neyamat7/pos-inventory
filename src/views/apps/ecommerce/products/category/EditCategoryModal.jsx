'use client'

import { useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { Button, Typography } from '@mui/material'

import Swal from 'sweetalert2'

import CustomTextField from '@core/components/mui/TextField'

const EditCategoryModal = ({ open, handleClose, rowData, setData }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: rowData
  })

  // Reset form when rowData changes
  useEffect(() => {
    if (rowData) reset(rowData)
  }, [rowData, reset])

  const onSubmit = values => {
    setData(prev => prev.map(item => (item.id === rowData.id ? { ...item, ...values } : item)))
    Swal.fire('Updated!', 'Category details have been updated successfully.', 'success')
    handleClose()
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6'>
        <Typography variant='h6' className='mb-4 font-semibold text-gray-900'>
          Edit Category — <span className='text-primary'>{rowData.categoryTitle}</span>
        </Typography>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <CustomTextField fullWidth label='Category Title' {...register('categoryTitle')} />
          <CustomTextField fullWidth multiline rows={3} label='Description' {...register('description')} />
          <div className='grid grid-cols-2 gap-4'>
            <CustomTextField type='number' label='Total Products' {...register('totalProduct')} fullWidth />
            <CustomTextField type='number' label='Total Earning' {...register('totalEarning')} fullWidth />
          </div>
          <CustomTextField fullWidth label='Image URL' {...register('image')} />

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-6'>
            <Button
              variant='outlined'
              color='inherit'
              onClick={handleClose}
              className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition'
            >
              Cancel
            </Button>
            <Button variant='contained' color='primary' className='px-5 py-2 rounded-lg shadow-md' type='submit'>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCategoryModal
