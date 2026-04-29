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
 * BalanceDetail — renders the detail view for a Balance activity log entry.
 *
 * Props:
 *   details {Object|null} — Balance document, or null if deleted
 *
 * Note: balance_for is a plain string ID (no populate for Balance).
 */
const BalanceDetail = ({ details }) => {
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
        Balance Details
      </Typography>
      <Table size='small' sx={{ mb: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Date</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{formatDate(details.date)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Amount</TableCell>
            <TableCell sx={{ border: 0, py: 0.5, fontWeight: 600 }}>৳{details.amount ?? '—'}</TableCell>
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
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Type</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {details.type ? (
                <Chip
                  label={details.type}
                  size='small'
                  variant='tonal'
                  color={details.type === 'payment' ? 'success' : 'warning'}
                />
              ) : (
                '—'
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Balance For (ID)</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {details.balance_for ? String(details.balance_for) : '—'}
              </Typography>
            </TableCell>
          </TableRow>
          {details.transaction_Id && (
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Transaction ID</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>
                <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {details.transaction_Id}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Slip Image */}
      {details.slip_image && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
            Slip Image
          </Typography>
          <Box
            sx={{
              maxWidth: 320,
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <img
              src={details.slip_image}
              alt='Payment slip'
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>
        </>
      )}
    </Box>
  )
}

export default BalanceDetail
