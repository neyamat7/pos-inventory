// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

//action import
import { createSupplier } from '@/actions/supplierAction'

const AddSupplierDrawer = props => {
  const { open, handleClose, setData, supplierData } = props

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      sl: '',
      name: '',
      email: '',
      avatar: '',
      phone: '',
      location: '',
      accountNumber: '',
      balance: '0',
      due: '0',
      cost: '0',
      crate1: '0',
      crate1Price: '0',
      crate2: '0',
      crate2Price: '0'
    }
  })

  const onSubmit = async data => {
    const supplierData = {
      basic_info: {
        sl: data.sl,
        name: data.name,
        avatar: data.avatar,
        role: 'supplier'
      },
      contact_info: {
        email: data.email,
        phone: data.phone,
        location: data.location
      },
      account_info: {
        accountNumber: data.accountNumber,
        balance: Number(data.balance),
        due: Number(data.due),
        cost: Number(data.cost)
      },
      crate_info: {
        crate1: Number(data.crate1),
        crate1Price: Number(data.crate1Price),
        remainingCrate1: Number(data.crate1),
        crate2: Number(data.crate2),
        crate2Price: Number(data.crate2Price),
        remainingCrate2: Number(data.crate2)
      }
    }

    const result = await createSupplier(supplierData)

    if (result.success) {
      setData(prev => [...prev, result.data.data])
      reset()
      handleClose()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleReset = () => {
    reset()
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 420 } } }}
    >
      <div className='flex items-center justify-between pli-6 plb-5'>
        <Typography variant='h5'>Add Supplier</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Typography color='text.primary' className='font-medium'>
              Basic Info
            </Typography>

            <Controller
              name='sl'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label='SL'
                  placeholder='SUP001'
                  fullWidth
                  {...(errors.sl && { error: true, helperText: 'Required' })}
                />
              )}
            />

            <Controller
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label='Name'
                  placeholder='Rahim Traders'
                  fullWidth
                  {...(errors.name && { error: true, helperText: 'Required' })}
                />
              )}
            />

            <Controller
              name='avatar'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} label='Avatar URL' placeholder='https://example.com/avatar.jpg' fullWidth />
              )}
            />

            <Typography color='text.primary' className='font-medium'>
              Contact Info
            </Typography>

            <Controller
              name='email'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} type='email' label='Email' placeholder='rahimtraders@gmail.com' fullWidth />
              )}
            />

            <Controller
              name='phone'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} label='Phone' placeholder='+8801711000001' fullWidth />
              )}
            />

            <Controller
              name='location'
              control={control}
              render={({ field }) => <CustomTextField {...field} label='Location' placeholder='Chandpur' fullWidth />}
            />

            <Typography color='text.primary' className='font-medium'>
              Account Info
            </Typography>

            <Controller
              name='accountNumber'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} label='Account Number' placeholder='123456789' fullWidth />
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='balance'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} type='number' label='Balance' placeholder='0' fullWidth />
                )}
              />
              <Controller
                name='due'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} type='number' label='Due' placeholder='0' fullWidth />
                )}
              />
            </div>

            <Controller
              name='cost'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} type='number' label='Cost' placeholder='0' fullWidth />
              )}
            />

            <Typography color='text.primary' className='font-medium'>
              Crate Info
            </Typography>

            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='crate1'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} type='number' label='Crate 1 Qty' placeholder='0' fullWidth />
                )}
              />
              <Controller
                name='crate1Price'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} type='number' label='Crate 1 Price' placeholder='0' fullWidth />
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='crate2'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} type='number' label='Crate 2 Qty' placeholder='0' fullWidth />
                )}
              />
              <Controller
                name='crate2Price'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} type='number' label='Crate 2 Price' placeholder='0' fullWidth />
                )}
              />
            </div>

            <div className='flex items-center gap-4 mt-2'>
              <Button variant='contained' type='submit'>
                Add Supplier
              </Button>
              <Button variant='tonal' color='error' type='button' onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AddSupplierDrawer
