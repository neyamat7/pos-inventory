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

const ProductTable = ({ data }) => {

  console.log('lots data', data);

  const table = useReactTable({
    data: data || [],
    columns: stockColumns,
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
              <td colSpan={stockColumns.length} className='text-center p-4'>
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
