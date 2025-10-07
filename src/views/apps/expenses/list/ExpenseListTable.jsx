'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useForm } from 'react-hook-form'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import Swal from 'sweetalert2'

import AddExpenseDrawer from './AddExpenseDrawer'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

export const paymentStatus = {
  1: { text: 'Paid', color: 'success' },
  2: { text: 'Pending', color: 'warning' },
  3: { text: 'Cancelled', color: 'secondary' },
  4: { text: 'Failed', color: 'error' }
}
export const statusChipColor = {
  Delivered: { color: 'success' },
  'Out for Delivery': { color: 'primary' },
  'Ready to Pickup': { color: 'info' },
  Dispatched: { color: 'warning' }
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper()

const ExpenseListTable = ({ expenseData }) => {
  // States
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[expenseData])
  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo(
    () => [
      // ✅ Checkbox column
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },

      // ✅ Expense data fields
      { accessorKey: 'sl', header: 'SL' },
      { accessorKey: 'amount', header: 'Amount' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'expenseFor', header: 'Expense For' },
      { accessorKey: 'paymentType', header: 'Payment Type' },
      { accessorKey: 'referenceNumber', header: 'Reference Number' },
      { accessorKey: 'expenseDate', header: 'Expense Date' },

      // ✅ Action column
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => <ActionMenu row={row} setData={setData} />,
        enableSorting: false
      }
    ],
    [setData]
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = params => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(customer)}
        </CustomAvatar>
      )
    }
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search'
            className='max-sm:is-full'
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='is-full sm:is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
              <MenuItem value='100'>100</MenuItem>
            </CustomTextField>

            <Button
              variant='contained'
              color='primary'
              className='max-sm:is-full'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setCustomerUserOpen(!customerUserOpen)}
            >
              Add Expense
            </Button>
          </div>
        </CardContent>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='tabler-chevron-up text-xl' />,
                              desc: <i className='tabler-chevron-down text-xl' />
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <AddExpenseDrawer
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        setData={setData}
        expenseData={data}
      />
    </>
  )
}

export default ExpenseListTable

// Updated ActionMenu
const ActionMenu = ({ row, setData }) => {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // React Hook Form setup
  const { register, handleSubmit, reset } = useForm({
    defaultValues: row.original
  })

  // Handle save
  const onSubmit = values => {
    setData(prev => prev.map(item => (item.sl === row.original.sl ? { ...item, ...values } : item)))
    setEditOpen(false)
    setOpen(false)
  }

  // Open modal & reset with current data
  const handleEdit = () => {
    reset(row.original)
    setEditOpen(true)
    setOpen(false)
  }

  return (
    <div className='relative'>
      {/* 3-dot trigger */}
      <button onClick={() => setOpen(prev => !prev)} className='p-2 rounded hover:bg-gray-100 transition'>
        ⋮
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className='absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-10'>
          <button onClick={handleEdit} className='flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100'>
            ✏️ Edit
          </button>

          <button
            onClick={async () => {
              Swal.fire({
                title: 'Are you sure?',
                text: `You are about to delete expense ${row.original.referenceNumber}. This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
              }).then(result => {
                if (result.isConfirmed) {
                  setData(prev => prev.filter(item => item.sl !== row.original.sl))
                  Swal.fire('Deleted!', `Expense ${row.original.referenceNumber} has been removed.`, 'success')
                }
              })
              setOpen(false)
            }}
            className='flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 text-red-500'
          >
            🗑 Delete
          </button>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {editOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6'>
            <Typography variant='h6' className='mb-4 font-semibold text-gray-900'>
              Edit Expense — <span className='text-primary'>{row.original.referenceNumber}</span>
            </Typography>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <CustomTextField label='Amount' type='number' {...register('amount')} fullWidth />
                <CustomTextField label='Category' {...register('category')} fullWidth />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <CustomTextField label='Expense For' {...register('expenseFor')} fullWidth />
                <CustomTextField label='Payment Type' {...register('paymentType')} fullWidth />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <CustomTextField label='Reference Number' {...register('referenceNumber')} fullWidth />
                <CustomTextField label='Expense Date' type='date' {...register('expenseDate')} fullWidth />
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-3 pt-6'>
                <Button
                  variant='outlined'
                  color='inherit'
                  onClick={() => setEditOpen(false)}
                  className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition'
                >
                  Cancel
                </Button>
                <Button variant='contained' color='primary' className='px-5 py-2 rounded-lg shadow-md' type='submit'>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
