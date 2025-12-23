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
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Divider
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Eye } from 'lucide-react'

import TablePaginationComponent from '@components/TablePaginationComponent'
import TableSkeleton from '@/components/TableSkeleton'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const PurchaseTable = ({ data, pagination, total, onPaginationChange, loading }) => {

  // console.log('purchase data', JSON.stringify(data))
  // console.log('purchase pagination', JSON.stringify(pagination))
  // console.log('purchase total', JSON.stringify(total))

  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const purchaseColumns = [
    columnHelper.accessor('createdAt', {
      header: 'Purchase Date',
      cell: ({ getValue }) => {
        const date = getValue()

        return date ? new Date(date).toLocaleDateString() : '-'
      }
    }),

    columnHelper.accessor('purchaseNumber', {
      header: 'Purchase Number',
      cell: ({ getValue }) => getValue() || '-'
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue()

        return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-'
      }
    }),

    // Items Count Column
    {
      id: 'itemsCount',
      header: 'Items Count',
      cell: ({ row }) => {
        const items = row.original.items || []
        let totalItems = 0

        items.forEach(item => {
          totalItems += item.lots?.length || 0
        })

        return <Typography fontWeight='500'>{totalItems} Items</Typography>
      }
    },

    // Suppliers Count Column
    {
      id: 'suppliersCount',
      header: 'Suppliers Count',
      cell: ({ row }) => {
        const items = row.original.items || []
        const uniqueSuppliers = new Set()

        items.forEach(item => {
          uniqueSuppliers.add(item.supplier)
        })

        return <Typography fontWeight='500'>{uniqueSuppliers.size} Suppliers</Typography>
      }
    },

    // Actions Column
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <IconButton
          size='small'
          onClick={() => {
            setSelectedPurchase(row.original)
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
    columns: purchaseColumns,
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

  // if (loading) {
  //   return (
  //     <Box className='flex justify-center items-center p-8'>
  //       <CircularProgress />
  //     </Box>
  //   )
  // }

  return (
    <>
      <table className={tableStyles.table}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <TableSkeleton columns={purchaseColumns.length} />
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={purchaseColumns.length} className='text-center p-4'>
                No purchases found
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
        <TablePaginationComponent
          table={table}
          paginationData={{
            total: total,
            currentPage: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit)
          }}
          onPageChange={page => onPaginationChange(page, pagination.limit)}
        />
      )}

      {/* Purchase Detail Modal */}
      <PurchaseDetailModal open={modalOpen} onClose={() => setModalOpen(false)} purchase={selectedPurchase} />
    </>
  )
}

export default PurchaseTable

// Purchase Detail Modal Component
const PurchaseDetailModal = ({ open, onClose, purchase }) => {
  if (!purchase) return null

  // Calculate unique suppliers
  const uniqueSuppliers = new Set()
  let totalItems = 0

  purchase.items?.forEach(item => {
    uniqueSuppliers.add(item.supplier)
    totalItems += item.lots?.length || 0
  })

  const supplierCount = uniqueSuppliers.size

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
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
          Purchase Details
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ py: 2 }}>
          {/* Purchase Summary */}
          <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Purchase Summary
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                    Purchase Date
                  </Typography>
                  <Typography variant='body1' fontWeight='500'>
                    {new Date(purchase.createdAt).toLocaleDateString('en-GB')}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                    Purchase Number
                  </Typography>
                  <Typography variant='body1' fontWeight='500'>
                    {purchase.purchaseNumber || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                    Status
                  </Typography>
                  <Chip
                    label={purchase.status?.charAt(0).toUpperCase() + purchase.status?.slice(1) || 'N/A'}
                    color={purchase.status === 'received' ? 'success' : 'warning'}
                    sx={{ width: 'fit-content' }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                    Total Items
                  </Typography>
                  <Typography variant='body1' fontWeight='500'>
                    {totalItems} Items
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary' fontWeight='medium'>
                    Total Suppliers
                  </Typography>
                  <Typography variant='body1' fontWeight='500'>
                    {supplierCount} Suppliers
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Items Breakdown */}
          <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Items Breakdown ({purchase.items?.length || 0} Suppliers)
          </Typography>

          {purchase.items?.map((item, itemIndex) => (
            <Box
              key={item._id || itemIndex}
              sx={{
                p: 3,
                border: '2px solid',
                borderColor: 'primary.light',
                borderRadius: 2,
                mb: 3,
                bgcolor: 'primary.50'
              }}
            >
              {/* Supplier Information */}
              <Typography variant='subtitle1' component='div' fontWeight='bold' color='primary.main' gutterBottom>
                Supplier {itemIndex + 1}: {item.supplierData?.[0]?.basic_info?.name || 'Unknown Supplier'}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Supplier ID
                  </Typography>
                  <Typography variant='body2' fontWeight='500'>
                    {item.supplier}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Contact
                  </Typography>
                  <Typography variant='body2' fontWeight='500'>
                    {item.supplierData?.[0]?.contact_info?.phone || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Email
                  </Typography>
                  <Typography variant='body2' fontWeight='500'>
                    {item.supplierData?.[0]?.contact_info?.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Lots for this supplier */}
              <Typography variant='body1' fontWeight='bold' gutterBottom sx={{ mt: 2 }}>
                Lots ({item.lots?.length || 0}):
              </Typography>

              {item.lots?.map((lot, lotIndex) => (
                <Box
                  key={lot._id || lotIndex}
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Lot Name
                        </Typography>
                        <Typography variant='body1' fontWeight='500'>
                          {lot.lot_name || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Product
                        </Typography>
                        <Typography variant='body1' fontWeight='500'>
                          {item.productData?.[0]?.productName || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Unit Cost
                        </Typography>
                        <Typography variant='body1' fontWeight='500'>
                          ৳{lot.unit_Cost || 0}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Commission Rate
                        </Typography>
                        <Typography variant='body1' fontWeight='500'>
                          {lot.commission_rate || 0}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Total Carat
                        </Typography>
                        <Typography variant='body1' fontWeight='500'>
                          {(lot.carat?.carat_Type_1 || 0) + (lot.carat?.carat_Type_2 || 0)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Box Quantity
                        </Typography>
                        <Typography variant='body1' fontWeight='500'>
                          {lot.box_quantity || 0} boxes
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Expenses */}
                  {lot.expenses && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant='body2' fontWeight='bold' gutterBottom>
                        Expenses:
                      </Typography>
                      <Grid container spacing={1}>
                        {Object.entries(lot.expenses).map(
                          ([key, value]) =>
                            value > 0 && (
                              <Grid size={{ xs: 6, sm: 4 }} key={key}>
                                <Typography variant='body2'>
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ৳{value}
                                </Typography>
                              </Grid>
                            )
                        )}
                      </Grid>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
