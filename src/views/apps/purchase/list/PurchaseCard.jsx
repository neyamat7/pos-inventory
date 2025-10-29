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
      icon: 'tabler-shopping-cart'
    },
    {
      value: totalSuppliersCount,
      title: 'Total Suppliers',
      icon: 'tabler-users'
    },
    {
      value: totalLotsCount,
      title: 'Total Lots',
      icon: 'tabler-layers-linked'
    }
  ]

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          {stats.map((item, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <div className='flex justify-between gap-4'>
                <div className='flex flex-col items-start'>
                  <Typography variant='h4'>{item.value.toLocaleString()}</Typography>
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

export default PurchaseCard
