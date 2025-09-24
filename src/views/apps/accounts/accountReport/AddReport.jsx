// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Vars
const initialData = {
  date: '',
  paymentRefNo: '',
  invoiceNo: '',
  amount: '',
  paymentType: '',
  account: '',
  description: ''
}

const AddReport = props => {
  // Props
  const { open, handleClose, setData, transferData } = props

  // States
  const [formData, setFormData] = useState(initialData)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  })

  const onSubmit = data => {
    const newData = {
      id: (transferData?.length && transferData?.length + 1) || 1,
      date: data.date,
      paymentRefNo: data.paymentRefNo,
      invoiceNo: data.invoiceNo,
      amount: Number(data.amount),
      paymentType: data.paymentType,
      account: data.account,
      description: data.description
    }

    setData([...(transferData ?? []), newData])
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
        <Typography variant='h5'>Add Payment Report</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Payment Information
            </Typography>

            {/* Date */}
            <Controller
              name='date'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='date'
                  label='Payment Date'
                  InputLabelProps={{ shrink: true }}
                  {...(errors.date && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Payment Ref No */}
            <Controller
              name='paymentRefNo'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Payment Ref No.'
                  placeholder='PAY-1001'
                  {...(errors.paymentRefNo && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Invoice No */}
            <Controller
              name='invoiceNo'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Invoice No.'
                  placeholder='INV-2001'
                  {...(errors.invoiceNo && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

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
                  placeholder='5000'
                  {...(errors.amount && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Payment Type */}
            <Controller
              name='paymentType'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Payment Type'
                  {...field}
                  {...(errors.paymentType && { error: true, helperText: 'This field is required.' })}
                >
                  <MenuItem value='Cash'>Cash</MenuItem>
                  <MenuItem value='Bank'>Bank</MenuItem>
                  <MenuItem value='Mobile Wallet'>Mobile Wallet</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Account */}
            <Controller
              name='account'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account'
                  placeholder='Cash in Hand'
                  {...(errors.account && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Description */}
            <Controller
              name='description'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={2}
                  label='Description'
                  placeholder='Payment for supplier'
                  {...(errors.description && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

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

export default AddReport
