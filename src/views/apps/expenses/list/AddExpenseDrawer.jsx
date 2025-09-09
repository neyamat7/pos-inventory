// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Vars
const initialData = {
  amount: '',
  category: '',
  expenseFor: '',
  paymentType: '',
  referenceNumber: '',
  expenseDate: ''
}

const AddExpenseDrawer = props => {
  // Props
  const { open, handleClose, setData, expenseData } = props

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
      amount: '',
      category: '',
      expenseFor: '',
      paymentType: '',
      referenceNumber: '',
      expenseDate: ''
    }
  })

  const onSubmit = data => {
    const newData = {
      sl: (expenseData?.length && expenseData?.length + 1) || 1,
      amount: Number(data.amount),
      category: data.category,
      expenseFor: data.expenseFor,
      paymentType: data.paymentType,
      referenceNumber: data.referenceNumber,
      expenseDate: data.expenseDate
    }

    setData([...(expenseData ?? []), newData])
    resetForm(initialData)
    setFormData(initialData)
    handleClose()
  }

  const handleReset = () => {
    handleClose()
    resetForm(initialData)
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
        <Typography variant='h5'>Add Expense</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Expense Information
            </Typography>

            {/* Amount */}
            <Controller
              name='amount'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label='Amount'
                  placeholder='2500'
                  {...(errors.amount && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Category (dropdown) */}
            <Controller
              name='category'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  id='category'
                  label='Category'
                  {...field}
                  {...(errors.category && { error: true, helperText: 'This field is required.' })}
                >
                  <MenuItem value='Purchase'>Purchase</MenuItem>
                  <MenuItem value='Maintenance'>Maintenance</MenuItem>
                  <MenuItem value='Transport'>Transport</MenuItem>
                  <MenuItem value='Salary'>Salary</MenuItem>
                  <MenuItem value='Other'>Other</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Expense For */}
            <Controller
              name='expenseFor'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Expense For'
                  placeholder='Raw Materials'
                  {...(errors.expenseFor && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Payment Type (dropdown) */}
            <Controller
              name='paymentType'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  id='paymentType'
                  label='Payment Type'
                  {...field}
                  {...(errors.paymentType && { error: true, helperText: 'This field is required.' })}
                >
                  <MenuItem value='Cash'>Cash</MenuItem>
                  <MenuItem value='Bank'>Bank</MenuItem>
                  <MenuItem value='Card'>Card</MenuItem>
                  <MenuItem value='UPI'>UPI</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Reference Number */}
            <Controller
              name='referenceNumber'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Reference Number'
                  placeholder='REF-1001'
                  {...(errors.referenceNumber && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Expense Date */}
            <Controller
              name='expenseDate'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='date'
                  label='Expense Date'
                  InputLabelProps={{ shrink: true }}
                  {...(errors.expenseDate && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Switch - keep same as before (dummy toggle) */}
            <div className='flex justify-between'>
              <div className='flex flex-col items-start gap-1'>
                <Typography color='text.primary' className='font-medium'>
                  Mark as Verified?
                </Typography>
                <Typography variant='body2'>Please confirm after approval.</Typography>
              </div>
              <Switch defaultChecked />
            </div>

            {/* Buttons */}
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

export default AddExpenseDrawer
