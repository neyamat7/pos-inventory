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

// Payment Detail Modal Component
const PaymentDetailModal = ({ open, onClose, payment }) => {
  if (!payment) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Payment Details</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {/* Basic Payment Info */}
          <Typography variant='h6' gutterBottom>
            Payment Information
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography>
              <strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}
            </Typography>
            <Typography>
              <strong>Payment Method:</strong> {payment.payment_method}
            </Typography>
            <Typography>
              <strong>Transaction ID:</strong> {payment.transactionId || 'N/A'}
            </Typography>
            <Typography>
              <strong>Note:</strong> {payment.note || 'N/A'}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Amount Details */}
          <Typography variant='h6' gutterBottom>
            Amount Details
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography>
              <strong>Payable Amount:</strong> ৳{payment.payable_amount}
            </Typography>
            <Typography>
              <strong>Amount from Balance:</strong> ৳{payment.amount_from_balance}
            </Typography>
            <Typography>
              <strong>Total Paid Amount:</strong> ৳{payment.total_paid_amount}
            </Typography>
            <Typography>
              <strong>Need to Pay Due:</strong> ৳{payment.need_to_pay_due}
            </Typography>
            <Typography>
              <strong>Total Lots Expense:</strong> ৳{payment.total_lots_expense}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Lots Information */}
          <Typography variant='h6' gutterBottom>
            Lots Included
          </Typography>
          {payment.selected_lots_info?.map((lot, index) => (
            <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
              <Typography variant='subtitle1' gutterBottom>
                <strong>Lot:</strong> {lot.lot_id?.lot_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`Sell: ৳${lot.total_sell}`} size='small' />
                <Chip label={`Expense: ৳${lot.total_expenses}`} size='small' />
                <Chip label={`Profit: ৳${lot.profit}`} size='small' color='success' />
                <Chip label={`Discount: ${lot.discount}%`} size='small' color='warning' />
                <Chip label={`Paid: ৳${lot.paid_amount}`} size='small' color='primary' />
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

const PaymentTable = ({ data, pagination, total, onPaginationChange, loading }) => {
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
