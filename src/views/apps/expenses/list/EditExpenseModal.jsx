'use client'

import { useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { Button, Typography } from '@mui/material'

import Swal from 'sweetalert2'

import CustomTextField from '@/@core/components/mui/TextField'

const EditExpenseModal = ({ open, handleClose, rowData, setData }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: rowData
  })

  // Reset when modal opens with new data
  useEffect(() => {
    reset(rowData)
  }, [rowData, reset])

  const onSubmit = values => {
    setData(prev => prev.map(item => (item.sl === rowData.sl ? { ...item, ...values } : item)))
    handleClose()
    Swal.fire('Saved!', 'Expense updated successfully.', 'success')
  }

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
      <div className='bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6'>
        <Typography variant='h6' className='mb-4 font-semibold text-gray-900'>
          Edit Expense — <span className='text-primary'>{rowData.referenceNumber}</span>
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <CustomTextField label='Amount' type='number' {...register('amount')} fullWidth />
            <CustomTextField label='Category' {...register('category')} fullWidth />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <CustomTextField label='Expense For' {...register('expenseFor')} fullWidth />
            <CustomTextField label='Payment Type' {...register('paymentType')} fullWidth />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <CustomTextField label='Reference Number' {...register('referenceNumber')} fullWidth />
            <CustomTextField label='Expense Date' type='date' {...register('expenseDate')} fullWidth />
          </div>

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

export default EditExpenseModal
