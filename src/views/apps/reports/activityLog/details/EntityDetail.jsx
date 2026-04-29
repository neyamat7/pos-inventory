'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

/**
 * EntityDetail — renders the detail view for entity activity log entries:
 * Customer, Supplier, Product, Category, Account.
 *
 * Props:
 *   details   {Object|null} — the entity document, or null if deleted
 *   modelName {string}      — the model name string (e.g. "Customer")
 */
const EntityDetail = ({ details, modelName }) => {
  if (!details) {
    return (
      <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
        This record has been deleted.
      </Typography>
    )
  }

  const renderRows = () => {
    switch (modelName) {
      case 'Customer':
        return (
          <>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Name</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>{details.basic_info?.name || '—'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Phone</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>{details.contact_info?.phone || '—'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Account Due</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>৳{details.account_info?.due ?? '—'}</TableCell>
            </TableRow>
          </>
        )

      case 'Supplier':
        return (
          <>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Name</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>{details.basic_info?.name || '—'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Phone</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>{details.contact_info?.phone || '—'}</TableCell>
            </TableRow>
          </>
        )

      case 'Product':
        return (
          <>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Product Name</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>{details.productName || '—'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Category</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>
                {details.categoryId?.categoryName || '—'}
              </TableCell>
            </TableRow>
          </>
        )

      case 'Category':
        return (
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Category Name</TableCell>
            <TableCell sx={{ border: 0, py: 0.5 }}>{details.categoryName || '—'}</TableCell>
          </TableRow>
        )

      case 'Account':
        return (
          <>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Account Name</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>{details.name || '—'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', border: 0, pl: 0, py: 0.5 }}>Type</TableCell>
              <TableCell sx={{ border: 0, py: 0.5 }}>{details.type || '—'}</TableCell>
            </TableRow>
          </>
        )

      default:
        return (
          <TableRow>
            <TableCell colSpan={2} sx={{ border: 0, pl: 0, py: 0.5, color: 'text.secondary', fontStyle: 'italic' }}>
              Detail view not available for this entity type.
            </TableCell>
          </TableRow>
        )
    }
  }

  return (
    <Box>
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        {modelName} Details
      </Typography>
      <Table size='small'>
        <TableBody>{renderRows()}</TableBody>
      </Table>
    </Box>
  )
}

export default EntityDetail
