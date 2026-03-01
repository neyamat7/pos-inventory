import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid2'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

const Label = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  textTransform: 'capitalize'
}))

const Value = styled(Box)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
  fontSize: '1rem'
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
  fontSize: '1.1rem',
  marginBottom: '1rem'
}))

const statusChipColor = {
  'on the way': 'warning',
  received: 'success',
  canceled: 'error'
}

const ViewPurchaseModal = ({ open, handleClose, data }) => {
  if (!data) return null

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateTotalExpenses = (expenses, customExpenses = []) => {
    let total = 0

    if (expenses) {
      total += Object.values(expenses).reduce((sum, val) => sum + (Number(val) || 0), 0)
    }

    if (customExpenses && customExpenses.length > 0) {
      total += customExpenses.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
    }

    return total
  }

  const getSupplierName = () => {
    return data.items?.[0]?.supplier?.basic_info?.name || 'N/A'
  }

  const getTotalLots = () => {
    return data.items?.reduce((sum, item) => sum + (item.lots?.length || 0), 0) || 0
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
      <DialogTitle sx={{ pb: 2 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h5' fontWeight={700} component='div'>
            Purchase Details
          </Typography>
          <Chip label={data.status} color={statusChipColor[data.status] || 'default'} variant='filled' size='medium' />
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box p={3}>
          {/* Header Information */}
          <Card sx={{ mb: 3, background: theme => theme.palette.background.default }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Label>Purchase ID</Label>
                  <Value component='div'>{data._id}</Value>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Label>Purchase Date</Label>
                  <Value component='div'>{formatDate(data.purchase_date)}</Value>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Label>Supplier</Label>
                  <Value component='div'>{getSupplierName()}</Value>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Label>Lots Created</Label>
                  <Value component='div'>
                    <Chip
                      label={data.is_lots_created ? 'Yes' : 'No'}
                      color={data.is_lots_created ? 'success' : 'warning'}
                      size='small'
                    />
                  </Value>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Items and Lots */}
          <SectionTitle component='div'>Items & Lots</SectionTitle>
          {data.items?.map((item, itemIndex) => (
            <Card key={item._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box mb={2}>
                  <Typography variant='h6' fontWeight={600} gutterBottom component='div'>
                    Supplier {itemIndex + 1} - {item.supplier?.basic_info?.name}
                  </Typography>
                </Box>

                {item.lots?.map((lot, lotIndex) => (
                  <Box key={lot._id} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Label>Lot Name</Label>
                        <Value component='div'>{lot.lot_name}</Value>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Label>Product</Label>
                        <Value component='div'>{lot.productId?.productNameBn || lot.productId?.productName}</Value>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Label>Unit Cost</Label>
                        <Value component='div'>৳{lot.unit_Cost}</Value>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Label>Commission</Label>
                        <Value component='div'>{lot.commission_rate}%</Value>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Label>Carat Type 1</Label>
                        <Value component='div'>{lot.carat?.carat_Type_1 || 0}</Value>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Label>Carat Type 2</Label>
                        <Value component='div'>{lot.carat?.carat_Type_2 || 0}</Value>
                      </Grid>
                    </Grid>

                    {/* Lot Expenses */}
                    {lot.expenses && (
                      <Box mt={2}>
                        <Typography variant='subtitle2' fontWeight={600} gutterBottom component='div'>
                          Lot Expenses:
                        </Typography>
                        <Grid container spacing={1}>
                          {/* Standard Expenses */}
                          {Object.entries(lot.expenses).map(([expenseKey, expenseValue]) => {
                            if (expenseKey === 'custom_expenses' || expenseKey === '_id') return null

                            return (
                              <Grid key={expenseKey} size={{ xs: 6, sm: 4, md: 2 }}>
                                <Label variant='caption'>{expenseKey.replace(/_/g, ' ')}</Label>
                                <Typography variant='body2' component='div'>
                                  ৳{Number(expenseValue).toLocaleString()}
                                </Typography>
                              </Grid>
                            )
                          })}

                          {/* Custom Expenses */}
                          {lot.expenses.custom_expenses?.map((customExpense, idx) => (
                            <Grid key={`custom-${idx}`} size={{ xs: 6, sm: 4, md: 2 }}>
                              <Label variant='caption'>{customExpense.name}</Label>
                              <Typography variant='body2' component='div'>
                                ৳{Number(customExpense.amount).toLocaleString()}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Summary */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Label>Total Items</Label>
                  <Typography variant='h6' component='div'>
                    {data.items?.length || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Label>Total Lots</Label>
                  <Typography variant='h6' component='div'>
                    {getTotalLots()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Label>Created At</Label>
                  <Value component='div'>{formatDate(data.createdAt)}</Value>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Label>Last Updated</Label>
                  <Value component='div'>{formatDate(data.updatedAt)}</Value>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
        <Button onClick={handleClose} variant='outlined' color='secondary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewPurchaseModal
