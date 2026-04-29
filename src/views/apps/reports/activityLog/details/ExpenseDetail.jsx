'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

/**
 * ExpenseDetail — renders the detail view for an Expense activity log entry.
 *
 * Props:
 *   details {Object|null} — populated Expense document, or null if deleted
 */
const ExpenseDetail = ({ details }) => {
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

  // Category can come from expense_category string or choose_account.name
  const categoryName = details.expense_category || details.choose_account?.name || '—'

  return (
    <Box>
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Expense Details
      </Typography>
      <Table size='small' sx={{ mb: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Date</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{formatDate(details.date)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Category</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{categoryName}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Description</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{details.expense_for || '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Amount</TableCell>
            <TableCell sx={{ border: 0, py: 0.5, fontWeight: 600 }}>৳{details.amount ?? '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Payment Type</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {details.payment_type ? (
                <Chip label={details.payment_type} size='small' variant='tonal' color='primary' />
              ) : (
                '—'
              )}
            </TableCell>
          </TableRow>
          {details.reference_no && (
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Reference No.</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>
                <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {details.reference_no}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}

export default ExpenseDetail
