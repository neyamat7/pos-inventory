'use client'

import CustomAvatar from '@core/components/mui/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import classnames from 'classnames'

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ borderBottom: 4, borderColor: `${color}.main` }}>
    <CardContent className='flex justify-between gap-4'>
      <div className='flex flex-col items-start'>
        {loading ? (
          <Skeleton variant='text' width={100} height={40} />
        ) : (
          <Typography variant='h5' color={`${color}.main`} sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        )}
        <Typography variant='body2' color='text.secondary'>
          {title}
        </Typography>
      </div>
      <CustomAvatar variant='rounded' size={48} skin='light' color={color}>
        <i className={classnames(icon, 'text-[28px]')} />
      </CustomAvatar>
    </CardContent>
  </Card>
)

const CustomerSaleSummaryCards = ({ summary, loading }) => {
  if (!summary && !loading) return null

  const fmt = val => `৳${Number(val || 0).toLocaleString()}`

  const cards = [
    {
      title: 'Total Sale Amount',
      value: fmt(summary?.totalSaleAmount),
      icon: 'tabler-shopping-cart',
      color: 'primary'
    },
    {
      title: 'Total Received',
      value: fmt(summary?.totalReceived),
      icon: 'tabler-cash',
      color: 'success'
    },
    {
      title: 'Total Due Created',
      value: fmt(summary?.totalDue),
      icon: 'tabler-clock-dollar',
      color: 'warning'
    },
    {
      title: 'Total Crate Amount',
      value: fmt(summary?.totalCrateAmount),
      icon: 'tabler-box',
      color: 'info'
    },
    {
      title: `Top Product${summary?.topProduct?.productName ? ` — ${summary.topProduct.productName}` : ''}`,
      value: fmt(summary?.topProduct?.totalAmount),
      icon: 'tabler-star',
      color: 'error'
    }
  ]

  return (
    <Grid container spacing={4} className='mb-4'>
      {cards.map((card, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={i}>
          <StatCard {...card} loading={loading} />
        </Grid>
      ))}
    </Grid>
  )
}

export default CustomerSaleSummaryCards
