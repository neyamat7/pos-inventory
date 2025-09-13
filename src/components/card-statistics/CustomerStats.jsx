// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const CustomerStats = props => {
  // Props
  const { image, balance, due, crate } = props

  console.log('props in stats', props)

  return (
    <Card>
      <CardContent className='flex flex-col gap-2'>
        <CustomAvatar variant='rounded' skin='light' color="">
          {image}
        </CustomAvatar>
        <Typography variant='h5' className='capitalize'>
          Account Balance
        </Typography>

        <div className='flex flex-col items-start'>
          <div className='flex items-center gap-1'>
            <Typography variant='h5' color={``}>
              {balance}
            </Typography>
            <Typography>Total Remaining Balance</Typography>
          </div>
          <Typography>Description to add</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerStats
