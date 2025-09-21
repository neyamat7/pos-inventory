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
    const entries = Object.values(crate)
    const totalQty = entries.reduce((sum, c) => sum + Number(c?.qty || 0), 0)
    const totalValue = entries.reduce((sum, c) => sum + Number(c?.qty || 0) * Number(c?.price || 0), 0)

    return `Qty: ${totalQty} | Value: ${totalValue.toLocaleString()}`
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
                  text: 'View',
                  icon: 'tabler-eye',
                  href: `/people/customers/${row.original.sl}`,
                  linkProps: { className: 'flex items-center gap-2 w-full px-2 py-1' }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => setData(prev => prev.filter(item => item.sl !== row.original.sl)),
                    className: 'flex items-center'
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
                    <th key={header.id}>
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
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
    </>
  )
}

export default CustomerListTable
