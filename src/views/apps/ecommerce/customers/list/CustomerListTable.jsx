'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'

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
import AddCustomerDrawer from './AddCustomerDrawer'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// -------------------- utils --------------------
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper()

// -------------------- component --------------------
const CustomerListTable = ({ customerData }) => {
  // States
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[customerData]) // keep your pattern
  const [globalFilter, setGlobalFilter] = useState('')

  // For modals
  const [openBalanceModal, setOpenBalanceModal] = useState(false)
  const [openCrateModal, setOpenCrateModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [newBalance, setNewBalance] = useState('')
  const [crateForm, setCrateForm] = useState({})

  // Hooks
  const { lang: locale } = useParams()

  // Re-sync data if prop changes
  useEffect(() => {
    setData(customerData || [])
  }, [customerData])

  // Helpers
  const getAvatar = ({ image, name }) => {
    if (image) return <CustomAvatar src={image} skin='light' size={34} />

    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(name || '')}
      </CustomAvatar>
    )
  }

  const getCrateSummary = crate => {
    if (!crate) return '—'

    // show each crate type with qty only
    return Object.entries(crate)
      .map(([key, val]) => `${key.replace('_', ' ')}: ${val.qty}`)
      .join(' | ')
  }

  // Columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },

      columnHelper.accessor('sl', {
        header: 'SL',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.sl}</Typography>
      }),

      columnHelper.accessor('name', {
        header: 'NAME',
        cell: ({ row, getValue }) => {
          const name = getValue()
          const { image, email } = row.original

          return (
            <div className='flex items-center gap-3'>
              {getAvatar({ image, name })}
              <div className='flex flex-col'>
                <Link href={`/apps/customers/details/${row.original.sl}`}>
                  <Typography className='font-medium hover:text-blue-500 hover:underline' color='text.primary'>
                    {name}
                  </Typography>
                </Link>
                {email ? <Typography variant='body2'>{email}</Typography> : null}
              </div>
            </div>
          )
        }
      }),

      columnHelper.accessor('phone', {
        header: 'PHONE',
        cell: info => <Typography>{info.getValue()}</Typography>
      }),

      columnHelper.accessor('balance', {
        header: 'BALANCE',
        cell: info => <Typography>{Number(info.getValue() || 0).toLocaleString()}</Typography>
      }),

      columnHelper.accessor('crate', {
        header: 'CRATE',
        cell: ({ row }) => <Typography>{getCrateSummary(row.original.crate)}</Typography>
      }),

      columnHelper.accessor('cost', {
        header: 'COST',
        cell: info => <Typography>{Number(info.getValue() || 0).toLocaleString()}</Typography>
      }),

      columnHelper.accessor('due', {
        header: 'DUE',
        cell: info => {
          const val = Number(info.getValue() || 0)

          return <Typography className={val > 0 ? 'text-error font-medium' : ''}>{val.toLocaleString()}</Typography>
        }
      }),

      columnHelper.display({
        id: 'action',
        header: 'ACTION',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Add Balance',
                  icon: 'tabler-coin',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedCustomer(row.original)
                      setNewBalance('')
                      setOpenBalanceModal(true)
                    },
                    className: 'flex items-center'
                  }
                },
                {
                  text: 'Add Crate',
                  icon: 'tabler-box',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedCustomer(row.original)
                      const crateObj = row.original.crate || {}

                      const form = Object.keys(crateObj).reduce((acc, key) => {
                        acc[key] = { qty: crateObj[key].qty, price: crateObj[key].price }

                        return acc
                      }, {})

                      setCrateForm(form)
                      setOpenCrateModal(true)
                    },
                    className: 'flex items-center'
                  }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: async () => {
                      const Swal = (await import('sweetalert2')).default

                      Swal.fire({
                        title: 'Are you sure?',
                        text: `You are about to delete ${row.original.name}. This action cannot be undone.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, delete it!'
                      }).then(result => {
                        if (result.isConfirmed) {
                          setData(prev => prev.filter(item => item.sl !== row.original.sl))
                          Swal.fire('Deleted!', `${row.original.name} has been removed.`, 'success')
                        }
                      })
                    },
                    className: 'flex items-center text-red-500'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [] // static columns for this table
  )

  // Table
  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search name, phone, email'
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
              Add Customer
            </Button>
          </div>
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='whitespace-nowrap border-r text-sm'>
                      {header.isPlaceholder ? null : (
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
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td className='whitespace-nowrap border-r' key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />
      </Card>

      <AddCustomerDrawer
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        setData={setData}
        customerData={data}
      />

      {/* Add Balance Modal */}
      {openBalanceModal && selectedCustomer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-md bg-white text-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300'>
            <Typography variant='h6' className='mb-4 font-semibold text-gray-900'>
              Add Balance for <span className='text-primary'>{selectedCustomer.name}</span>
            </Typography>

            <Typography variant='body2' className='text-gray-600 mb-3'>
              Enter the amount you want to add to this customer&aposs balance.
            </Typography>

            <CustomTextField
              fullWidth
              label='Amount (৳)'
              type='number'
              value={newBalance}
              onChange={e => setNewBalance(e.target.value)}
              InputProps={{
                style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
              }}
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                '& input': { color: '#111827' },
                '& label': { color: '#6b7280' }
              }}
            />

            <div className='flex justify-end gap-3 mt-6'>
              <Button
                variant='outlined'
                onClick={() => setOpenBalanceModal(false)}
                className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition'
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                color='primary'
                className='px-5 py-2 rounded-lg shadow-md'
                onClick={() => {
                  if (!newBalance) return
                  setData(prev =>
                    prev.map(item =>
                      item.sl === selectedCustomer.sl ? { ...item, balance: item.balance + Number(newBalance) } : item
                    )
                  )
                  setOpenBalanceModal(false)
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Crate Modal */}
      {openCrateModal && selectedCustomer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-lg bg-white text-gray-800 rounded-2xl shadow-2xl p-6 transition-all duration-300'>
            <Typography variant='h6' className='mb-4 font-semibold text-gray-900'>
              Update Crates for <span className='text-primary'>{selectedCustomer.name}</span>
            </Typography>

            <Typography variant='body2' className='text-gray-600 mb-3'>
              You can adjust the quantity and price for each crate type.
            </Typography>

            <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
              {Object.entries(crateForm).map(([key, val]) => (
                <div key={key} className='grid grid-cols-2 gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200'>
                  <CustomTextField
                    label={`${key.replace('_', ' ')} Qty`}
                    type='number'
                    value={val.qty}
                    onChange={e =>
                      setCrateForm(prev => ({
                        ...prev,
                        [key]: { ...prev[key], qty: Number(e.target.value) }
                      }))
                    }
                    InputProps={{
                      style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
                    }}
                    sx={{
                      '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                      '& input': { color: '#111827' },
                      '& label': { color: '#6b7280' }
                    }}
                  />
                  <CustomTextField
                    label={`${key.replace('_', ' ')} Price`}
                    type='number'
                    value={val.price}
                    onChange={e =>
                      setCrateForm(prev => ({
                        ...prev,
                        [key]: { ...prev[key], price: Number(e.target.value) }
                      }))
                    }
                    InputProps={{
                      style: { backgroundColor: '#f9fafb', borderRadius: '8px', color: '#111827' }
                    }}
                    sx={{
                      '& .MuiInputBase-root': { bgcolor: '#f9fafb', borderRadius: '8px' },
                      '& input': { color: '#111827' },
                      '& label': { color: '#6b7280' }
                    }}
                  />
                </div>
              ))}
            </div>

            <div className='flex justify-end gap-3 mt-6'>
              <Button
                variant='outlined'
                onClick={() => setOpenCrateModal(false)}
                className='px-4 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 transition'
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                color='primary'
                className='px-5 py-2 rounded-lg shadow-md'
                onClick={() => {
                  setData(prev =>
                    prev.map(item => (item.sl === selectedCustomer.sl ? { ...item, crate: crateForm } : item))
                  )
                  setOpenCrateModal(false)
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CustomerListTable
