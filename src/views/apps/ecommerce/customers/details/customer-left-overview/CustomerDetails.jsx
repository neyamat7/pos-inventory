'use client'

// MUI Imports
import { useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import EditCustomerInfo from '../EditCustomerInfo'

// import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const CustomerDetails = ({ customerData }) => {
  const [open, setOpen] = useState(false)

  // Vars
  const buttonProps = {
    variant: 'contained',
    children: 'Edit Details'
  }

  const handleUpdateCustomer = () => {
    console.log('update customer')
  }

  return (
    <Card>
      <CardContent className='flex flex-col pbs-12 gap-6'>
        <div className='flex flex-col justify-self-center items-center gap-6'>
          <div className='flex flex-col items-center gap-4'>
            <CustomAvatar src={customerData?.image} variant='rounded' alt='Customer Avatar' size={120} />
            <div className='flex flex-col items-center text-center'>
              <Typography variant='h5'>{customerData?.name}</Typography>
              <Typography>Customer ID #{customerData?.sl}</Typography>
            </div>
          </div>
          <div className='flex items-center justify-around gap-4 flex-wrap is-full'>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary'>
                <i className='tabler-shopping-cart' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{customerData?.orders}</Typography>
                <Typography>Orders</Typography>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color='primary'>
                <i className='tabler-currency-dollar' />
              </CustomAvatar>
              <div>
                <Typography variant='h5'>${customerData?.totalSpent}</Typography>
                <Typography>Spent</Typography>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Details</Typography>
          <Divider />
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Username:
              </Typography>
              <Typography>{customerData?.name}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Billing Email:
              </Typography>
              <Typography>{customerData?.email}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Status:
              </Typography>
              <Chip label='Active' variant='tonal' color='success' size='small' />
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Contact:
              </Typography>
              <Typography>{customerData.phone}</Typography>
            </div>
            <div className='flex items-center gap-1'>
              <Typography color='text.primary' className='font-medium'>
                Country:
              </Typography>
              <Typography>{customerData?.location}</Typography>
            </div>
          </div>
        </div>

        <Button {...buttonProps} onClick={() => setOpen(true)} />

        <EditCustomerInfo
          open={open}
          handleClose={() => setOpen(false)}
          customerData={customerData}
          onSave={handleUpdateCustomer}
        />
      </CardContent>
    </Card>
  )
}

export default CustomerDetails
