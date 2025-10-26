'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  createColumnHelper
} from '@tanstack/react-table'
import { TablePagination } from '@mui/material'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const productColumns = [
  columnHelper.accessor('lotName', { header: 'Lot Name' }),
  columnHelper.accessor('product', { header: 'Product' }),
  columnHelper.accessor('receivedDate', { header: 'Received Date' }),
  columnHelper.accessor('quantity', { header: 'Quantity' }),
  columnHelper.accessor('totalAmount', { header: 'Total Amount' }),
  columnHelper.accessor('dueAmount', { header: 'Due Amount' }),
  columnHelper.accessor('status', { header: 'Status' })
]

const ProductTable = ({ data }) => {
  const table = useReactTable({
    data,
    columns: productColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
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
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={productColumns.length} className='text-center p-4'>
                No data available
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

      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </>
  )
}

export default ProductTable
