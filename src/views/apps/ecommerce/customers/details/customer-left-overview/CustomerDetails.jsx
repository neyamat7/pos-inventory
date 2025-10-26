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
import { Wallet, AlertTriangle, Package, ChevronDown, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react'

// Components
import CustomAvatar from '@core/components/mui/Avatar'
import EditCustomerInfo from '../EditCustomerInfo'

// -------------------------------------------------------------
// Component
// -------------------------------------------------------------
const CustomerDetails = ({ customerData }) => {
  const [isCrateHovered, setIsCrateHovered] = useState(false)
  const [crateLocked, setCrateLocked] = useState(false)
  const [open, setOpen] = useState(false)
  

  // console.log('in details', customerData)

  const buttonProps = {
    variant: 'contained',
    children: 'Edit Details'
  }

  // Calculate total crates from new data structure
  const totalCrates = (customerData?.crate_info?.type_1 || 0) + (customerData?.crate_info?.type_2 || 0)

  const isExpanded = isCrateHovered || crateLocked

  return (
    <Card className='w-full'>
      <CardContent className='flex flex-col md:flex-row items-start gap-8 p-6'>
        {/* ----------------------------- */}
        {/* LEFT SIDE — Profile & Contact Summary */}
        {/* ----------------------------- */}
        <div className='flex flex-col items-center gap-4 w-full md:w-1/3'>
          {/* Avatar */}
          <CustomAvatar
            src={customerData?.basic_info?.avatar}
            variant='rounded'
            alt='Customer Avatar'
            size={120}
            className='shadow-md'
          />

          {/* Name + ID */}
          <div className='text-center'>
            <Typography variant='h5' className='font-semibold'>
              {customerData?.basic_info?.name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Customer ID #{customerData?.basic_info?.sl}
            </Typography>
            <Chip label={customerData?.basic_info?.role || 'customer'} color='primary' size='small' className='mt-2' />
          </div>

          {/* Contact Information */}
          <div className='w-full bg-gray-50 rounded-lg p-4 space-y-3'>
            <Typography variant='h6' className='font-medium flex items-center gap-2 justify-center'>
              Contact Information
            </Typography>

            <div className='space-y-2 flex flex-col items-center'>
              <div className='flex items-center gap-2'>
                <Mail size={16} className='text-textSecondary' />
                <Typography variant='body2'>{customerData?.contact_info?.email || 'No email'}</Typography>
              </div>

              <div className='flex items-center gap-2'>
                <Phone size={16} className='text-textSecondary' />
                <Typography variant='body2'>{customerData?.contact_info?.phone || 'No phone'}</Typography>
              </div>

              <div className='flex items-center gap-2'>
                <MapPin size={16} className='text-textSecondary' />
                <Typography variant='body2'>{customerData?.contact_info?.location || 'No location'}</Typography>
              </div>
            </div>
          </div>

          {/* Info Section: Balance, Due, Total Crate */}
          <div className='flex flex-wrap justify-center items-start gap-3 mt-4'>
            {/* Balance */}
            <div className='flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition'>
              <CustomAvatar variant='rounded' skin='light' color='success'>
                <Wallet size={20} />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>৳{customerData?.account_info?.balance || 0}</Typography>
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
                <Typography variant='h6'>৳{customerData?.account_info?.due || 0}</Typography>
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
                  <p>
                    • Type 1: {customerData?.crate_info?.type_1 || 0} pcs (৳
                    {customerData?.crate_info?.type_1_price || 0})
                  </p>
                  <p>
                    • Type 2: {customerData?.crate_info?.type_2 || 0} pcs (৳
                    {customerData?.crate_info?.type_2_price || 0})
                  </p>
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
        {/* RIGHT SIDE — Account & Crate Information */}
        {/* ----------------------------- */}
        <div className='flex flex-col flex-1 gap-6'>
          <Typography variant='h5' className='font-semibold'>
            Account & Crate Details
          </Typography>
          <Divider />

          {/* Account Information Section */}
          <div>
            <Typography variant='h6' className='font-medium mb-3 flex items-center gap-2'>
              <CreditCard size={18} />
              Account Information
            </Typography>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Account Number
                </Typography>
                <Typography
                  variant='h6'
                  className={!customerData?.account_info?.account_number ? 'text-textSecondary' : ''}
                >
                  {customerData?.account_info?.account_number || 'Not assigned'}
                </Typography>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Current Balance
                </Typography>
                <Typography variant='h6' className='text-success'>
                  ৳{customerData?.account_info?.balance?.toLocaleString() || 0}
                </Typography>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Due Amount
                </Typography>
                <Typography
                  variant='h6'
                  className={customerData?.account_info?.due > 0 ? 'text-error' : 'text-textSecondary'}
                >
                  ৳{customerData?.account_info?.due?.toLocaleString() || 0}
                </Typography>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Return Amount
                </Typography>
                <Typography variant='h6'>
                  ৳{customerData?.account_info?.return_amount?.toLocaleString() || 0}
                </Typography>
              </div>
            </div>
          </div>

          <Divider />

          {/* Crate Information Section */}
          <div>
            <Typography variant='h6' className='font-medium mb-3 flex items-center gap-2'>
              <Package size={18} />
              Crate Information
            </Typography>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Type 1 Quantity
                </Typography>
                <Typography variant='h6'>{customerData?.crate_info?.type_1 || 0} pcs</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Price: ৳{customerData?.crate_info?.type_1_price || 0}
                </Typography>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Type 2 Quantity
                </Typography>
                <Typography variant='h6'>{customerData?.crate_info?.type_2 || 0} pcs</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Price: ৳{customerData?.crate_info?.type_2_price || 0}
                </Typography>
              </div>

              <div className='sm:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Total Crates Value
                </Typography>
                <Typography variant='h6' className='text-primary'>
                  ৳
                  {(
                    (customerData?.crate_info?.type_1 || 0) * (customerData?.crate_info?.type_1_price || 0) +
                    (customerData?.crate_info?.type_2 || 0) * (customerData?.crate_info?.type_2_price || 0)
                  ).toLocaleString()}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total of {totalCrates} crates
                </Typography>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className='mt-4'>
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
