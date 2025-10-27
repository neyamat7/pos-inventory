// MUI Imports
import Typography from '@mui/material/Typography'

const CustomerDetailHeader = ({ customerData }) => {
  return (
    <div className='flex flex-wrap justify-between max-sm:flex-col sm:items-center gap-x-6 gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <Typography variant='h4'>{`Customer SL #${customerData?.basic_info?.sl}`}</Typography>
        <Typography>Aug 17, 2020, 5:48 (ET)</Typography>
      </div>
    </div>
  )
}

export default CustomerDetailHeader
