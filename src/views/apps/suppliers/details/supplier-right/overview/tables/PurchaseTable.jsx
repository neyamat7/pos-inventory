'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  createColumnHelper
} from '@tanstack/react-table'
import { Typography, TablePagination, CircularProgress, Box } from '@mui/material'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

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
  })
]

const PurchaseTable = ({ data, pagination, total, onPaginationChange, loading }) => {
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
              <td colSpan={purchaseColumns.length} className='text-center p-4'>
                No lots found for this supplier
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
    </>
  )
}

export default PurchaseTable
