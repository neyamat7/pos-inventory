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
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

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

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// -------------------- component --------------------
const columnHelper = createColumnHelper()

const DueListTable = ({ suppliersData, customersData }) => {
  // -------------------- state --------------------
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [filterType, setFilterType] = useState('all') // 'customers' | 'suppliers'

  // local editable copies so Delete action can mutate lists
  const [customerList, setCustomerList] = useState((customersData ?? []).filter(item => Number(item?.due) > 0))

  const [supplierList, setSupplierList] = useState((suppliersData ?? []).filter(item => Number(item?.due) > 0))

  // rehydrate lists if props change
  useEffect(() => {
    setCustomerList((customersData ?? []).filter(item => Number(item?.due) > 0))
  }, [customersData])

  useEffect(() => {
    setSupplierList((suppliersData ?? []).filter(item => Number(item?.due) > 0))
  }, [suppliersData])

  const { lang: locale } = useParams()

  // choose dataset based on filter + only due > 0
  const tableData = useMemo(() => {
    if (filterType === 'customers') return customerList
    if (filterType === 'suppliers') return supplierList

    return [...customerList, ...supplierList]
  }, [customerList, supplierList, filterType])

  // -------------------- helpers --------------------
  const getAvatar = (image, name) => {
    if (image) return <CustomAvatar src={image} skin='light' size={34} />

    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(name || '')}
      </CustomAvatar>
    )
  }

  // -------------------- columns --------------------
  const columns = useMemo(
    () => [
      columnHelper.accessor('sl', { header: 'SL.' }),

      columnHelper.display({
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const { image, name } = row.original

          return (
            <Link href={`/apps/suppliers/details/1`} className='flex items-center gap-3'>
              {getAvatar(image, name)}
              <span className='font-medium hover:text-blue-600 hover:underline'>{name}</span>
            </Link>
          )
        }
      }),

      columnHelper.accessor('email', {
        header: 'Email',
        cell: info => <span className='text-textSecondary'>{info.getValue()}</span>
      }),

      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: info => <span>{info.getValue()}</span>
      }),

      columnHelper.accessor('type', {
        header: 'Type',
        cell: info => <span>{info.getValue()}</span>
      }),

      columnHelper.accessor('due', {
        header: 'Due Amount',
        cell: info => {
          const val = Number(info.getValue() ?? 0)

          return <span className={val > 0 ? 'text-error font-medium' : ''}>{val.toLocaleString()}</span>
        }
      }),

      columnHelper.display({
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'View',
                  icon: 'tabler-eye',

                  // href: `/people/${row.original.type === 'Supplier' ? 'suppliers' : 'customers'}/${row.original.sl}`,
                  href: `/apps/suppliers/details/1`,
                  linkProps: { className: 'flex items-center gap-2 w-full px-2 py-1' }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => {
                      const sl = row.original.sl

                      if (filterType === 'customers') {
                        setCustomerList(prev => prev.filter(item => item.sl !== sl))
                      } else {
                        setSupplierList(prev => prev.filter(item => item.sl !== sl))
                      }
                    },
                    className: 'flex items-center text-red-500 gap-2 w-full px-2 py-1'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [filterType]
  )

  // -------------------- table --------------------
  const table = useReactTable({
    data: tableData,
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

  // -------------------- render --------------------
  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <div className='flex items-center gap-4 max-sm:flex-col max-sm:w-full'>
          <CustomTextField
            select
            label='Show'
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className='min-w-[220px] max-sm:w-full'
          >
            <MenuItem value='all'>All due</MenuItem>
            <MenuItem value='customers'>Customers due</MenuItem>
            <MenuItem value='suppliers'>Suppliers due</MenuItem>
          </CustomTextField>
        </div>

        <div className='flex items-center max-sm:flex-col gap-4 max-sm:w-full'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search name, email, phone'
            className='sm:is-auto max-sm:w-full'
          />
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='is-[90px] max-sm:w-full'
            label='Rows'
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
  )
}

export default DueListTable
