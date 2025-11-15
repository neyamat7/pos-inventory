'use client'

import { useState } from 'react'

import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import {
  TablePagination,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Divider,
  Chip
} from '@mui/material'
import { Eye } from 'lucide-react'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import { getImageUrl } from '@/utils/getImageUrl'

// Payment Detail Modal Component
const PaymentDetailModal = ({ open, onClose, payment }) => {
  if (!payment) return null

  const proofImageUrl = payment.proof_img ? getImageUrl(payment.proof_img) : ''

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
          Payment Details
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ py: 2 }}>
          {/* Supplier Information */}
          <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Supplier Information
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {payment.supplierId?.basic_info?.avatar && (
                <img
                  src={payment.supplierId.basic_info.avatar}
                  alt='Supplier Avatar'
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <Box>
                <Typography variant='h6' component='div' fontWeight='bold'>
                  {payment.supplierId?.basic_info?.name || 'N/A'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {payment.supplierId?.contact_info?.email || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Typography component='div'>
                <strong>Account No:</strong> {payment.supplierId?.account_info?.accountNumber || 'N/A'}
              </Typography>
              <Typography component='div'>
                <strong>Phone:</strong> {payment.supplierId?.contact_info?.phone || 'N/A'}
              </Typography>
              <Typography component='div'>
                <strong>Location:</strong> {payment.supplierId?.contact_info?.location || 'N/A'}
              </Typography>
            </Box>
          </Box>

          {/* Basic Payment Info */}
          <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Payment Information
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <Typography component='div'>
                <strong>Date:</strong> {new Date(payment.date).toLocaleDateString('en-GB')}
              </Typography>
              <Typography component='div'>
                <strong>Payment Method:</strong>
                <Chip label={payment.payment_method?.toUpperCase()} size='small' color='primary' sx={{ ml: 1 }} />
              </Typography>
              <Typography component='div'>
                <strong>Transaction ID:</strong> {payment.transactionId || 'N/A'}
              </Typography>
              <Typography component='div'>
                <strong>Created:</strong> {new Date(payment.createdAt).toLocaleString('en-GB')}
              </Typography>
            </Box>
            {payment.note && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant='body2' component='div'>
                  <strong>Note:</strong> {payment.note}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Amount Details */}
          <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Amount Details
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 3,
              mb: 4
            }}
          >
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Payable Amount
              </Typography>
              <Typography variant='h6' component='div' fontWeight='bold'>
                ৳{payment.payable_amount}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                From Balance
              </Typography>
              <Typography variant='h6' component='div' fontWeight='bold'>
                ৳{payment.amount_from_balance}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Paid Amount
              </Typography>
              <Typography variant='h6' component='div' fontWeight='bold'>
                ৳{payment.total_paid_amount}
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                bgcolor: payment.need_to_pay_due > 0 ? 'error.light' : 'success.light',
                borderRadius: 2
              }}
            >
              <Typography variant='body2' color='text.secondary'>
                Due Amount
              </Typography>
              <Typography
                variant='h6'
                component='div'
                fontWeight='bold'
                color={payment.need_to_pay_due > 0 ? 'error.main' : 'success.main'}
              >
                ৳{payment.need_to_pay_due}
              </Typography>
            </Box>
          </Box>

          {/* Proof Image Section */}
          {proofImageUrl && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                Payment Proof
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
                  Payment Slip / Document
                </Typography>
                <img
                  src={proofImageUrl}
                  alt='Payment Proof'
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0'
                  }}
                  onError={e => {
                    e.target.style.display = 'none'
                  }}
                />
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                  Image URL: {proofImageUrl}
                </Typography>
              </Box>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Lots Information */}
          <Typography variant='h6' component='h3' gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Lots Included ({payment.selected_lots_info?.length || 0})
          </Typography>
          {payment.selected_lots_info?.map((lot, index) => (
            <Box
              key={index}
              sx={{
                p: 3,
                border: '2px solid',
                borderColor: 'primary.light',
                borderRadius: 2,
                mb: 3,
                bgcolor: 'primary.50'
              }}
            >
              <Typography variant='subtitle1' component='div' gutterBottom fontWeight='bold' color='primary.main'>
                {lot.lot_id?.lot_name || `Lot ${index + 1}`}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 2 }}>
                <Typography variant='body2' component='div'>
                  <strong>Product:</strong> {lot.lot_id?.productsId?.productName || 'N/A'}
                </Typography>
                <Typography variant='body2' component='div'>
                  <strong>Status:</strong>
                  <Chip
                    label={lot.lot_id?.status || 'N/A'}
                    size='small'
                    color={lot.lot_id?.status === 'stock out' ? 'success' : 'warning'}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant='body2' component='div'>
                  <strong>Purchase Date:</strong>{' '}
                  {lot.lot_id?.purchase_date ? new Date(lot.lot_id.purchase_date).toLocaleDateString('en-GB') : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label={`Total Sell: ৳${lot.total_sell || 0}`} size='small' variant='outlined' />
                <Chip
                  label={`Total Expense: ৳${lot.total_expenses || 0}`}
                  size='small'
                  variant='outlined'
                  color='warning'
                />
                <Chip
                  label={`Profit: ৳${lot.profit || 0}`}
                  size='small'
                  color={lot.profit >= 0 ? 'success' : 'error'}
                />
                <Chip label={`Discount: ${lot.discount || 0}%`} size='small' color='secondary' />
                <Chip label={`Paid Amount: ৳${lot.paid_amount || 0}`} size='small' color='primary' variant='filled' />
              </Box>

              {/* Lot Details */}
              {lot.lot_id && (
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant='body2' component='div' gutterBottom>
                    <strong>Lot Details:</strong>
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1 }}>
                    <Typography variant='caption' component='div'>
                      Carat: {(lot.lot_id.carat?.carat_Type_1 || 0) + (lot.lot_id.carat?.carat_Type_2 || 0)}
                    </Typography>
                    <Typography variant='caption' component='div'>
                      Unit Cost: ৳{lot.lot_id.costs?.unitCost || 0}
                    </Typography>
                    <Typography variant='caption' component='div'>
                      Commission: {lot.lot_id.costs?.commissionRate || 0}%
                    </Typography>
                    <Typography variant='caption' component='div'>
                      Total Expenses: ৳{lot.lot_id.expenses?.total_expenses || 0}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

const PaymentTable = ({ data, pagination, total, onPaginationChange, loading }) => {
  console.log('payments', data)

  const [selectedPayment, setSelectedPayment] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const columns = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString()
    },
    {
      accessorKey: 'payment_method',
      header: 'Method',
      cell: ({ getValue }) => getValue().toUpperCase()
    },
    {
      accessorKey: 'payable_amount',
      header: 'Payable Amount',
      cell: ({ getValue }) => `৳${getValue()}`
    },
    {
      accessorKey: 'amount_from_balance',
      header: 'From Balance',
      cell: ({ getValue }) => `৳${getValue()}`
    },
    {
      accessorKey: 'total_paid_amount',
      header: 'Paid Amount',
      cell: ({ getValue }) => `৳${getValue()}`
    },
    {
      accessorKey: 'need_to_pay_due',
      header: 'Due Amount',
      cell: ({ getValue }) => `৳${getValue()}`
    },
    {
      accessorKey: 'transactionId',
      header: 'Transaction ID',
      cell: ({ getValue }) => getValue() || 'N/A'
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: ({ getValue }) => getValue() || '—'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <IconButton
          size='small'
          onClick={() => {
            setSelectedPayment(row.original)
            setModalOpen(true)
          }}
        >
          <Eye size={16} />
        </IconButton>
      )
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / (pagination?.limit || 10))
  })

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
          {loading ? (
            <tr>
              <td colSpan={columns.length} className='text-center p-4'>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className='text-center p-4'>
                No payment data available
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

      {/* Server-side Pagination */}
      <TablePagination
        component={() => (
          <TablePaginationComponent
            table={table}
            paginationData={{
              total,
              currentPage: pagination?.page || 1,
              limit: pagination?.limit || 10
            }}
            onPageChange={page => onPaginationChange(page, pagination?.limit || 10)}
          />
        )}
        count={total}
        rowsPerPage={pagination?.limit || 10}
        page={(pagination?.page || 1) - 1}
        onPageChange={(_, page) => onPaginationChange(page + 1, pagination?.limit || 10)}
      />

      {/* Payment Detail Modal */}
      <PaymentDetailModal open={modalOpen} onClose={() => setModalOpen(false)} payment={selectedPayment} />
    </>
  )
}

export default PaymentTable
