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

const initialCrateRow = () => ({ id: crypto.randomUUID(), type: '', qty: '', price: '' })

const AddCustomerDrawer = props => {
  const { open, handleClose, setData, customerData } = props

  // Local state for dynamic crate rows
  const [crateRows, setCrateRows] = useState([initialCrateRow()])

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
      balance: '',
      due: '',
      cost: '',
      location: ''
    }
  })

  const addCrateRow = () => setCrateRows(prev => [...prev, initialCrateRow()])
  const removeCrateRow = id => setCrateRows(prev => prev.filter(r => r.id !== id))

  const updateCrateRow = (id, field, value) =>
    setCrateRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)))

  const buildCrateInfo = () => {
    const crateInfo = {}

    crateRows.forEach((row, index) => {
      if (row.type && row.type.trim()) {
        const typeKey = `type_${index + 1}`

        crateInfo[typeKey] = Number(row.qty || 0)
        crateInfo[`${typeKey}_price`] = Number(row.price || 0)
      }
    })

    return crateInfo
  }

  const onSubmit = async data => {
    try {
      // Prepare customer data according to MongoDB model structure
      const customerPayload = {
        // ← Rename this variable to avoid conflict
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
          account_number: '',
          balance: Number(data.balance || 0),
          due: Number(data.due || 0),
          return_amount: Number(data.cost || 0)
        },

        // Crate Information
        crate_info: buildCrateInfo()
      }

      // Call the server action
      const result = await createCustomer(customerPayload) // ← Use the renamed variable

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

        setData([...(customerData ?? []), newCustomer]) // ← Now this works
        reset()
        setCrateRows([initialCrateRow()])
        handleClose()

        console.log('Customer created successfully!', result.data)
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
    setCrateRows([initialCrateRow()])
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
              name='image'
              control={control}
              rules={{ required: false }}
              render={({ field }) => (
                <CustomTextField {...field} label='Avatar URL' placeholder='https://example.com/avatar.jpg' fullWidth />
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
                  <CustomTextField {...field} type='number' label='Due (Dua)' placeholder='2000' fullWidth />
                )}
              />
            </div>

            <Controller
              name='cost'
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} type='number' label='Cost (Return Amount)' placeholder='0' fullWidth />
              )}
            />

            <Controller
              name='location'
              control={control}
              render={({ field }) => <CustomTextField {...field} label='Location' placeholder='Australia' fullWidth />}
            />

            {/* Crate Editor */}
            <div className='flex items-center justify-between'>
              <Typography color='text.primary' className='font-medium'>
                Crate Information
              </Typography>
              <Button size='small' variant='tonal' onClick={addCrateRow} startIcon={<i className='tabler-plus' />}>
                Add Type
              </Button>
            </div>

            <div className='flex flex-col gap-3'>
              {crateRows.map((row, idx) => (
                <div key={row.id} className='grid grid-cols-12 gap-3 items-end'>
                  <CustomTextField
                    className='col-span-5'
                    label='Type'
                    placeholder={`type_${idx + 1}`}
                    value={row.type}
                    onChange={e => updateCrateRow(row.id, 'type', e.target.value)}
                  />
                  <CustomTextField
                    className='col-span-3'
                    type='number'
                    label='Qty'
                    placeholder='0'
                    value={row.qty}
                    onChange={e => updateCrateRow(row.id, 'qty', e.target.value)}
                  />
                  <CustomTextField
                    className='col-span-3'
                    type='number'
                    label='Price'
                    placeholder='0'
                    value={row.price}
                    onChange={e => updateCrateRow(row.id, 'price', e.target.value)}
                  />
                  <Button
                    className='col-span-1'
                    color='error'
                    variant='tonal'
                    onClick={() => removeCrateRow(row.id)}
                    disabled={crateRows.length === 1}
                  >
                    <i className='tabler-trash' />
                  </Button>
                </div>
              ))}
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
