'use client'

// React
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Lucide Icons
import { Wallet, AlertTriangle, Package, ChevronDown } from 'lucide-react'

// Components
import CustomAvatar from '@core/components/mui/Avatar'
import EditCustomerInfo from '../EditCustomerInfo'

// -------------------------------------------------------------
// 📘 Component
// -------------------------------------------------------------
const CustomerDetails = ({ customerData }) => {
  const [isCrateHovered, setIsCrateHovered] = useState(false)
  const [crateLocked, setCrateLocked] = useState(false)
  const [open, setOpen] = useState(false)

  const buttonProps = {
    variant: 'contained',
    children: 'Edit Details'
  }

  // 🧮 Calculate total crates
  const totalCrates = (customerData?.crate?.type_one?.qty || 0) + (customerData?.crate?.type_two?.qty || 0)

  const isExpanded = isCrateHovered || crateLocked

  return (
    <Card className='w-full'>
      <CardContent className='flex flex-col md:flex-row items-start gap-8 p-6'>
        {/* ----------------------------- */}
        {/* LEFT SIDE — Profile Summary */}
        {/* ----------------------------- */}
        <div className='flex flex-col items-center gap-4 w-full md:w-1/3'>
          {/* Avatar */}
          <CustomAvatar
            src={customerData?.image}
            variant='rounded'
            alt='Customer Avatar'
            size={120}
            className='shadow-md'
          />

          {/* Name + ID */}
          <div className='text-center'>
            <Typography variant='h5' className='font-semibold'>
              {customerData?.name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Customer ID #{customerData?.sl}
            </Typography>
          </div>

          {/* Info Section: Balance, Due, Total Crate */}
          <div className='flex flex-wrap justify-center items-start gap-6 mt-4'>
            {/* Balance */}
            <div className='flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition'>
              <CustomAvatar variant='rounded' skin='light' color='success'>
                <Wallet size={20} />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>৳{customerData?.balance || 0}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Balance
                </Typography>
              </div>
            </div>

            {/* Due */}
            <div className='flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition'>
              <CustomAvatar variant='rounded' skin='light' color='error'>
                <AlertTriangle size={20} />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>৳{customerData?.due || 0}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Due
                </Typography>
              </div>
            </div>

            {/* Total Crates */}
            <div
              className='flex flex-col items-start bg-gray-50 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition relative'
              onMouseEnter={() => setIsCrateHovered(true)}
              onMouseLeave={() => setIsCrateHovered(false)}
            >
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' skin='light' color='primary'>
                  <Package size={20} />
                </CustomAvatar>
                <div>
                  <Typography variant='h6'>{totalCrates}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Crates
                  </Typography>
                </div>
                {/* Toggle button */}
                <button
                  onClick={() => setCrateLocked(prev => !prev)}
                  className='ml-1 text-gray-500 hover:text-blue-600 transition-transform'
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`}
                  />
                </button>
              </div>

              {/* Collapsible Breakdown */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-32 mt-2 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className='text-sm text-gray-600 ml-10 leading-tight space-y-1'>
                  <p>• Type 1: {customerData?.crate?.type_one?.qty || 0} pcs</p>
                  <p>• Type 2: {customerData?.crate?.type_two?.qty || 0} pcs</p>
                </div>
              </div>

              {/* Subtle glow on hover */}
              <div
                className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-300 ${
                  isExpanded ? 'ring-2 ring-blue-200/40' : 'ring-0'
                }`}
              ></div>
            </div>
          </div>
        </div>

        {/* Divider for horizontal layout */}
        <Divider orientation='vertical' flexItem className='hidden md:block mx-2' />

        {/* ----------------------------- */}
        {/* RIGHT SIDE — Details */}
        {/* ----------------------------- */}
        <div className='flex flex-col flex-1 gap-4'>
          <Typography variant='h5' className='font-semibold'>
            Details
          </Typography>
          <Divider />

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {/* Username */}
            <div>
              <Typography color='text.primary' className='font-medium'>
                Username:
              </Typography>
              <Typography>{customerData?.name || '-'}</Typography>
            </div>

            {/* Email */}
            <div>
              <Typography color='text.primary' className='font-medium'>
                Billing Email:
              </Typography>
              <Typography>{customerData?.email || '-'}</Typography>
            </div>

            {/* Phone */}
            <div>
              <Typography color='text.primary' className='font-medium'>
                Contact:
              </Typography>
              <Typography>{customerData?.phone || '-'}</Typography>
            </div>

            {/* Location */}
            <div className='sm:col-span-2'>
              <Typography color='text.primary' className='font-medium'>
                Country:
              </Typography>
              <Typography>{customerData?.location || '-'}</Typography>
            </div>
          </div>

          {/* Edit Button */}
          <div className='mt-6'>
            <Button {...buttonProps} onClick={() => setOpen(true)} />
          </div>

          {/* Edit Dialog */}
          <EditCustomerInfo
            open={open}
            handleClose={() => setOpen(false)}
            customerData={customerData}
            onSave={() => console.log('Customer updated')}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerDetails
