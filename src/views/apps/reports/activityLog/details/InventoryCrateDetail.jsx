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
 * InventoryCrateDetail — renders the detail view for an InventoryCrate
 * activity log entry.
 *
 * Props:
 *   details {Object|null} — populated InventoryCrate document, or null if deleted
 */
const InventoryCrateDetail = ({ details }) => {
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

  const isReStock = details.stockType === 're-stock'

  return (
    <Box>
      {/* Summary */}
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Crate Transition Details
      </Typography>
      <Table size='small' sx={{ mb: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Date</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{formatDate(details.date)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Stock Type</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {details.stockType ? (
                <Chip
                  label={details.stockType}
                  size='small'
                  variant='tonal'
                  color={isReStock ? 'warning' : 'success'}
                />
              ) : (
                '—'
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Status</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>
              {details.status ? (
                <Chip
                  label={details.status}
                  size='small'
                  variant='tonal'
                  color={details.status === 'IN' ? 'success' : 'error'}
                />
              ) : (
                '—'
              )}
            </TableCell>
          </TableRow>
          {isReStock && (
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Customer</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>
                {details.customerId?.basic_info?.name || '—'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Divider sx={{ mb: 2 }} />

      {/* Crate Quantities & Prices */}
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Crate Details
      </Typography>
      <Table size='small' sx={{ mb: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Type 1 Qty</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{details.crate_type_1_qty ?? '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Type 1 Price</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>৳{details.crate_type_1_price ?? '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Type 2 Qty</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{details.crate_type_2_qty ?? '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Type 2 Price</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>৳{details.crate_type_2_price ?? '—'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Note */}
      {details.note && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='subtitle2' sx={{ mb: 0.5, fontWeight: 600 }}>
            Note
          </Typography>
          <Typography variant='body2' color='text.primary'>
            {details.note}
          </Typography>
        </>
      )}
    </Box>
  )
}

export default InventoryCrateDetail
