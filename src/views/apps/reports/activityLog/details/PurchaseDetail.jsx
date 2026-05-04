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
 * PurchaseDetail — renders the detail view for a Purchase activity log entry.
 *
 * Props:
 *   details {Object|null} — populated Purchase document, or null if deleted
 */
const PurchaseDetail = ({ details }) => {
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

  // Aggregate expenses across all items
  const expenseKeys = ['labour', 'transportation', 'van_vara', 'moshjid', 'trading_post', 'other_expenses']
  const aggregatedExpenses = expenseKeys.reduce((acc, key) => {
    acc[key] = (details.items || []).reduce((sum, item) => sum + (Number(item[key]) || 0), 0)
    return acc
  }, {})

  const hasAnyExpense = expenseKeys.some(k => aggregatedExpenses[k] > 0)

  return (
    <Box>
      {/* Summary */}
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Purchase Summary
      </Typography>
      <Table size='small' sx={{ mb: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Purchase Date</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{formatDate(details.purchase_date || details.date)}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Status</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {details.status ? (
                <Chip label={details.status} size='small' variant='tonal' color='info' />
              ) : (
                '—'
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Divider sx={{ mb: 2 }} />

      {/* Items */}
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Purchase Items (By Supplier)
      </Typography>
      {details.items?.length > 0 ? (
        details.items.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              mb: 3,
              pl: 2,
              borderLeft: '2px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
              Supplier: {item.supplier?.basic_info?.name || '—'}
            </Typography>

            {item.lots?.map((lot, lotIdx) => (
              <Box key={lotIdx} sx={{ mb: 2, ml: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Table size='small'>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Lot Name</TableCell>
                      <TableCell sx={{ border: 0, py: 0.25, fontWeight: 500 }}>{lot.lot_name || '—'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Product</TableCell>
                      <TableCell sx={{ border: 0, py: 0.25 }}>
                        {lot.productId?.productName || '—'}
                      </TableCell>
                    </TableRow>
                    
                    {/* Dynamic Quantities */}
                    {lot.isCrated && (
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Crates</TableCell>
                        <TableCell sx={{ border: 0, py: 0.25 }}>
                          Type 1: {lot.carat?.carat_Type_1 || 0}, Type 2: {lot.carat?.carat_Type_2 || 0}
                        </TableCell>
                      </TableRow>
                    )}
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
                    
                    {(lot.total_kg > 0 || (!lot.isBoxed && !lot.isPieced && !lot.isBagged)) && (
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Total Weight</TableCell>
                        <TableCell sx={{ border: 0, py: 0.25 }}>{lot.total_kg ?? 0} kg</TableCell>
                      </TableRow>
                    )}

                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Unit Cost</TableCell>
                      <TableCell sx={{ border: 0, py: 0.25 }}>৳{lot.unit_Cost ?? '—'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            ))}
          </Box>
        ))
      ) : (
        <Typography variant='body2' color='text.secondary'>
          No items
        </Typography>
      )}

      {details.total_expenses && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
            Expense Summary
          </Typography>
          <Table size='small'>
            <TableBody>
              {Object.entries(details.total_expenses).map(([key, value]) => 
                typeof value === 'number' && value > 0 ? (
                  <TableRow key={key}>
                    <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5, textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 0.5 }}>৳{value}</TableCell>
                  </TableRow>
                ) : null
              )}
            </TableBody>
          </Table>
        </>
      )}
    </Box>
  )
}

export default PurchaseDetail
