'use client'

import { useEffect, useState } from 'react'

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
  Chip,
  MenuItem
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Eye } from 'lucide-react'

import CustomTextField from '@core/components/mui/TextField'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import { updateCrateStatus } from '@/actions/customerActions'
import { showError, showSuccess } from '@/utils/toastUtils'

// Crate History Detail Modal Component
const CrateHistoryDetailModal = ({ open, onClose, history }) => {
  if (!history) return null

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
          Crate Transaction Details
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
                    {new Date(history.createdAt).toLocaleDateString('en-GB')}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Sale Date:
                  </Typography>
                  <Typography variant='body1' component='span'>
                    {history.saleId?.sale_date ? new Date(history.saleId.sale_date).toLocaleDateString('en-GB') : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Status:
                  </Typography>
                  <Chip
                    label={history.status?.charAt(0).toUpperCase() + history.status?.slice(1)}
                    size='small'
                    color={
                      history.status === 'given' ? 'primary' : history.status === 'returned' ? 'success' : 'warning'
                    }
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Created:
                  </Typography>
                  <Typography variant='body1' component='span'>
                    {new Date(history.createdAt).toLocaleString('en-GB')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Crate Details Section */}
          <Divider sx={{ my: 3 }} />
          <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Crate Details
          </Typography>
          <Box
            sx={{
              p: 3,
              bgcolor: 'info.light',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'info.main'
            }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Crate Type 1:
                  </Typography>
                  <Chip label={history.crate_type1 || 0} size='small' color='primary' />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Type 1 Price:
                  </Typography>
                  <Chip label={`৳${history.crate_type1_price || 0}`} size='small' variant='outlined' />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Crate Type 2:
                  </Typography>
                  <Chip label={history.crate_type2 || 0} size='small' color='secondary' />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' component='span' fontWeight='bold'>
                    Type 2 Price:
                  </Typography>
                  <Chip label={`৳${history.crate_type2_price || 0}`} size='small' variant='outlined' />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

const columnHelper = createColumnHelper()

const CustomerCrateHistoryTable = ({ data, pagination, total, onPaginationChange, loading, onDataUpdate }) => {
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [localData, setLocalData] = useState(data || [])

  useEffect(() => {
    setLocalData(data || [])
  }, [data])

  const crateHistoryColumns = [
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: ({ getValue }) => {
        const date = getValue()

        return date ? new Date(date).toLocaleDateString('en-GB') : '-'
      }
    }),
    columnHelper.accessor('crate_type1', {
      header: 'Crate Type 1',
      cell: ({ getValue }) => {
        const quantity = getValue()

        return (
          <div className=''>
            <div className='font-semibold text-blue-600'>{quantity || 0}</div>
          </div>
        )
      }
    }),
    columnHelper.accessor('crate_type1_price', {
      header: 'Type 1 Price',
      cell: ({ getValue }) => {
        const price = getValue()

        return <div className='font-semibold'>৳{price || 0}</div>
      }
    }),
    columnHelper.accessor('crate_type2', {
      header: 'Crate Type 2',
      cell: ({ getValue }) => {
        const quantity = getValue()

        return (
          <div className=''>
            <div className='font-semibold text-purple-600'>{quantity || 0}</div>
          </div>
        )
      }
    }),
    columnHelper.accessor('crate_type2_price', {
      header: 'Type 2 Price',
      cell: ({ getValue }) => {
        const price = getValue()

        return <div className='font-semibold'>৳{price || 0}</div>
      }
    }),

    // columnHelper.accessor('status', {
    //   header: 'Status',
    //   cell: ({ row, getValue }) => {
    //     const status = getValue()
    //     const isReturned = status === 'returned'
    //     const statusColor = status === 'given' ? 'primary' : status === 'returned' ? 'success' : 'warning'

    //     const handleStatusChange = async newStatus => {
    //       try {
    //         const result = await updateCrateStatus(row.original._id, newStatus)

    //         if (result.success) {
    //           showSuccess('Status updated successfully')

    //           setLocalData(prevData =>
    //             prevData.map(item => (item._id === row.original._id ? { ...item, status: newStatus } : item))
    //           )

    //           //   if (onDataUpdate) {
    //           //     onDataUpdate()
    //           //   }
    //         } else {
    //           showError('Failed to update status:')
    //         }
    //       } catch (error) {
    //         console.error('Error updating status:', error)
    //       }
    //     }

    //     // If status is returned, show Chip (non-editable)
    //     if (isReturned) {
    //       return <Chip label='Returned' size='small' color={statusColor} variant='tonal' />
    //     }

    //     // If status is given, show dropdown (editable) - FIXED PROPS
    //     return (
    //       <CustomTextField
    //         select
    //         value={status}
    //         onChange={e => handleStatusChange(e.target.value)}
    //         size='small'
    //         sx={{
    //           minWidth: '120px',
    //           '& .MuiOutlinedInput-root': {
    //             backgroundColor: 'transparent',
    //             '& fieldset': {
    //               borderColor: 'primary.main'
    //             },
    //             '&:hover fieldset': {
    //               borderColor: 'primary.dark'
    //             }
    //           },
    //           '& .MuiSelect-select': {
    //             padding: '4px 8px',
    //             fontSize: '0.75rem',
    //             fontWeight: 600,
    //             color: 'text.primary'
    //           }
    //         }}

    //         // REMOVED displayEmpty and inputProps
    //       >
    //         <MenuItem value='given' sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
    //           Given
    //         </MenuItem>
    //         <MenuItem value='returned' sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
    //           Returned
    //         </MenuItem>
    //       </CustomTextField>
    //     )
    //   }
    // }),

    // Add Actions Column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <IconButton
          size='small'
          onClick={() => {
            setSelectedHistory(row.original)
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
    data: localData,
    columns: crateHistoryColumns,
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
              <td colSpan={crateHistoryColumns.length} className='text-center p-4'>
                No crate history available
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

      {/* Crate History Detail Modal */}
      <CrateHistoryDetailModal open={modalOpen} onClose={() => setModalOpen(false)} history={selectedHistory} />
    </>
  )
}

export default CustomerCrateHistoryTable
