'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  createColumnHelper
} from '@tanstack/react-table'
import { TablePagination, Typography, Box, CircularProgress } from '@mui/material'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

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

      return amount ? `$${parseFloat(amount).toFixed(2)}` : '$0.00'
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
  })
]

const BalanceHistoryTable = ({ data, pagination, total, onPaginationChange, loading }) => {
  // console.log('balance data', data);

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
    </>
  )
}

export default BalanceHistoryTable
