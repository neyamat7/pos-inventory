// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Skeleton from '@mui/material/Skeleton'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const AllLotCard = ({ lotData = [], loading = false }) => {
  // console.log('lotData', lotData)

  // Calculate totals from lotData array
  const totalLot = lotData.length

  const totalSoldAmount = lotData.reduce((acc, item) => acc + (item.sales?.totalSoldPrice || 0), 0)

  const totalCarat = lotData.reduce((acc, item) => {
    const carat1 = item.carat?.carat_Type_1 || 0
    const carat2 = item.carat?.carat_Type_2 || 0

    return acc + carat1 + carat2
  }, 0)

  const totalProfit = lotData.reduce((acc, item) => acc + (item.profits?.totalProfit || 0), 0)

  // Vars
  const data = [
    {
      value: totalLot,
      title: 'Total Lots',
      icon: 'tabler-package',
      color: 'primary'
    },
    {
      value: totalCarat,
      title: 'Total Carat',
      icon: 'tabler-weight',
      color: 'info'
    },
    {
      value: totalSoldAmount,
      title: 'Total Sold Amount',
      icon: 'tabler-currency-taka',
      color: 'success'
    },
    {
      value: totalProfit,
      title: 'Total Profit',
      icon: 'tabler-chart-line',
      color: 'warning'
    }
  ]

  return (
    <Grid container spacing={6}>
      {data.map((item, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card sx={{ borderBottom: 4, borderColor: `${item.color}.main` }}>
            <CardContent className='flex justify-between gap-4'>
              <div className='flex flex-col items-start'>
                {loading ? (
                  <Skeleton variant='text' width={80} height={40} />
                ) : (
                  <Typography variant='h4' color={`${item.color}.main`} sx={{ fontWeight: 700 }}>
                    {item.value.toLocaleString()}
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
