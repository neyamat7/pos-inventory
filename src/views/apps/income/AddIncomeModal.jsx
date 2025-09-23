'use client'

import { useForm } from 'react-hook-form'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material'

export default function AddIncomeModal({ open, handleClose, onAddIncome }) {
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = data => {
    const newIncome = {
      date: data.date,
      total_sales: Number(data.total_sales),
      total_income: Number(data.total_income),
      total_payment: Number(data.total_payment) // ✅ added receive amount
    }

    onAddIncome(newIncome)
    reset()
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Add New Income</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label='Date'
            type='date'
            {...register('date', { required: true })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField label='Total Sales' type='number' {...register('total_sales')} />
          <TextField label='Total Income' type='number' {...register('total_income')} />
          <TextField label='Receive Amount' type='number' {...register('total_payment')} /> {/* ✅ New Field */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant='contained'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
