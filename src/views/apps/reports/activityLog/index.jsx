'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'

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
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableSkeleton from '@/components/TableSkeleton'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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

const ActivityLogs = ({ activityLogsData = [], paginationData, loading, onPageChange, onPageSizeChange }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Sync data with props
  useEffect(() => {
    if (activityLogsData) {
      setData(activityLogsData)
    }
  }, [activityLogsData])

  const columns = useMemo(
    () => [
      // Checkbox column
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

      // Date
      {
        accessorKey: 'createdAt',
        header: 'Date & Time',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt)

          return (
            <div className='flex flex-col'>
              <Typography variant='body2' className='font-medium'>
                {date.toLocaleDateString()}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {date.toLocaleTimeString()}
              </Typography>
            </div>
          )
        }
      },

      // User
      {
        accessorKey: 'by',
        header: 'User',
        cell: ({ row }) => {
          const user = row.original.by

          if (!user) return <Typography color='text.secondary'>-</Typography>

          return (
            <div className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='primary' size={34}>
                {getInitials(user.name || 'U')}
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography className='font-medium' color='text.primary'>
                  {user.name || 'Unknown User'}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {user.role || 'User'}
                </Typography>
              </div>
            </div>
          )
        }
      },

      // Action
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <Chip
            label={row.original.action}
            color={
              row.original.action === 'create'
                ? 'success'
                : row.original.action === 'update'
                  ? 'warning'
                  : row.original.action === 'delete'
                    ? 'error'
                    : 'primary'
            }
            variant='tonal'
            size='small'
          />
        )
      },

      // Subject Type
      {
        accessorKey: 'model_name',
        header: 'Page',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original?.model_name}
          </Typography>
        )
      },

      // Description/Note
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const description = row.original.description || row.original.note

          return (
            <Tooltip title={description} arrow>
              <Typography
                variant='body2'
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '300px',
                  cursor: 'pointer'
                }}
              >
                {description || 'No description'}
              </Typography>
            </Tooltip>
          )
        }
      },

      // IP Address (if available)
      {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original.ipAddress || '-'}
          </Typography>
        )
      }
    ],
    []
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
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4 pb-4'>
        <Typography variant='h4' className='font-semibold'>
          Activity Logs
        </Typography>
        <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search activity logs...'
            className='max-sm:is-full'
          />
          <CustomTextField
            select
            value={paginationData?.limit || 10}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className='max-sm:is-full sm:is-[100px]'
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
          <tbody>
            {loading ? (
              <TableSkeleton columns={table.getVisibleFlatColumns().length} />
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center py-8'>
                  <Typography color='text.secondary'>No activity logs found</Typography>
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

      <TablePagination
        component={() => (
          <TablePaginationComponent table={table} paginationData={paginationData} onPageChange={onPageChange} />
        )}
        count={paginationData?.total || 0}
        rowsPerPage={paginationData?.limit || 10}
        page={(paginationData?.currentPage || 1) - 1}
        onPageChange={(_, page) => {
          onPageChange(page + 1)
        }}
      />
    </Card>
  )
}

export default ActivityLogs
