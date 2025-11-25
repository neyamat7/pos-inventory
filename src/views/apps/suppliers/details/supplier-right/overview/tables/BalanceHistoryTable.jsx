'use client'

import { useState } from 'react'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  createColumnHelper
} from '@tanstack/react-table'
import {
  TablePagination,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Chip
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Eye } from 'lucide-react'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import { getImageUrl } from '@/utils/getImageUrl'

// Balance Detail Modal Component
const BalanceDetailModal = ({ open, onClose, balance }) => {
  if (!balance) return null

  const slipImageUrl = balance.slip_img ? getImageUrl(balance.slip_img) : ''

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant='h5' component='div' fontWeight='bold'>
          Balance Transaction Details
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ py: 2 }}>
          {/* Transaction Information */}
          <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Transaction Information
          </Typography>
          <Box
            sx={{
              p: 3,
              bgcolor: 'grey.50',
              borderRadius: 2,
              mb: 4,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Date:
                  </Typography>
                  <Typography variant='body1' component='span'>
                    {new Date(balance.date).toLocaleDateString('en-GB')}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Amount:
                  </Typography>
                  <Chip label={`৳${balance.amount}`} size='small' color='success' sx={{ fontWeight: 'bold' }} />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Transaction ID:
                  </Typography>
                  <Typography variant='body1' component='span'>
                    {balance.transaction_Id || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Payment Method:
                  </Typography>
                  <Chip label={balance.payment_method?.toUpperCase()} size='small' color='primary' />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Role:
                  </Typography>
                  <Chip label={balance.role?.toUpperCase()} size='small' variant='outlined' />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Created:
                  </Typography>
                  <Typography variant='body1' component='span'>
                    {new Date(balance.createdAt).toLocaleString('en-GB')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {balance.note && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant='body2' component='div'>
                  <strong>Note:</strong> {balance.note}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Slip Image Section */}
          {slipImageUrl && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                Payment Slip / Proof
              </Typography>
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  mb: 4,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  textAlign: 'center'
                }}
              >
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Transaction Slip / Document
                </Typography>
                <img
                  src={slipImageUrl}
                  alt='Payment Slip'
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                  onError={e => {
                    e.target.style.display = 'none'
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

const columnHelper = createColumnHelper()

const BalanceHistoryTable = ({ data, pagination, total, onPaginationChange, loading }) => {
  const [selectedBalance, setSelectedBalance] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const balanceColumns = [
    columnHelper.accessor('date', {
      header: 'Date',
      cell: ({ getValue }) => {
        const date = getValue()

        return date ? new Date(date).toLocaleDateString() : '-'
      }
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: ({ getValue }) => {
        const amount = getValue()

        return amount ? `৳${parseFloat(amount).toFixed(2)}` : '৳0.00'
      }
    }),
    columnHelper.accessor('transaction_Id', {
      header: 'Transaction ID',
      cell: ({ getValue }) => getValue() || '-'
    }),
    columnHelper.accessor('payment_method', {
      header: 'Payment Method',
      cell: ({ getValue }) => {
        const method = getValue()

        return method ? method.charAt(0).toUpperCase() + method.slice(1) : '-'
      }
    }),
    columnHelper.accessor('note', {
      header: 'Note',
      cell: ({ getValue }) => getValue() || '-'
    }),

    // Add Actions Column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <IconButton
          size='small'
          onClick={() => {
            setSelectedBalance(row.original)
            setModalOpen(true)
          }}
          title='View Details'
        >
          <Eye size={16} />
        </IconButton>
      )
    }
  ]

  const table = useReactTable({
    data: data || [],
    columns: balanceColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.limit),
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit
      }
    },
    onPaginationChange: updater => {
      const newState = updater(table.getState().pagination)

      onPaginationChange(newState.pageIndex + 1, newState.pageSize)
    }
  })

  if (loading) {
    return (
      <Box className='flex justify-center items-center p-8'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <table className={tableStyles.table}>
        <thead>
          {table.getHeaderGroups().map(group => (
            <tr key={group.id}>
              {group.headers.map(header => (
                <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={balanceColumns.length} className='text-center p-4'>
                No balance history available
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {table.getRowModel().rows.length > 0 && (
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={(_, page) => onPaginationChange(page + 1, pagination.limit)}
          onRowsPerPageChange={event => onPaginationChange(1, parseInt(event.target.value, 10))}
        />
      )}

      {/* Balance Detail Modal */}
      <BalanceDetailModal open={modalOpen} onClose={() => setModalOpen(false)} balance={selectedBalance} />
    </>
  )
}

export default BalanceHistoryTable
