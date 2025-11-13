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

const DueListTable = ({
  tableData,
  paginationData,
  loading,
  selectedType,
  onTypeChange,
  onPageChange,
  onPageSizeChange,
  onSearch,
  searchTerm
}) => {
  // -------------------- state --------------------
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState(searchTerm || '')

  const { lang: locale } = useParams()

  // Handle search changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(globalFilter)
    }, 500)

    return () => clearTimeout(timeout)
  }, [globalFilter, onSearch])

  // Handle initial search term
  useEffect(() => {
    setGlobalFilter(searchTerm || '')
  }, [searchTerm])

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
      columnHelper.accessor('sl', {
        header: 'SL.',
        cell: ({ row }) => {
          const currentPage = paginationData?.currentPage || 1
          const pageSize = paginationData?.limit || 10

          return (currentPage - 1) * pageSize + row.index + 1
        }
      }),

      columnHelper.display({
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const { basic_info, _id } = row.original
          const name = basic_info?.name || 'N/A'
          const role = basic_info?.role || 'customer'

          // Determine the correct link based on role
          const link = role === 'supplier' ? `/apps/suppliers/details/${_id}` : `/apps/customers/details/${_id}`

          return (
            <Link href={link} className='flex items-center gap-3'>
              {getAvatar(null, name)}
              <span className='font-medium hover:text-blue-600 hover:underline'>{name}</span>
            </Link>
          )
        }
      }),

      columnHelper.accessor('contact_info.email', {
        header: 'Email',
        cell: info => <span className='text-textSecondary'>{info.getValue() || '—'}</span>
      }),

      columnHelper.accessor('contact_info.phone', {
        header: 'Phone',
        cell: info => <span>{info.getValue() || '—'}</span>
      }),

      columnHelper.accessor('basic_info.role', {
        header: 'Type',
        cell: info => {
          const role = info.getValue()

          return <span className='capitalize'>{role || '—'}</span>
        }
      }),

      columnHelper.accessor('account_info.due', {
        header: 'Due Amount',
        cell: info => {
          const val = Number(info.getValue() ?? 0)

          return <span className={val > 0 ? 'text-error font-medium' : ''}>৳{val.toLocaleString()}</span>
        }
      })
    ],
    [paginationData]
  )

  // -------------------- table --------------------
  const table = useReactTable({
    data: tableData || [],
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: paginationData?.limit || 10 } },
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
            value={selectedType}
            onChange={e => onTypeChange(e.target.value)}
            className='min-w-[220px] max-sm:w-full'
          >
            <MenuItem value='suppliers'>Suppliers due</MenuItem>
            <MenuItem value='customers'>Customers due</MenuItem>
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
            value={paginationData?.limit || 10}
            onChange={e => onPageSizeChange(Number(e.target.value))}
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

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  <div className='flex items-center justify-center gap-2 p-4'>
                    <i className='tabler-refresh animate-spin' />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td className='whitespace-nowrap border-r' key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Server-side Pagination */}
      <TablePagination
        component={() => (
          <TablePaginationComponent table={table} paginationData={paginationData} onPageChange={onPageChange} />
        )}
        count={paginationData?.total || 0}
        rowsPerPage={paginationData?.limit || 10}
        page={(paginationData?.currentPage || 1) - 1}
        onPageChange={(_, page) => onPageChange(page + 1)}
      />
    </Card>
  )
}

export default DueListTable
