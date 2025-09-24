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
  date: '',
  referenceNo: '',
  location: '',
  adjustmentType: '',
  totalAmount: '',
  totalAmountRecovered: '',
  reason: '',
  addedBy: ''
}

const AddStockAdjustments = props => {
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
      referenceNo: data.referenceNo,
      location: data.location,
      adjustmentType: data.adjustmentType,
      totalAmount: Number(data.totalAmount),
      totalAmountRecovered: Number(data.totalAmountRecovered),
      reason: data.reason,
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
        <Typography variant='h5'>Add Stock Adjustment</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Adjustment Information
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
                  label='Adjustment Date'
                  InputLabelProps={{ shrink: true }}
                  {...(errors.date && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Reference No */}
            <Controller
              name='referenceNo'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Reference No'
                  placeholder='REF-1001'
                  {...(errors.referenceNo && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Location */}
            <Controller
              name='location'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Location'
                  placeholder='Warehouse A'
                  {...(errors.location && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Adjustment Type */}
            <Controller
              name='adjustmentType'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  id='adjustmentType'
                  label='Adjustment Type'
                  {...field}
                  {...(errors.adjustmentType && { error: true, helperText: 'This field is required.' })}
                >
                  <MenuItem value='Damage'>Damage</MenuItem>
                  <MenuItem value='Expiry'>Expiry</MenuItem>
                  <MenuItem value='Shortage'>Shortage</MenuItem>
                  <MenuItem value='Surplus'>Surplus</MenuItem>
                </CustomTextField>
              )}
            />

            {/* Total Amount */}
            <Controller
              name='totalAmount'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label='Total Amount'
                  placeholder='5000'
                  {...(errors.totalAmount && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Total Amount Recovered */}
            <Controller
              name='totalAmountRecovered'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  type='number'
                  label='Total Amount Recovered'
                  placeholder='2000'
                  {...(errors.totalAmountRecovered && { error: true, helperText: 'This field is required.' })}
                />
              )}
            />

            {/* Reason */}
            <Controller
              name='reason'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={2}
                  label='Reason'
                  placeholder='Enter reason for adjustment'
                  {...(errors.reason && { error: true, helperText: 'This field is required.' })}
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

            {/* Switch (keep same as before) */}
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

export default AddStockAdjustments
