// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Component Imports
import { IconButton } from '@mui/material'
import Swal from 'sweetalert2'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const SalesListTable = ({ salesData, paginationData, loading, onPageChange, onPageSizeChange }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = value => {
    setSearchTerm(value)
    onPageChange(1)
  }

  const columns = [
    {
      accessorKey: 'sale_date',
      header: 'Date',
      cell: ({ row }) => row.original.sale_date || 'N/A'
    },
    {
      accessorKey: 'items',
      header: 'Products',
      cell: ({ row }) => row.original.items?.length || 0
    },
    {
      accessorKey: 'total_profit',
      header: 'Profit',
      cell: ({ row }) => `৳${(row.original.total_profit || 0).toLocaleString()}`
    },
    {
      accessorKey: 'payment_details.payable_amount',
      header: 'Total',
      cell: ({ row }) => `৳${(row.original.payment_details?.payable_amount || 0).toLocaleString()}`
    },
    {
      accessorKey: 'payment_details.received_amount',
      header: 'Paid',
      cell: ({ row }) => `৳${(row.original.payment_details?.received_amount || 0).toLocaleString()}`
    },
    {
      accessorKey: 'payment_details.due_amount',
      header: 'Due',
      cell: ({ row }) => `৳${(row.original.payment_details?.due_amount || 0).toLocaleString()}`
    },
    {
      accessorKey: 'payment_details.payment_type',
      header: 'Payment Type',
      cell: ({ row }) => {
        const receivedAmount = row.original.payment_details?.received_amount || 0
        const paymentType = row.original.payment_details?.payment_type

        return receivedAmount === 0 ? '' : paymentType || 'N/A'
      }
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center'>
          <IconButton
            onClick={() => {
              Swal.fire({
                title: 'Are you sure?',
                text: `You are about to delete this sale. This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              })
            }}
          >
            <i className='tabler-trash text-textSecondary' />
          </IconButton>
        </div>
      ),
      enableSorting: false
    }
  ]

  const table = useReactTable({
    data: salesData || [],
    columns,
    state: {
      rowSelection
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <Card>
      <h1 className='text-2xl xl:text-3xl font-semibold mt-3 ml-4'>Sales List</h1>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <CustomTextField
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          placeholder='Search Sale'
          className='sm:is-auto'
        />

        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <CustomTextField
            select
            value={paginationData?.limit || 10}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className='is-[70px] max-sm:is-full'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>
        </div>
      </CardContent>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className='whitespace-nowrap border-r'>
                    {header.isPlaceholder ? null : (
                      <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className='text-center py-8'>
                  <div className='flex justify-center items-center'>
                    <CircularProgress />
                  </div>
                </td>
              </tr>
            ) : salesData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  No sales data available
                </td>
              </tr>
            ) : (
              salesData.map((row, index) => (
                <tr key={index}>
                  {columns.map(column => (
                    <td className='whitespace-nowrap border-r' key={column.id || column.accessorKey}>
                      {column.cell ? column.cell({ row: { original: row } }) : row[column.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePaginationComponent table={table} paginationData={paginationData} onPageChange={onPageChange} />
    </Card>
  )
}

export default SalesListTable
