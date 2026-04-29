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
            <TableCell sx={{ border: 0, py: 0.5 }}>{formatDate(details.date)}</TableCell>
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
        Purchase Items
      </Typography>
      {details.items?.length > 0 ? (
        details.items.map((item, idx) => (
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
                  <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Supplier</TableCell>
                  <TableCell sx={{ border: 0, py: 0.25 }}>
                    {item.supplier?.basic_info?.name || '—'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Lot Name</TableCell>
                  <TableCell sx={{ border: 0, py: 0.25 }}>{item.lot_name || '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Product</TableCell>
                  <TableCell sx={{ border: 0, py: 0.25 }}>
                    {item.lots?.[0]?.productId?.productName || '—'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Total (kg)</TableCell>
                  <TableCell sx={{ border: 0, py: 0.25 }}>{item.total_kg ?? '—'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.25 }}>Unit Cost</TableCell>
                  <TableCell sx={{ border: 0, py: 0.25 }}>৳{item.unit_cost ?? '—'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ))
      ) : (
        <Typography variant='body2' color='text.secondary'>
          No items
        </Typography>
      )}

      {hasAnyExpense && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
            Aggregated Expenses
          </Typography>
          <Table size='small'>
            <TableBody>
              {expenseKeys.map(key =>
                aggregatedExpenses[key] > 0 ? (
                  <TableRow key={key}>
                    <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5, textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 0.5 }}>৳{aggregatedExpenses[key]}</TableCell>
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
