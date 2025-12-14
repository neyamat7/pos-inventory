// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const SalesCard = ({ salesData }) => {
  // Calculate stats from sales data
  const totalSales = salesData?.length || 0
  const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.payment_details?.payable_amount || 0), 0) || 0
  const totalDue = salesData?.reduce((sum, sale) => sum + (sale.payment_details?.due_amount || 0), 0) || 0
  const totalProfit = salesData?.reduce((sum, sale) => sum + (sale.total_profit || 0), 0) || 0

  const data = [
    {
      value: totalSales,
      title: 'Total Sales',
      icon: 'tabler-shopping-cart',
      color: 'primary'
    },
    {
      value: totalRevenue,
      title: 'Total Revenue',
      icon: 'tabler-currency-taka',
      color: 'success'
    },
    {
      value: totalDue,
      title: 'Total Due',
      icon: 'tabler-wallet',
      color: 'warning'
    },
    {
      value: totalProfit,
      title: 'Total Profit',
      icon: 'tabler-chart-bar',
      color: 'info'
    }
  ]

  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  return (
    <Grid container spacing={6}>
      {data.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{ borderBottom: 4, borderColor: `${item.color}.main` }}>
            <CardContent className='flex justify-between gap-4'>
              <div className='flex flex-col items-start'>
                <Typography variant='h4' color={`${item.color}.main`} sx={{ fontWeight: 700 }}>
                  {item.value.toLocaleString()}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {item.title}
                </Typography>
              </div>
              <CustomAvatar variant='rounded' size={48} skin='light' color={item.color}>
                <i className={classnames(item.icon, 'text-[28px]')} />
              </CustomAvatar>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default SalesCard
