'use client'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'

import { TablePagination } from '@mui/material'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

// Create column helper
const columnHelper = createColumnHelper()

// -------------------------------------------------------------
// 📘 Column Definitions
// -------------------------------------------------------------
const returnColumns = [
  columnHelper.accessor('date', {
    header: 'Date',
    cell: info => new Date(info.getValue()).toLocaleDateString()
  }),
  columnHelper.accessor('supplierId', {
    header: 'Supplier ID'
  }),
  columnHelper.accessor('product', {
    header: 'Product'
  }),
  columnHelper.accessor('lotName', {
    header: 'Lot Name'
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    cell: info => <span>{info.getValue()} kg</span>
  }),
  columnHelper.accessor('amount', {
    header: 'Amount (৳)',
    cell: info => <span>৳{info.getValue().toLocaleString()}</span>
  }),
  columnHelper.accessor('reason', {
    header: 'Reason',
    cell: info => (
      <span className='text-gray-600 max-w-[200px] block truncate' title={info.getValue()}>
        {info.getValue()}
      </span>
    )
  })
]

// -------------------------------------------------------------
// 📘 Component
// -------------------------------------------------------------
const ReturnTable = ({ data }) => {
  const table = useReactTable({
    data,
    columns: returnColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  return (
    <div className='w-full'>
      <div className='overflow-x-auto'>
        <table className={`${tableStyles.table} min-w-[800px]`}>
          {/* Table Head */}
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Table Body */}
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={returnColumns.length} className='text-center p-4'>
                  No return data available
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
      </div>

      {/* Pagination */}
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </div>
  )
}

export default ReturnTable
