'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

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
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import AddExpenseDrawer from './AddExpenseDrawer'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import EditExpenseModal from './EditExpenseModal'
import OptionMenu from '@/@core/components/option-menu'

export const paymentStatus = {
  1: { text: 'Paid', color: 'success' },
  2: { text: 'Pending', color: 'warning' },
  3: { text: 'Cancelled', color: 'secondary' },
  4: { text: 'Failed', color: 'error' }
}

const ExpenseListTable = ({
  expenseData,
  paginationData,
  loading,
  onPageChange,
  onPageSizeChange,
  expenseCategories,
  usersList,
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const [editOpen, setEditOpen] = useState(null)
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    if (expenseData) {
      setData(expenseData)
    }
  }, [expenseData])

  const handleSearchChange = e => {
    const value = e.target.value

    setGlobalFilter(value)
    onFilterChange('search', value)
  }

  const handleDateChange = e => {
    const dateValue = e.target.value
    const isoDate = dateValue ? new Date(dateValue).toISOString() : ''

    onFilterChange('date', isoDate)
  }

  const formatDateForInput = isoDate => {
    if (!isoDate) return ''
    const date = new Date(isoDate)

    return date.toISOString().split('T')[0]
  }

  const columns = useMemo(
    () => [
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
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
          const date = new Date(row.original.date)

          return date.toLocaleDateString()
        }
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => <Typography>${parseFloat(row.original.amount || 0).toFixed(2)}</Typography>
      },
      {
        accessorKey: 'expense_category',
        header: 'Expense Category',
        cell: ({ row }) => <Typography>{row.original.expense_category || 'N/A'}</Typography>
      },
      { accessorKey: 'expense_for', header: 'Expense For' },
      {
        accessorKey: 'payment_type',
        header: 'Payment Type',
        cell: ({ row }) => <Typography className='capitalize'>{row.original.payment_type}</Typography>
      },
      { accessorKey: 'reference_num', header: 'Reference Number' },
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              tooltipProps={{ title: 'More options' }}
              iconClassName='text-textSecondary'
              iconButtonProps={{ size: 'small' }}
              options={[
                {
                  text: 'Edit',
                  icon: 'tabler-edit',
                  menuItemProps: {
                    onClick: () => setEditOpen(row.original),
                    className: 'flex items-center'
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    []
  )

  const table = useReactTable({
    data: data || [],
    columns,
    filterFns: {
      fuzzy: (row, columnId, value, addMeta) => {
        const itemRank = rankItem(row.getValue(columnId), value)

        addMeta({ itemRank })

        return itemRank.passed
      }
    },
    state: { rowSelection, globalFilter },
    enableRowSelection: true,
    globalFilterFn: (row, columnId, value) => {
      const itemRank = rankItem(row.getValue(columnId), value)

      return itemRank.passed
    },
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
        <CardContent className='flex flex-col gap-4'>
          {/* Top Row: Filters and Actions */}
          <div className='flex flex-wrap justify-between items-start gap-4'>
            {/* Left Side: Search and Filters */}
            <div className='flex flex-wrap items-center gap-4 flex-1'>
              {/* Search Input - NO DEBOUNCE HERE, handled in parent */}
              <CustomTextField
                label='Search By Name'
                value={filters.search}
                onChange={handleSearchChange}
                placeholder='Search expenses...'
                className='min-w-[200px]'
                size='small'
              />

              {/* Category Filter */}
              <FormControl size='small' className='min-w-[180px]'>
                <CustomTextField
                  select
                  size='small'
                  label='Category'
                  value={filters.category_id}
                  onChange={e => onFilterChange('category_id', e.target.value)}
                  className='min-w-[180px]'
                  SelectProps={{
                    displayEmpty: true
                  }}
                >
                  <MenuItem value=''>All Categories</MenuItem>
                  {expenseCategories.map(category => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </FormControl>

              {/* User Filter */}
              <FormControl size='small' className='min-w-[180px]'>
                <CustomTextField
                  select
                  size='small'
                  label='User'
                  value={filters.user_id}
                  onChange={e => onFilterChange('user_id', e.target.value)}
                  className='min-w-[180px]'
                  SelectProps={{
                    displayEmpty: true
                  }}
                >
                  <MenuItem value=''>All Users</MenuItem>
                  {usersList.map(user => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </FormControl>

              {/* Date Filter */}
              <FormControl size='small' className='min-w-[180px]'>
                <CustomTextField
                  type='date'
                  size='small'
                  label='Date'
                  value={formatDateForInput(filters.date)}
                  onChange={handleDateChange}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </FormControl>

              {/* Clear Filters Button */}
              <Button
                variant='outlined'
                color='secondary'
                size='small'
                className='mt-3 cursor-pointer'
                onClick={onClearFilters}
                disabled={!filters.category_id && !filters.user_id && !filters.date && !filters.search}
              >
                Clear Filters
              </Button>
            </div>

            {/* Right Side: Page Size and Add Button */}
            <div className='flex items-center gap-4'>
              <CustomTextField
                select
                size='small'
                value={paginationData?.limit || 10}
                onChange={e => onPageSizeChange(Number(e.target.value))}
                className='w-[70px]'
              >
                <MenuItem value='10'>10</MenuItem>
                <MenuItem value='25'>25</MenuItem>
                <MenuItem value='50'>50</MenuItem>
                <MenuItem value='100'>100</MenuItem>
              </CustomTextField>

              <Button
                variant='contained'
                color='primary'
                size='small'
                startIcon={<i className='tabler-plus' />}
                onClick={() => setCustomerUserOpen(!customerUserOpen)}
              >
                Add Expense
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filters.category_id || filters.user_id || filters.date || filters.search) && (
            <div className='mt-2'>
              <Typography variant='body2' color='textSecondary' className='flex items-center gap-2 flex-wrap'>
                <i className='tabler-filter text-sm' />
                Active filters:
                {filters.category_id && (
                  <span className='inline-flex items-center gap-1 bg-actionHover px-2 py-1 rounded'>
                    Category: {expenseCategories.find(c => c._id === filters.category_id)?.name || 'Selected'}
                  </span>
                )}
                {filters.user_id && (
                  <span className='inline-flex items-center gap-1 bg-actionHover px-2 py-1 rounded'>
                    User: {usersList.find(u => u._id === filters.user_id)?.name || 'Selected'}
                  </span>
                )}
                {filters.date && (
                  <span className='inline-flex items-center gap-1 bg-actionHover px-2 py-1 rounded'>
                    Date: {new Date(filters.date).toLocaleDateString()}
                  </span>
                )}
                {filters.search && (
                  <span className='inline-flex items-center gap-1 bg-actionHover px-2 py-1 rounded'>
                    Search: {filters.search}
                  </span>
                )}
              </Typography>
            </div>
          )}
        </CardContent>

        {/* Table Content */}
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
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <div className='flex justify-center items-center p-8'>
                      <i className='tabler-loader animate-spin text-2xl mr-3' />
                      <Typography>Loading expenses...</Typography>
                    </div>
                  </td>
                </tr>
              ) : table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <div className='p-8 text-center'>
                      <i className='tabler-file-off text-4xl text-textSecondary mb-3' />
                      <Typography variant='h6' className='mb-2'>
                        No expenses found
                      </Typography>
                      <Typography variant='body2' color='textSecondary' className='mb-4'>
                        {filters.category_id || filters.user_id || filters.date || filters.search
                          ? 'Try changing your filters'
                          : 'No expenses available'}
                      </Typography>
                      {(filters.category_id || filters.user_id || filters.date || filters.search) && (
                        <Button variant='outlined' color='primary' onClick={onClearFilters} size='small'>
                          Clear all filters
                        </Button>
                      )}
                    </div>
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

      <AddExpenseDrawer
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        setData={setData}
        expenseData={data}
        expenseCategories={expenseCategories}
        usersList={usersList}
      />

      {editOpen && (
        <EditExpenseModal
          open={!!editOpen}
          handleClose={() => setEditOpen(null)}
          rowData={editOpen}
          setData={setData}
        />
      )}
    </>
  )
}

export default ExpenseListTable
