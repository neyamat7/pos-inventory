// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const AllLotCard = ({ lotData = [], loading = false, cashSummary = null }) => {
  // Total active lots — only "in stock" lots
  const totalActiveLots = lotData.filter(item => item.status === 'in stock').length

  const bd = cashSummary?.breakdown || {}
  const dc = cashSummary?.daily_cash || {}

  const cards = [
    {
      value: totalActiveLots,
      title: 'Total Active Lots',
      icon: 'tabler-package',
      color: 'primary',
      prefix: ''
    },
    {
      value: cashSummary?.daily_net_amount ?? '—',
      title: 'Daily Net Amount',
      icon: 'tabler-cash',
      color: 'success',
      prefix: '৳'
    },
    {
      value: bd.today_total_sale ?? '—',
      title: "Today's Total Sale",
      icon: 'tabler-shopping-cart',
      color: 'info',
      prefix: '৳'
    },
    {
      value: bd.today_total_due ?? '—',
      title: "Today's Total Due",
      icon: 'tabler-clock-dollar',
      color: 'warning',
      prefix: '৳'
    },
    {
      value: bd.today_total_received ?? '—',
      title: "Today's Received",
      icon: 'tabler-receipt',
      color: 'success',
      prefix: '৳'
    },
    {
      value: bd.all_customer_previous_due ?? '—',
      title: 'All Customer Due',
      icon: 'tabler-users',
      color: 'error',
      prefix: '৳'
    },
    {
      value: bd.today_add_balance_payments ?? '—',
      title: 'Add Balance Today',
      icon: 'tabler-wallet',
      color: 'primary',
      prefix: '৳'
    },
    {
      value: bd.today_discounts_given ?? '—',
      title: 'Discounts Given',
      icon: 'tabler-discount',
      color: 'warning',
      prefix: '৳'
    },
    {
      value: dc.closing_cash ?? '—',
      title: 'Closing Cash',
      icon: 'tabler-safe',
      color: 'info',
      prefix: '৳'
    }
  ]

  const formatValue = (value, prefix) => {
    if (value === '—') return '—'

    return `${prefix}${Number(value).toLocaleString()}`
  }

  return (
    <Grid container spacing={4}>
      {cards.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
          <Card sx={{ borderBottom: 4, borderColor: `${item.color}.main` }}>
            <CardContent className='flex justify-between gap-4'>
              <div className='flex flex-col items-start'>
                {loading || (index > 0 && cashSummary === null) ? (
                  <Skeleton variant='text' width={100} height={40} />
                ) : (
                  <Typography variant='h5' color={`${item.color}.main`} sx={{ fontWeight: 700 }}>
                    {formatValue(item.value, item.prefix)}
                  </Typography>
                )}
                {loading ? (
                  <Skeleton variant='text' width={120} height={24} />
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    {item.title}
                  </Typography>
                )}
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

export default AllLotCard
