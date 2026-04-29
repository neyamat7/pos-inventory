'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

/**
 * PaymentDetail — renders the detail view for a Payment (supplier settlement)
 * activity log entry.
 *
 * Props:
 *   details {Object|null} — populated Payment document, or null if deleted
 */
const PaymentDetail = ({ details }) => {
  if (!details) {
    return (
      <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
        This record has been deleted.
      </Typography>
    )
  }

  const formatDate = dateStr => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <Box>
      {/* Summary */}
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Payment Summary
      </Typography>
      <Table size='small' sx={{ mb: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Date</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{formatDate(details.date)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Supplier</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {details.supplierId?.basic_info?.name || '—'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Total Paid</TableCell>
            <TableCell sx={{ border: 0, py: 0.5, fontWeight: 600 }}>
              ৳{details.total_paid_amount ?? '—'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Payment Method</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {details.payment_method ? (
                <Chip label={details.payment_method} size='small' variant='tonal' color='primary' />
              ) : (
                '—'
              )}
            </TableCell>
          </TableRow>
          {details.transactionId && (
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Transaction ID</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>
                <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {details.transactionId}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Settled Lots */}
      {details.selected_lots_info?.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
            Settled Lots
          </Typography>
          {details.selected_lots_info.map((lotInfo, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 2,
                pl: 2,
                borderLeft: '2px solid',
                borderColor: 'divider'
              }}
            >
              <Table size='small'>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Lot ID</TableCell>
                    <TableCell sx={{ border: 0, py: 0.25 }}>
                      <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {String(lotInfo.lot_id?._id || lotInfo.lot_id || '—')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Total Sell</TableCell>
                    <TableCell sx={{ border: 0, py: 0.25 }}>৳{lotInfo.total_sell ?? '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Profit</TableCell>
                    <TableCell sx={{ border: 0, py: 0.25 }}>৳{lotInfo.profit ?? '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Discount</TableCell>
                    <TableCell sx={{ border: 0, py: 0.25 }}>৳{lotInfo.discount ?? '—'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Paid Amount</TableCell>
                    <TableCell sx={{ border: 0, py: 0.25, fontWeight: 600 }}>
                      ৳{lotInfo.paid_amount ?? '—'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          ))}
        </>
      )}
    </Box>
  )
}

export default PaymentDetail
