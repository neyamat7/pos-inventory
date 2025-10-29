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
      icon: 'tabler-package'
    },
    {
      value: totalCarat,
      title: 'Total Carat',
      icon: 'tabler-weight'
    },
    {
      value: totalSoldAmount,
      title: 'Total Sold Amount',
      icon: 'tabler-currency-taka'
    },
    {
      value: totalProfit,
      title: 'Total Profit',
      icon: 'tabler-chart-line'
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
              <div className='flex gap-8'>
                <div className='flex flex-col items-start'>
                  {loading ? (
                    <Skeleton variant='text' width={80} height={40} />
                  ) : (
                    <Typography variant='h4'>{item.value.toLocaleString()}</Typography>
                  )}
                  {loading ? (
                    <Skeleton variant='text' width={120} height={24} />
                  ) : (
                    <Typography>{item.title}</Typography>
                  )}
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

export default AllLotCard
