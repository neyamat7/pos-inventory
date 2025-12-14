// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Utils
const getTotalSuppliers = data => {
  const supplierIds = new Set()

  data.forEach(purchase => {
    purchase.items.forEach(item => {
      if (item.supplier && item.supplier._id) {
        supplierIds.add(item.supplier._id)
      }
    })
  })

  return supplierIds.size
}

const getTotalLots = data =>
  data.reduce((sum, purchase) => {
    return sum + purchase.items.reduce((itemSum, item) => itemSum + item.lots.length, 0)
  }, 0)

const PurchaseCard = ({ purchaseData = [] }) => {
  const totalPurchaseCount = purchaseData.length
  const totalSuppliersCount = getTotalSuppliers(purchaseData)
  const totalLotsCount = getTotalLots(purchaseData)

  const stats = [
    {
      value: totalPurchaseCount,
      title: 'Total Purchases',
      icon: 'tabler-shopping-cart',
      color: 'primary'
    },
    {
      value: totalSuppliersCount,
      title: 'Total Suppliers',
      icon: 'tabler-users',
      color: 'success'
    },
    {
      value: totalLotsCount,
      title: 'Total Lots',
      icon: 'tabler-layers-linked',
      color: 'warning'
    }
  ]

  return (
    <Grid container spacing={6}>
      {stats.map((item, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
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
                <i className={`${item.icon} text-[28px]`} />
              </CustomAvatar>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default PurchaseCard
