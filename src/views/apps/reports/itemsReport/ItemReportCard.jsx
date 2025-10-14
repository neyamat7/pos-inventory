// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const SalesCard = () => {
  const stats = [
    {
      value: 98732,
      title: 'Total Sales',
      icon: 'tabler-shopping-bag'
    },
    {
      value: 60744,
      title: 'Total Paid',
      icon: 'tabler-cash'
    },
    {
      value: 38987,
      title: 'Total Due',
      icon: 'tabler-alert-circle'
    }
  ]

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {stats.map((item, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <div className='flex items-center gap-8'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>৳ {item.value.toLocaleString()}</Typography>
                  <Typography>{item.title}</Typography>
                </div>
                <CustomAvatar variant='rounded' size={48} skin='light'>
                  <i className={`${item.icon} text-[28px]`} />
                </CustomAvatar>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SalesCard
