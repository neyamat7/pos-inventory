'use client'

import { useEffect, useState } from 'react'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  createColumnHelper
} from '@tanstack/react-table'
import { TablePagination, Button, Box } from '@mui/material'

import { DollarSign } from 'lucide-react'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

import PaymentModal from './PaymentModal'
import { getUnpaidStockOutLots } from '@/actions/lotActions'

const columnHelper = createColumnHelper()

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
    cell: info => `$${info.getValue() || 0}`
  })
]

const ProductTable = ({ data, pagination, total, onPaginationChange, loading, supplierData }) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [unpaidLotsData, setUnpaidLotsData] = useState([])

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
          startIcon={<DollarSign size={18} />}
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
    </>
  )
}

export default ProductTable
