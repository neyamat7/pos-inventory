// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const ReturnPurchaseCard = ({ purchaseReturnData = [] }) => {
  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  // Calculations
  const totalProducts = purchaseReturnData.length
  const totalAmount = purchaseReturnData.reduce((sum, item) => sum + (item.returnAmount || 0), 0)

  const stats = [
    {
      value: totalProducts,
      title: 'Total Products Returned',
      icon: 'tabler-package'
    },
    {
      value: totalAmount,
      title: 'Total Return Amount',
      icon: 'tabler-currency-dollar'
    }
  ]

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {stats.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: 3 }}
              key={index}
              className={classnames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                  isBelowMdScreen && !isBelowSmScreen,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
              })}
            >
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>
                    {item.title.includes('Amount')
                      ? item.value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
                      : item.value}
                  </Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={42} skin='light'>
                  <i className={classnames(item.icon, 'text-[26px]')} />
                </CustomAvatar>
              </div>
              {isBelowSmScreen && index < stats.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ReturnPurchaseCard
