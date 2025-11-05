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
import { createCustomer } from '@/actions/customerActions'
import { showSuccess } from '@/utils/toastUtils'

const AddCustomerDrawer = props => {
  const { open, handleClose, setData, customerData } = props

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
      image: '',
      phone: '',
      location: '',
      account_number: '',
      balance: '',
      due: '',
      cost: '',
      type_1_qty: '',
      type_1_price: '',
      type_2_qty: '',
      type_2_price: ''
    }
  })

  const onSubmit = async data => {
    try {
      // Prepare customer data according to MongoDB model structure
      const customerPayload = {
        // Basic Information
        basic_info: {
          sl: data.sl.toString(),
          name: data.name.trim(),
          role: 'customer',
          avatar: data.image?.trim() || ''
        },

        // Contact Information
        contact_info: {
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          location: data.location?.trim() || ''
        },

        // Account & Balance Information
        account_info: {
          account_number: data.account_number?.trim() || '',
          balance: Number(data.balance || 0),
          due: Number(data.due || 0),
          return_amount: Number(data.cost || 0)
        },

        // Crate Information
        crate_info: {
          type_1: Number(data.type_1_qty || 0),
          type_1_price: Number(data.type_1_price || 0),
          type_2: Number(data.type_2_qty || 0),
          type_2_price: Number(data.type_2_price || 0)
        }
      }

      // Call the server action
      const result = await createCustomer(customerPayload)

      if (result.success) {
        // Update local state with new customer data
        const newCustomer = {
          id: result.data._id || Date.now(),
          basic_info: customerPayload.basic_info,
          contact_info: customerPayload.contact_info,
          account_info: customerPayload.account_info,
          crate_info: customerPayload.crate_info,
          createdAt: new Date().toISOString()
        }

        setData([...(customerData ?? []), newCustomer])
        reset()
        handleClose()

        // console.log('Customer created successfully!', result.data)
        showSuccess('Customer created successfully!')
      } else {
        console.error('Failed to create customer:', result.error)
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error in onSubmit:', error)
      alert('Failed to create customer. Please try again.')
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
        <Typography variant='h5'>Add Customer</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
        <div className='p-6'>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            {/* Basic Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Basic Information
            </Typography>

            <Controller
              name='sl'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  type='number'
                  label='SL'
                  placeholder='1'
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
                  placeholder='Stanfield Baser'
                  fullWidth
                  {...(errors.name && { error: true, helperText: 'Required' })}
                />
              )}
            />

            <Controller
              name='image'
              control={control}
              rules={{ required: false }}
              render={({ field }) => (
                <CustomTextField {...field} label='Avatar URL' placeholder='https://example.com/avatar.jpg' fullWidth />
              )}
            />

            {/* Contact Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Contact Information
            </Typography>

            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  type='email'
                  label='Email'
                  placeholder='sbaser0@boston.com'
                  fullWidth
                  {...(errors.email && { error: true, helperText: 'Required' })}
                />
              )}
            />

            <Controller
              name='phone'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  label='Phone'
                  placeholder='+8801711000001'
                  fullWidth
                  {...(errors.phone && { error: true, helperText: 'Required' })}
                />
              )}
            />

            <Controller
              name='location'
              control={control}
              render={({ field }) => <CustomTextField {...field} label='Location' placeholder='Australia' fullWidth />}
            />

            {/* Account Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Account Information
            </Typography>

            <Controller
              name='account_number'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} label='Account Number' placeholder='ACC001' fullWidth />
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
                  <CustomTextField {...field} type='number' label='Due' placeholder='2000' fullWidth />
                )}
              />
            </div>

            <Controller
              name='cost'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} type='number' label='Return Amount' placeholder='0' fullWidth />
              )}
            />

            {/* Crate Information Section */}
            <Typography color='text.primary' className='font-medium'>
              Crate Information
            </Typography>

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  Type 1
                </Typography>
                <Controller
                  name='type_1_qty'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Quantity' placeholder='0' fullWidth />
                  )}
                />
                <Controller
                  name='type_1_price'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Price' placeholder='0' fullWidth />
                  )}
                />
              </div>

              <div className='flex flex-col gap-3'>
                <Typography variant='body2' color='text.secondary'>
                  Type 2
                </Typography>
                <Controller
                  name='type_2_qty'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Quantity' placeholder='0' fullWidth />
                  )}
                />
                <Controller
                  name='type_2_price'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} type='number' label='Price' placeholder='0' fullWidth />
                  )}
                />
              </div>
            </div>

            <div className='flex items-center gap-4 mt-2'>
              <Button variant='contained' type='submit'>
                Add Customer
              </Button>
              <Button variant='tonal' color='error' type='button' onClick={handleReset}>
                Discard
              </Button>
            </div>
          </form>
        </div>
      </PerfectScrollbar>
    </Drawer>
  )
}

export default AddCustomerDrawer
