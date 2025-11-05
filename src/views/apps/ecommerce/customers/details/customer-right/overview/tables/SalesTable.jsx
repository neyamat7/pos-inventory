'use client'

import { useState } from 'react'

import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'
import {
  CircularProgress,
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Grid,
  Typography,
  Divider,
  Card,
  CardContent
} from '@mui/material'
import { Eye, X } from 'lucide-react'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

// Sales Details Modal Component
const SalesDetailsModal = ({ open, onClose, saleData }) => {
  if (!saleData) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth className='rounded-2xl'>
      <DialogTitle className='flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b'>
        <div>
          <Typography variant='h5' className='font-bold text-gray-800'>
            Sale Details
          </Typography>
          <Typography variant='body2' className='text-gray-600 mt-1'>
            Sale Date: {new Date(saleData.sale_date).toLocaleDateString()}
          </Typography>
        </div>
        <IconButton onClick={onClose} className='hover:bg-white/50'>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent className='p-6 space-y-6'>
        {/* Payment Summary */}
        <Card className='shadow-sm border-0 bg-gradient-to-br from-blue-50 to-indigo-100'>
          <CardContent className='p-4'>
            <Typography variant='h6' className='font-semibold mb-4 text-gray-800'>
              Payment Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <div className='text-center p-3 bg-white rounded-lg shadow-sm'>
                  <Typography variant='body2' className='text-gray-600'>
                    Total Amount
                  </Typography>
                  <Typography variant='h6' className='font-bold text-green-600'>
                    ${parseFloat(saleData.payment_details.payable_amount).toFixed(2)}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <div className='text-center p-3 bg-white rounded-lg shadow-sm'>
                  <Typography variant='body2' className='text-gray-600'>
                    Paid Amount
                  </Typography>
                  <Typography variant='h6' className='font-bold text-blue-600'>
                    ${parseFloat(saleData.payment_details.received_amount).toFixed(2)}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <div className='text-center p-3 bg-white rounded-lg shadow-sm'>
                  <Typography variant='body2' className='text-gray-600'>
                    Due Amount
                  </Typography>
                  <Typography variant='h6' className='font-bold text-orange-600'>
                    ${parseFloat(saleData.payment_details.due_amount).toFixed(2)}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <div className='text-center p-3 bg-white rounded-lg shadow-sm'>
                  <Typography variant='body2' className='text-gray-600'>
                    Payment Type
                  </Typography>
                  <Chip
                    label={
                      saleData.payment_details.payment_type?.charAt(0).toUpperCase() +
                        saleData.payment_details.payment_type?.slice(1) || '-'
                    }
                    color='primary'
                    variant='filled'
                    size='small'
                  />
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Profit & Commission */}
        <Card className='shadow-sm border-0 bg-gradient-to-br from-green-50 to-emerald-100'>
          <CardContent className='p-4'>
            <Typography variant='h6' className='font-semibold mb-4 text-gray-800'>
              Profit & Commission
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <div className='text-center p-3 bg-white rounded-lg shadow-sm'>
                  <Typography variant='body2' className='text-gray-600'>
                    Total Profit
                  </Typography>
                  <Typography variant='h6' className='font-bold text-green-600'>
                    ${parseFloat(saleData.total_profit).toFixed(2)}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={4}>
                <div className='text-center p-3 bg-white rounded-lg shadow-sm'>
                  <Typography variant='body2' className='text-gray-600'>
                    Customer Commission
                  </Typography>
                  <Typography variant='h6' className='font-bold text-purple-600'>
                    ${parseFloat(saleData.total_custom_commission).toFixed(2)}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} sm={4}>
                <div className='text-center p-3 bg-white rounded-lg shadow-sm'>
                  <Typography variant='body2' className='text-gray-600'>
                    Lots Commission
                  </Typography>
                  <Typography variant='h6' className='font-bold text-indigo-600'>
                    ${parseFloat(saleData.total_lots_commission).toFixed(2)}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Products & Lots */}
        <Card className='shadow-sm border-0'>
          <CardContent className='p-4'>
            <Typography variant='h6' className='font-semibold mb-4 text-gray-800'>
              Products & Lots ({saleData.items?.length || 0} items)
            </Typography>
            <div className='space-y-4'>
              {saleData.items?.map((item, index) => (
                <div key={item._id} className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                  <div className='flex items-center justify-between mb-3'>
                    <Typography variant='subtitle1' className='font-semibold text-gray-800'>
                      {item.productId?.productName || 'Unknown Product'}
                    </Typography>
                    <Chip label={`${item.selected_lots?.length || 0} lots`} color='secondary' size='small' />
                  </div>

                  <Divider className='my-3' />

                  <div className='space-y-3'>
                    {item.selected_lots?.map((lot, lotIndex) => (
                      <div key={lot._id} className='bg-white p-3 rounded-lg border border-gray-100 shadow-sm'>
                        <Grid container spacing={2} alignItems='center'>
                          <Grid item xs={12} sm={6}>
                            <Typography variant='body2' className='text-gray-600'>
                              Lot Name
                            </Typography>
                            <Typography variant='body1' className='font-medium'>
                              {lot.lotId?.lot_name || '-'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant='body2' className='text-gray-600'>
                              Quantity
                            </Typography>
                            <Typography variant='body1' className='font-medium'>
                              {lot.kg} kg
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant='body2' className='text-gray-600'>
                              Unit Price
                            </Typography>
                            <Typography variant='body1' className='font-medium text-green-600'>
                              ${parseFloat(lot.unit_price).toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant='body2' className='text-gray-600'>
                              Total Price
                            </Typography>
                            <Typography variant='body1' className='font-medium text-blue-600'>
                              ${parseFloat(lot.total_price).toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant='body2' className='text-gray-600'>
                              Commission
                            </Typography>
                            <Typography variant='body1' className='font-medium text-purple-600'>
                              ${parseFloat(lot.lot_commission_amount).toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant='body2' className='text-gray-600'>
                              Customer Commission
                            </Typography>
                            <Typography variant='body1' className='font-medium text-indigo-600'>
                              ${parseFloat(lot.customer_commission_amount).toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant='body2' className='text-gray-600'>
                              Lot Profit
                            </Typography>
                            <Typography variant='body1' className='font-medium text-green-600'>
                              ${parseFloat(lot.lot_profit).toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

const salesColumns = [
  columnHelper.accessor('sale_date', {
    header: 'Sale Date',
    cell: ({ getValue }) => {
      const date = getValue()

      return date ? new Date(date).toLocaleDateString() : '-'
    }
  }),
  columnHelper.accessor('items', {
    id: 'products_count', // Unique ID
    header: 'Products',
    cell: ({ getValue }) => {
      const items = getValue()

      return items ? `${items.length}` : '0'
    }
  }),
  columnHelper.accessor('items', {
    header: 'Total Lots',
    cell: ({ getValue }) => {
      const items = getValue()
      const totalLots = items?.reduce((sum, item) => sum + (item.selected_lots?.length || 0), 0) || 0

      return `${totalLots}`
    }
  }),
  columnHelper.accessor('payment_details.payable_amount', {
    header: 'Total Amount',
    cell: ({ getValue }) => {
      const value = getValue()

      return value ? parseFloat(value).toFixed(2) : '0.00'
    }
  }),
  columnHelper.accessor('payment_details.received_amount', {
    header: 'Paid Amount',
    cell: ({ getValue }) => {
      const value = getValue()

      return value ? parseFloat(value).toFixed(2) : '0.00'
    }
  }),
  columnHelper.accessor('payment_details.due_amount', {
    header: 'Due Amount',
    cell: ({ getValue }) => {
      const value = getValue()

      return value ? parseFloat(value).toFixed(2) : '0.00'
    }
  }),
  columnHelper.accessor('payment_details.payment_type', {
    header: 'Payment Type',
    cell: ({ getValue }) => {
      const type = getValue()

      return type ? type.charAt(0).toUpperCase() + type.slice(1) : '-'
    }
  }),
  columnHelper.accessor('total_profit', {
    header: 'Total Profit',
    cell: ({ getValue }) => {
      const value = getValue()

      return value ? parseFloat(value).toFixed(2) : '0.00'
    }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <IconButton onClick={() => row.original.viewDetails?.()} className='hover:bg-blue-50 text-blue-600' size='small'>
        <Eye size={18} />
      </IconButton>
    )
  })
]

const SalesTable = ({ data, pagination, total, onPaginationChange, loading }) => {
  const [selectedSale, setSelectedSale] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Handle page change
  const handlePageChange = page => {
    onPaginationChange(page, pagination.limit)
  }

  // Add viewDetails function to each row
  const tableData = data.map(item => ({
    ...item,
    viewDetails: () => {
      setSelectedSale(item)
      setModalOpen(true)
    }
  }))

  const table = useReactTable({
    data: tableData || [],
    columns: salesColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  })

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedSale(null)
  }

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
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={salesColumns.length} className='text-center p-4'>
                No sales found for this customer
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
          paginationData={{
            total: total,
            currentPage: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(total / pagination.limit)
          }}
          onPageChange={handlePageChange}
        />
      )}

      <SalesDetailsModal open={modalOpen} onClose={handleCloseModal} saleData={selectedSale} />
    </>
  )
}

export default SalesTable
