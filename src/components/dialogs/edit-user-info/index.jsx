'use client'

// React Imports
import { useState } from 'react'

import { unstable_noStore as noStore } from 'next/cache'

// MUI Imports
import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import { FormControlLabel } from '@mui/material'

// Component Imports
import { useForm } from 'react-hook-form'

import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'
import { updateSupplierById } from '@/app/server/actions'

const initialData = {
  firstName: 'Oliver',
  lastName: 'Queen',
  userName: 'oliverQueen',
  billingEmail: 'oliverQueen@gmail.com',
  status: 'active',
  taxId: 'Tax-8894',
  contact: '+ 1 609 933 4422',
  language: ['English'],
  country: 'US',
  useAsBillingAddress: true
}

const status = ['Status', 'Active', 'Inactive', 'Suspended']
const languages = ['English', 'Spanish', 'French', 'German', 'Hindi']
const countries = ['Select Country', 'France', 'Russia', 'China', 'UK', 'US']

const EditUserInfo = ({ open, setOpen, supplierData }) => {
  noStore()

  // States
  const [userData, setUserData] = useState(supplierData || [])
  const router = useRouter()

  // console.log('in edit popup', supplierData)
  const [crate, setCrate] = useState(userData.crate)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: supplierData?.name || '',
      email: supplierData?.email || '',
      image: supplierData?.image || '',
      balance: supplierData?.balance || '',
      location: supplierData?.location || '',
      crate: {
        type1: {
          qty: supplierData?.crate?.type1?.qty || 0,
          price: supplierData?.crate?.type1?.price || 0
        },
        type2: {
          qty: supplierData?.crate?.type2?.qty || 0,
          price: supplierData?.crate?.type2?.price || 0
        }
      }
    }
  })

  const handleChange = (type, value) => {
    const updatedCrate = {
      ...crate,
      [type]: { ...crate[type], qty: Number(value) }
    }

    setCrate(updatedCrate)

    // console.log('updatedCrate', updatedCrate)
  }

  const handleClose = () => {
    setOpen(false)
    setUserData(supplierData || [])
  }

  const handleSave = async formData => {
    const updatedSupplier = {
      ...supplierData,
      ...formData,
      crate: {
        ...supplierData.crate,
        ...formData.crate
      }
    }

    // console.log(updatedSupplier)
    await updateSupplierById(supplierData.sl, updatedSupplier)
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        Edit User Information
        <Typography component='span' className='flex flex-col text-center'>
          Updating user details will receive a privacy audit.
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(handleSave)}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField fullWidth label='Supplier Name' placeholder='Supplier Name' {...register('name')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField fullWidth label='Email' placeholder='Supplier Email' {...register('email')} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField fullWidth label='Image Url' placeholder='Supplier image url' {...register('image')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField fullWidth label='Balance' placeholder='Balance' {...register('balance')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <p>Crates</p>
              <div className='flex flex-col justify-between gap-3'>
                <div className='flex justify-between gap-4'>
                  <CustomTextField
                    label='Type 1 Qty'
                    type='number'
                    {...register('crate.type1.qty', { valueAsNumber: true })}
                  />
                  <CustomTextField
                    label='Type 1 Price'
                    type='number'
                    {...register('crate.type1.price', { valueAsNumber: true })}
                  />
                </div>
                <div className='flex justify-between gap-4'>
                  <CustomTextField
                    label='Type 2 Qty'
                    type='number'
                    {...register('crate.type2.qty', { valueAsNumber: true })}
                  />
                  <CustomTextField
                    label='Type 2 Price'
                    type='number'
                    {...register('crate.type2.price', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField fullWidth label='Location' placeholder='Location' {...register('location')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' onClick={handleClose} type='submit'>
            Submit
          </Button>
          <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditUserInfo
