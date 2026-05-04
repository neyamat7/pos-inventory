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
 * SaleDetail — renders the detail view for a Sale activity log entry.
 *
 * Props:
 *   details {Object|null} — populated Sale document, or null if deleted
 */
const SaleDetail = ({ details }) => {
  if (!details) {
    return (
      <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
        This record has been deleted.
      </Typography>
    )
  }

  const payment = details.payment_details || {}
  const crateCharges = (payment.total_crate_type1_price || 0) + (payment.total_crate_type2_price || 0)

  const formatDate = dateStr => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString()
  }

  return (
    <Box>
      {/* Summary */}
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Sale Summary
      </Typography>
      <Table size='small' sx={{ mb: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Sale Date</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{formatDate(details.sale_date)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Customer</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {details.customerId?.basic_info?.name || '—'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Total Payable</TableCell>
            <TableCell sx={{ border: 0, py: 0.5, fontWeight: 600 }}>
              ৳{payment.payable_amount ?? '—'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Divider sx={{ mb: 2 }} />

      {/* Items */}
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Items
      </Typography>
      {details.items?.length > 0 ? (
        details.items.map((item, iIdx) => (
          <Box key={iIdx} sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
              {item.productId?.productName || '—'}
            </Typography>
            {item.selected_lots?.length > 0 ? (
              item.selected_lots.map((lot, lIdx) => (
                <Box
                  key={lIdx}
                  sx={{
                    pl: 2,
                    mb: 0.5,
                    borderLeft: '2px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Table size='small'>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Lot</TableCell>
                        <TableCell sx={{ border: 0, py: 0.25 }}>
                          {lot.lotId?.lot_name || '—'}
                        </TableCell>
                      </TableRow>

                      {/* Dynamic Quantities */}
                      {lot.isBoxed && (
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Boxes</TableCell>
                          <TableCell sx={{ border: 0, py: 0.25 }}>{lot.box_quantity || 0}</TableCell>
                        </TableRow>
                      )}
                      {lot.isPieced && (
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Pieces</TableCell>
                          <TableCell sx={{ border: 0, py: 0.25 }}>{lot.piece_quantity || 0}</TableCell>
                        </TableRow>
                      )}
                      {lot.isBagged && (
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Bags</TableCell>
                          <TableCell sx={{ border: 0, py: 0.25 }}>{lot.bag_quantity || 0}</TableCell>
                        </TableRow>
                      )}
                      {(lot.crate_type1 > 0 || lot.crate_type2 > 0) && (
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Crates</TableCell>
                          <TableCell sx={{ border: 0, py: 0.25 }}>
                            {lot.crate_type1 > 0 && `T1: ${lot.crate_type1}`}
                            {lot.crate_type1 > 0 && lot.crate_type2 > 0 && ' | '}
                            {lot.crate_type2 > 0 && `T2: ${lot.crate_type2}`}
                          </TableCell>
                        </TableRow>
                      )}

                      {(lot.kg > 0 || (!lot.isBoxed && !lot.isPieced && !lot.isBagged)) && (
                        <TableRow>
                          <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Weight</TableCell>
                          <TableCell sx={{ border: 0, py: 0.25 }}>{lot.kg ?? '—'} kg</TableCell>
                        </TableRow>
                      )}

                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Unit Price</TableCell>
                        <TableCell sx={{ border: 0, py: 0.25 }}>৳{lot.unit_price ?? '—'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Total Price</TableCell>
                        <TableCell sx={{ border: 0, py: 0.25 }}>৳{lot.selling_price ?? '—'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              ))
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{ pl: 2 }}>
                No lots
              </Typography>
            )}
          </Box>
        ))
      ) : (
        <Typography variant='body2' color='text.secondary'>
          No items
        </Typography>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Payment Details */}
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Payment Details
      </Typography>
      <Table size='small'>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Payment Type</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {payment.payment_type ? (
                <Chip label={payment.payment_type} size='small' variant='tonal' color='primary' />
              ) : (
                '—'
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Received Amount</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>৳{payment.received_amount ?? '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Due Amount</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>৳{payment.due_amount ?? '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Crate Charges</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>৳{crateCharges}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}

export default SaleDetail
