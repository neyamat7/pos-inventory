// MUI Imports
import Image from 'next/image'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CustomerStats = ({ heading = '', value = '', subHeading = '', description = '', crate = {} }) => {
  const totalQty = Object.values(crate).reduce((sum, c) => sum + c.qty, 0)

  return (
    <Card>
      <CardContent className='flex flex-col gap-2'>
        <CustomAvatar variant='rounded' skin='light' color=''>
          <Image
            src='https://i.postimg.cc/NfvBPvQv/istockphoto-1185358397-612x612.jpg'
            alt={heading}
            width={40}
            height={40}
          />
        </CustomAvatar>
        <Typography variant='h5' className='capitalize'>
          {heading}
        </Typography>

        <div className='flex flex-col items-start'>
          <div className='flex items-center gap-1'>
            {totalQty > 0 ? (
              <div>
                <div className='flex items-center gap-1'>
                  <Typography variant='h5' color='#675cd8'>
                    {totalQty}
                  </Typography>
                  <Typography>{subHeading}</Typography>
                </div>
                <div className='flex items-center gap-1'>
                  <Typography color='#675cd8'>Type One: {crate.type1.qty},</Typography>
                  <Typography color='#675cd8'>Type Two: {crate.type2.qty}</Typography>
                </div>
              </div>
            ) : (
              <>
                <Typography variant='h5' color='#675cd8'>
                  {value}
                </Typography>
                <Typography>{value > 0 && subHeading}</Typography>
              </>
            )}
          </div>
          <Typography>{description}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerStats
