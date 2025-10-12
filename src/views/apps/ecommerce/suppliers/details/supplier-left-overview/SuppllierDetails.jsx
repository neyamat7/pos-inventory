// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

const SupplierDetails = ({ supplierData }) => {
  const buttonProps = {
    variant: 'contained',
    children: 'Edit Details'
  }

  return (
    <Card className='w-full'>
      <CardContent className='flex flex-col md:flex-row items-start gap-8 p-6'>
        {/* Left Side - Avatar & Summary */}
        <div className='flex flex-col items-center gap-4 w-full md:w-1/3'>
          <CustomAvatar src={supplierData?.image} variant='rounded' alt='Supplier Avatar' size={120} />
          <div className='text-center'>
            <Typography variant='h5' className='font-semibold'>
              {supplierData?.name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Supplier ID #{supplierData?.sl}
            </Typography>
          </div>

          <div className='flex justify-center items-center gap-6 mt-4'>
            {/* Orders */}
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color='primary'>
                <i className='tabler-shopping-cart' />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>{supplierData?.orders || 0}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Orders
                </Typography>
              </div>
            </div>

            {/* Spent */}
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color='primary'>
                <i className='tabler-currency-dollar' />
              </CustomAvatar>
              <div>
                <Typography variant='h6'>৳{supplierData?.totalSpent || 0}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Spent
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Divider for horizontal layout */}
        <Divider orientation='vertical' flexItem className='hidden md:block mx-2' />

        {/* Right Side - Details */}
        <div className='flex flex-col flex-1 gap-4'>
          <Typography variant='h5' className='font-semibold'>
            Details
          </Typography>
          <Divider />

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <Typography color='text.primary' className='font-medium'>
                Username:
              </Typography>
              <Typography>{supplierData?.name || '-'}</Typography>
            </div>

            <div>
              <Typography color='text.primary' className='font-medium'>
                Billing Email:
              </Typography>
              <Typography>{supplierData?.email || '-'}</Typography>
            </div>

            <div>
              <Typography color='text.primary' className='font-medium'>
                Status:
              </Typography>
              <Chip label='Active' variant='tonal' color='success' size='small' />
            </div>

            <div>
              <Typography color='text.primary' className='font-medium'>
                Contact:
              </Typography>
              <Typography>{supplierData?.phone || '-'}</Typography>
            </div>

            <div className='sm:col-span-2'>
              <Typography color='text.primary' className='font-medium'>
                Location:
              </Typography>
              <Typography>{supplierData?.location || '-'}</Typography>
            </div>
          </div>

          <div className='mt-6'>
            <OpenDialogOnElementClick
              supplierData={supplierData}
              element={Button}
              elementProps={buttonProps}
              dialog={EditUserInfo}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SupplierDetails
