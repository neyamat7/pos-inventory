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

  const buildCrateObject = () => {
    const crate = {}

    crateRows.forEach(r => {
      const t = (r.type || '').trim()

      if (!t) return
      crate[t] = {
        qty: Number(r.qty || 0),
        price: Number(r.price || 0)
      }
    })

    return crate
  }

  const onSubmit = data => {
    const newCustomer = {
      sl: Number(data.sl),
      image: data.image?.trim() || '',
      name: data.name?.trim(),
      email: data.email?.trim(),
      type: 'Customer',
      phone: data.phone?.trim(),
      balance: Number(data.balance || 0),
      due: Number(data.due || 0),
      crate: buildCrateObject(),
      cost: Number(data.cost || 0),

      // optional fields you didn't request, set sanely or drop:
      orders: 0,
      totalSpent: 0,
      location: data.location?.trim() || ''
    }

    setData([...(customerData ?? []), newCustomer])
    reset()
    setCrateRows([initialCrateRow()])
    handleClose()
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
                <CustomTextField
                  {...field}
                  label='Image URL'
                  placeholder='https://i.postimg.cc/GpXVckNg/images-3.jpg'
                  fullWidth
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
                <CustomTextField {...field} type='number' label='Cost' placeholder='0' fullWidth />
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
                Crate
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
                    placeholder={`type${idx + 1}`}
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
                Add
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
