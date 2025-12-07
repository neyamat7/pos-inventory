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
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from '@mui/material'

import { DollarSign } from 'lucide-react'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

import PaymentModal from './PaymentModal'
import { getUnpaidStockOutLots } from '@/actions/lotActions'
import OptionMenu from '@/@core/components/option-menu'

const columnHelper = createColumnHelper()

const ProductTable = ({ data, pagination, total, onPaginationChange, loading, supplierData }) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [unpaidLotsData, setUnpaidLotsData] = useState([])

  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)

  // console.log('data in supplier lot tab', data)

  useEffect(() => {
    const fetchUnpaidLots = async () => {
      try {
        const result = await getUnpaidStockOutLots()

        if (result.success) {
          setUnpaidLotsData(result?.data || [])
        }
      } catch (error) {
        console.error('Error fetching unpaid lots:', error)
      }
    }

    fetchUnpaidLots()
  }, [])

  const stockColumns = [
    columnHelper.accessor('lot_name', {
      header: 'Lot Name',
      cell: info => info.getValue() || 'N/A'
    }),
    columnHelper.accessor('productsId[0].productName', {
      header: 'Product Name',
      cell: info => info.getValue() || 'N/A'
    }),
    columnHelper.accessor('purchase_date', {
      header: 'Purchase Date',
      cell: info => {
        const date = info.getValue()

        return date ? new Date(date).toLocaleDateString() : 'N/A'
      }
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue()

        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'
      }
    }),
    columnHelper.accessor('payment_status', {
      header: 'Payment Status',
      cell: info => {
        const status = info.getValue()

        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'
      }
    }),
    columnHelper.accessor('box_quantity', {
      header: 'Total Boxes',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('remaining_boxes', {
      header: 'Remaining Boxes',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('costs.unitCost', {
      header: 'Unit Cost',
      cell: info => `$${info.getValue() || 0}`
    }),
    columnHelper.accessor('carat.carat_Type_1', {
      header: 'Carat Type 1',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('carat.carat_Type_2', {
      header: 'Carat Type 2',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('sales.totalKgSold', {
      header: 'Kg Sold',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('profits.totalProfit', {
      header: 'Total Profit',
      cell: info => `${info.getValue() || 0}`
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'Add Expense',
                icon: 'tabler-plus',
                menuItemProps: {
                  onClick: () => {
                    setSelectedLot(row.original)
                    setExpenseModalOpen(true)
                  },
                  className: 'flex items-center'
                }
              },
              {
                text: 'Show Details',
                icon: 'tabler-eye',
                menuItemProps: {
                  onClick: () => {
                    console.log('Showing details for lot:', row.original)

                    // Will implement details modal later
                  },
                  className: 'flex items-center'
                }
              }
            ]}
          />
        </div>
      )
    })
  ]

  const table = useReactTable({
    data: data || [],
    columns: stockColumns,
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

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={() => setPaymentModalOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Clear Payment
        </Button>
      </Box>

      <table className={`${tableStyles.table} border border-gray-200 border-collapse`}>
        <thead>
          {table.getHeaderGroups().map(group => (
            <tr key={group.id}>
              {group.headers.map(header => (
                <th className='border border-gray-200' key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={stockColumns.length} className='text-center p-4'>
                No data available
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td className='border border-gray-200' key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={total}
        rowsPerPage={pagination.limit}
        page={pagination.page - 1}
        onPageChange={(_, page) => onPaginationChange(page + 1, pagination.limit)}
        onRowsPerPageChange={event => onPaginationChange(1, parseInt(event.target.value, 10))}
      />

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        supplierData={supplierData}
        lotsData={unpaidLotsData}
        supplierId={supplierData?._id}
      />

      <AddExpenseModal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} lot={selectedLot} />
    </>
  )
}

export default ProductTable

// Optional: Update AddExpenseModal to show lot information
const AddExpenseModal = ({ open, onClose, lot }) => {
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseReason, setExpenseReason] = useState('')

  const handleSubmit = () => {
    console.log('Submitting expense for lot:', lot?._id)
    console.log('Lot name:', lot?.lot_name)
    console.log('Expense amount:', expenseAmount)
    console.log('Expense reason:', expenseReason)

    // Reset and close
    setExpenseAmount('')
    setExpenseReason('')
    onClose()
  }

  const handleClose = () => {
    // Reset form on close
    setExpenseAmount('')
    setExpenseReason('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Add Extra Expense for {lot?.lot_name || 'Lot'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='Expense Amount'
          type='number'
          fullWidth
          value={expenseAmount}
          onChange={e => setExpenseAmount(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label='Reason for Expense'
          multiline
          rows={3}
          fullWidth
          value={expenseReason}
          onChange={e => setExpenseReason(e.target.value)}
          placeholder='Enter the reason for this extra expense...'
          variant='outlined'
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant='contained' color='primary'>
          Add Expense
        </Button>
      </DialogActions>
    </Dialog>
  )
}
