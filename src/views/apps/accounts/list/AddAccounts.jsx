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
  name: '',
  accountType: '',
  accountNumber: '',
  balance: '',
  accountDetails: '',
  addedBy: ''
}

const AddAccounts = props => {
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
      name: data.name,
      accountType: data.accountType,
      accountNumber: data.accountNumber,
      balance: Number(data.balance),
      accountDetails: data.accountDetails,
      addedBy: data.addedBy
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
        <Typography variant='h5'>Add Account</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Account Information
            </Typography>

            {/* Account Name */}
            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Name'
                  placeholder='Cash in Hand'
                  {...(errors.name && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Account Type */}
            <Controller
              name='accountType'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Account Type'
                  {...field}
                  {...(errors.accountType && { error: true, helperText: 'This field is required.' })}
                >
                  <MenuItem value='Cash'>Cash</MenuItem>
                  <MenuItem value='Bank'>Bank</MenuItem>
                  <MenuItem value='Mobile Wallet'>Mobile Wallet</MenuItem>
                  <MenuItem value='Loan'>Loan</MenuItem>
                  <MenuItem value='Equity'>Equity</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Account Number */}
            <Controller
              name='accountNumber'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Number'
                  placeholder='ACC-12345'
                  {...(errors.accountNumber && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Balance */}
            <Controller
              name='balance'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label='Balance'
                  placeholder='50000'
                  {...(errors.balance && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Account Details */}
            <Controller
              name='accountDetails'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Account Details'
                  placeholder='Main Cash'
                  {...(errors.accountDetails && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Added By */}
            <Controller
              name='addedBy'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Added By'
                  placeholder='Admin'
                  {...(errors.addedBy && { error: true, helperText: 'This field is required.' })}
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

export default AddAccounts
