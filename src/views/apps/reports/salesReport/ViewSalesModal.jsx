import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'

const Label = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  textTransform: 'capitalize'
}))

const Value = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
  fontSize: '1rem'
}))

const ViewSalesModal = ({ open, handleClose, data }) => {
  if (!data) return null

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
      <DialogTitle>
        <Typography variant='h6' component='span' fontWeight={600}>
          Sales Details
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Paper
          variant='outlined'
          sx={{
            borderRadius: 3,
            p: 3,
            background: theme => theme.palette.background.paper,
            boxShadow: theme => theme.shadows[1]
          }}
        >
          {/* Top Info Section */}
          <Box mb={3}>
            <Typography variant='h5' fontWeight={700} gutterBottom>
              {data.partyName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Invoice No: {data.invoiceNo} &nbsp; | &nbsp; Date: {data.date}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Details Grid */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Label>Total</Label>
              <Value>৳{data.total.toLocaleString()}</Value>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Label>Discount</Label>
              <Value>৳{data.discount.toLocaleString()}</Value>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Label>Paid</Label>
              <Value>৳{data.paid.toLocaleString()}</Value>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Label>Due</Label>
              <Value>৳{data.due.toLocaleString()}</Value>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Label>Payment Method</Label>
              <Value>{data.payment}</Value>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Label>Status</Label>
              <Value>{data.status}</Value>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant='outlined' color='secondary'>
          Close
        </Button>
        <Button variant='contained' color='primary'>
          Download Invoice
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewSalesModal
