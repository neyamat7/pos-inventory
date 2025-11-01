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

const SalesCard = ({ salesData }) => {
  // console.log('sales data in sales card', salesData)

  // Calculate stats from sales data
  const totalSales = salesData?.length || 0
  const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.payment_details?.payable_amount || 0), 0) || 0
  const totalDue = salesData?.reduce((sum, sale) => sum + (sale.payment_details?.due_amount || 0), 0) || 0
  const totalProfit = salesData?.reduce((sum, sale) => sum + (sale.total_profit || 0), 0) || 0

  const data = [
    {
      value: totalSales,
      title: 'Total Sales',
      icon: 'tabler-shopping-cart'
    },
    {
      value: totalRevenue,
      title: 'Total Revenue',
      icon: 'tabler-currency-taka'
    },
    {
      value: totalDue,
      title: 'Total Due',
      icon: 'tabler-wallet'
    },
    {
      value: totalProfit,
      title: 'Total Profit',
      icon: 'tabler-chart-bar'
    }
  ]

  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {data.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 3 }}
              key={index}
              className={classnames({
                '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie':
                  isBelowMdScreen && !isBelowSmScreen,
                '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
              })}
            >
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>{item.value.toLocaleString()}</Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={42} skin='light'>
                  <i className={classnames(item.icon, 'text-[26px]')} />
                </CustomAvatar>
              </div>
              {isBelowMdScreen && !isBelowSmScreen && index < data.length - 2 && (
                <Divider
                  className={classnames('mbs-6', {
                    'mie-6': index % 2 === 0
                  })}
                />
              )}
              {isBelowSmScreen && index < data.length - 1 && <Divider className='mbs-6' />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SalesCard
