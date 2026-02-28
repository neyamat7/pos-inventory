'use client'

// React
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Lucide Icons
import { AlertTriangle, ChevronDown, CreditCard, Mail, MapPin, Package, Phone, Wallet } from 'lucide-react'

// Components
import CustomAvatar from '@core/components/mui/Avatar'
import EditSupplierInfo from './EditSupplierInfo'

// -------------------------------------------------------------
// Component
// -------------------------------------------------------------
const SupplierDetails = ({ supplierData, onRefresh }) => {
  const [isCrateHovered, setIsCrateHovered] = useState(false)
  const [crateLocked, setCrateLocked] = useState(false)
  const [open, setOpen] = useState(false)

  const buttonProps = {
    variant: 'contained',
    children: 'Edit Details'
  }

  // Calculate total crates from supplier data structure
  const totalCrates = (supplierData?.crate_info?.crate1 || 0) + (supplierData?.crate_info?.crate2 || 0)

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
            src={supplierData?.basic_info?.avatar}
            variant='rounded'
            alt='Supplier Avatar'
            size={120}
            className='shadow-md'
          />

          {/* Name + ID */}
          <div className='text-center'>
            <Typography variant='h5' className='font-semibold'>
              {supplierData?.basic_info?.name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Supplier ID #{supplierData?.basic_info?.sl}
            </Typography>
            <Chip label={supplierData?.basic_info?.role || 'supplier'} color='primary' size='small' className='mt-2' />
          </div>

          {/* Contact Information */}
          <div className='w-full bg-gray-50 rounded-lg p-4 space-y-3'>
            <Typography variant='h6' className='font-medium flex items-center gap-2 justify-center'>
              Contact Information
            </Typography>

            <div className='space-y-2 flex flex-col items-center'>
              <div className='flex items-center gap-2'>
                <Mail size={16} className='text-textSecondary' />
                <Typography variant='body2'>{supplierData?.contact_info?.email || 'No email'}</Typography>
              </div>

              <div className='flex items-center gap-2'>
                <Phone size={16} className='text-textSecondary' />
                <Typography variant='body2'>{supplierData?.contact_info?.phone || 'No phone'}</Typography>
              </div>

              <div className='flex items-center gap-2'>
                <MapPin size={16} className='text-textSecondary' />
                <Typography variant='body2'>{supplierData?.contact_info?.location || 'No location'}</Typography>
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
                <Typography variant='h6'>৳{supplierData?.account_info?.balance || 0}</Typography>
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
                <Typography variant='h6'>৳{supplierData?.account_info?.due || 0}</Typography>
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
                    • Crate 1: {supplierData?.crate_info?.crate1 || 0} pcs (৳
                    {supplierData?.crate_info?.crate1Price || 0})
                  </p>
                  <p>
                    • Crate 2: {supplierData?.crate_info?.crate2 || 0} pcs (৳
                    {supplierData?.crate_info?.crate2Price || 0})
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
                  className={!supplierData?.account_info?.accountNumber ? 'text-textSecondary' : ''}
                >
                  {supplierData?.account_info?.accountNumber || 'Not assigned'}
                </Typography>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Current Balance
                </Typography>
                <Typography variant='h6' className='text-success'>
                  ৳{supplierData?.account_info?.balance?.toLocaleString() || 0}
                </Typography>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Due Amount
                </Typography>
                <Typography
                  variant='h6'
                  className={supplierData?.account_info?.due > 0 ? 'text-error' : 'text-textSecondary'}
                >
                  ৳{supplierData?.account_info?.due?.toLocaleString() || 0}
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
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pl-6'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Crate 1 Quantity
                </Typography>
                <Typography variant='h6'>{supplierData?.crate_info?.crate1 || 0} pcs</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Price: ৳{supplierData?.crate_info?.crate1Price || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Need to give: {supplierData?.crate_info?.needToGiveCrate1 || 0} pcs
                </Typography>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Crate 2 Quantity
                </Typography>
                <Typography variant='h6'>{supplierData?.crate_info?.crate2 || 0} pcs</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Price: ৳{supplierData?.crate_info?.crate2Price || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Need to give: {supplierData?.crate_info?.needToGiveCrate2 || 0} pcs
                </Typography>
              </div>

              <div className='sm:col-span-1 bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <Typography color='text.primary' className='font-medium mb-1'>
                  Total Crates Value
                </Typography>
                <Typography variant='h6' className='text-primary'>
                  ৳
                  {(
                    (supplierData?.crate_info?.crate1 || 0) * (supplierData?.crate_info?.crate1Price || 0) +
                    (supplierData?.crate_info?.crate2 || 0) * (supplierData?.crate_info?.crate2Price || 0)
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
          <EditSupplierInfo
            open={open}
            handleClose={() => setOpen(false)}
            supplierData={supplierData}
            onSave={() => {
              if (onRefresh) onRefresh()
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default SupplierDetails
