'use client'

import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'
import { CircularProgress, Box } from '@mui/material'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const salesColumns = [
  columnHelper.accessor('sale_date', {
    header: 'Sale Date',
    cell: ({ getValue }) => {
      const date = getValue()

      return date ? new Date(date).toLocaleDateString() : '-'
    }
  }),
  columnHelper.accessor('items', {
    header: 'Product',
    cell: ({ getValue }) => {
      const items = getValue()

      return items && items.length > 0 ? items[0].productId.productName : '-'
    }
  }),
  columnHelper.accessor('items', {
    header: 'Lot Name',
    cell: ({ getValue }) => {
      const items = getValue()
      const selectedLots = items && items.length > 0 ? items[0].selected_lots : []

      return selectedLots && selectedLots.length > 0 ? selectedLots[0].lotId.lot_name : '-'
    }
  }),
  columnHelper.accessor('items', {
    header: 'Quantity (Kg)',
    cell: ({ getValue }) => {
      const items = getValue()
      const selectedLots = items && items.length > 0 ? items[0].selected_lots : []

      return selectedLots && selectedLots.length > 0 ? selectedLots[0].kg : '0'
    }
  }),
  columnHelper.accessor('items', {
    header: 'Unit Price',
    cell: ({ getValue }) => {
      const items = getValue()
      const selectedLots = items && items.length > 0 ? items[0].selected_lots : []
      const value = selectedLots && selectedLots.length > 0 ? selectedLots[0].unit_price : 0

      return `$${parseFloat(value).toFixed(2)}`
    }
  }),
  columnHelper.accessor('payment_details.payable_amount', {
    header: 'Total Amount',
    cell: ({ getValue }) => {
      const value = getValue()

      return value ? `$${parseFloat(value).toFixed(2)}` : '$0.00'
    }
  }),
  columnHelper.accessor('payment_details.received_amount', {
    header: 'Paid Amount',
    cell: ({ getValue }) => {
      const value = getValue()

      return value ? `$${parseFloat(value).toFixed(2)}` : '$0.00'
    }
  }),
  columnHelper.accessor('payment_details.due_amount', {
    header: 'Due Amount',
    cell: ({ getValue }) => {
      const value = getValue()

      return value ? `$${parseFloat(value).toFixed(2)}` : '$0.00'
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

      return value ? `$${parseFloat(value).toFixed(2)}` : '$0.00'
    }
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created At',
    cell: ({ getValue }) => {
      const date = getValue()

      return date ? new Date(date).toLocaleDateString() : '-'
    }
  })
]

const SalesTable = ({ data, pagination, total, onPaginationChange, loading }) => {
  console.log('data', data)

  // Handle page change
  const handlePageChange = page => {
    onPaginationChange(page, pagination.limit)
  }

  const table = useReactTable({
    data: data || [],
    columns: salesColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
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
    </>
  )
}

export default SalesTable
