// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
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

import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import ViewPurchaseModal from './ViewPurchaseModal'
import { createLots, updatePurchaseStatus } from '@/actions/purchaseActions'
import TableSkeleton from '@/components/TableSkeleton'
import { showSuccess, showError } from '@/utils/toastUtils'

const statusOptions = ['on the way', 'received', 'canceled']

const statusChipColor = {
  'on the way': { color: 'warning' },
  received: { color: 'success' },
  canceled: { color: 'error' }
}

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
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const PurchaseListTable = ({ purchaseData = [], paginationData, loading, onPageChange, onPageSizeChange }) => {

  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(purchaseData)
  const [globalFilter, setGlobalFilter] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  useEffect(() => {
    setData(purchaseData)
  }, [purchaseData])

  // Handler for status change
  const handleStatusChange = async (purchaseId, newStatus) => {
    // console.log('Updating status:', purchaseId, newStatus)

    // Store original value for rollback
    const originalStatus = data.find(purchase => purchase._id === purchaseId)?.status

    // Call backend first (no optimistic update)
    const result = await updatePurchaseStatus(purchaseId, newStatus)

    if (result.success) {
      // Update state only after success
      setData(prev => prev.map(purchase => (purchase._id === purchaseId ? { ...purchase, status: newStatus } : purchase)))
      showSuccess('Status changed successfully!')
    } else {
      showError(result.error || 'Failed to update status')
    }
  }

  // Handler for create lots
  const handleCreateLots = async purchaseId => {
    // console.log('Creating lots for:', purchaseId)

    // Optimistic update
    setData(prev =>
      prev.map(purchase => (purchase._id === purchaseId ? { ...purchase, is_lots_created: true } : purchase))
    )

    const result = await createLots(purchaseId)

    if (result.success) {
      showSuccess('Lots created successfully!')
    } else {
      // Rollback on failure
      setData(prev =>
        prev.map(purchase => (purchase._id === purchaseId ? { ...purchase, is_lots_created: false } : purchase))
      )
      showError(result.error || 'Failed to create lots')
    }
  }

  const columns = [
    {
      accessorKey: 'purchase_date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.purchase_date).toLocaleDateString('en-GB')
    },

    // {
    //   accessorKey: 'supplier',
    //   header: 'Supplier',
    //   cell: ({ row }) => row.original.items?.[0]?.supplier?.basic_info?.name || 'N/A'
    // },
    {
      accessorKey: 'items_count',
      header: 'Suppliers',
      cell: ({ row }) => row.original.items?.length || 0
    },
    {
      accessorKey: 'lots_count',
      header: 'Lots',
      cell: ({ row }) => row.original.items?.reduce((sum, item) => sum + (item.lots?.length || 0), 0) || 0
    },
    {
      accessorKey: 'total_expenses',
      header: 'Total Expenses',
      cell: ({ row }) => {
        const expenses = row.original.total_expenses

        if (!expenses) return '0'

        const total = Object.values(expenses).reduce((sum, val) => sum + (Number(val) || 0), 0)

        return total.toLocaleString()
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <CustomTextField
          select
          value={row.original.status || 'on the way'}
          onChange={e => handleStatusChange(row.original._id, e.target.value)}
          size='small'
          className='min-is-[140px]'
          disabled={row.original.is_lots_created}
        >
          {statusOptions.map(option => (
            <MenuItem key={option} value={option}>
              <Chip label={option} color={statusChipColor[option]?.color || 'default'} size='small' variant='tonal' />
            </MenuItem>
          ))}
        </CustomTextField>
      )
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const isStatusOnTheWay = row.original.status === 'on the way'
        const isLotsCreated = row.original.is_lots_created
        const isCreateLotsDisabled = isStatusOnTheWay || isLotsCreated

        return (
          <div className='flex items-center gap-2'>
            <Button
              variant='contained'
              size='small'
              onClick={() => handleCreateLots(row.original._id)}
              disabled={isCreateLotsDisabled}
            >
              {isLotsCreated ? 'Lots Created' : 'Create Lots'}
            </Button>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'View',
                  icon: 'tabler-eye',
                  menuItemProps: {
                    onClick: () => {
                      setSelectedRow(row.original)
                      setViewOpen(true)
                    },
                    className: 'flex items-center'
                  }
                }
              ]}
            />
          </div>
        )
      },
      enableSorting: false
    }
  ]

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
    <>
      <Card>
        <h1 className='mt-3 ml-4 text-3xl font-semibold'>Purchase List</h1>
        <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Purchase'
            className='sm:is-auto'
          />
          <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <CustomTextField
              select
              value={paginationData?.limit || table.getState().pagination.pageSize}
              onChange={e =>
                onPageSizeChange ? onPageSizeChange(Number(e.target.value)) : table.setPageSize(Number(e.target.value))
              }
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

            {loading ? (
              <tbody>
                <TableSkeleton columns={table.getVisibleFlatColumns().length} />
              </tbody>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td className='whitespace-nowrap border-r' key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
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
            if (onPageChange) {
              onPageChange(page + 1)
            }
          }}
        />
      </Card>

      <ViewPurchaseModal open={viewOpen} handleClose={() => setViewOpen(false)} data={selectedRow} />
    </>
  )
}

export default PurchaseListTable
