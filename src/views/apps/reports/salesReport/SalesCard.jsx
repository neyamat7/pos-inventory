// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Utility to calculate totals
const getTotals = data => {
  if (!Array.isArray(data)) return { total: 0, paid: 0, due: 0 }

  return data.reduce(
    (acc, item) => {
      acc.total += item.total || 0
      acc.paid += item.paid || 0
      acc.due += item.due || 0

      return acc
    },
    { total: 0, paid: 0, due: 0 }
  )
}

const SalesCard = ({ salesReportData }) => {
  const { total, paid, due } = getTotals(salesReportData)

  const stats = [
    {
      value: total,
      title: 'Total Sales',
      icon: 'tabler-shopping-bag'
    },
    {
      value: paid,
      title: 'Total Paid',
      icon: 'tabler-cash'
    },
    {
      value: due,
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
              <div className='flex justify-between items-center gap-4'>
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
