'use client'

import { useState, useEffect, useMemo } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Grid,
  Chip,
  Paper,
  Checkbox,
  Button,
  CircularProgress
} from '@mui/material'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import classnames from 'classnames'

import tableStyles from '@core/styles/table.module.css'
import { getExpensesByUser } from '@/actions/authActions'

const Profile = ({ user: initialUser, userId }) => {
  // Use dummy data if no real user data
  const user = initialUser || {
    _id: '69005fda43160b954fe0efb8',
    name: 'Thor Fitzpatrick',
    email: 'admin@gmail.com',
    phone: '+1 (349) 562-1014',
    salary: 25000,
    role: 'admin',
    image: null
  }

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })

  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)

      const data = await getExpensesByUser(userId || user._id, {
        page: pagination.page,
        limit: pagination.limit
      })

      // Use dummy data if no real data
      if (data.expenses.length === 0) {
        setExpenses([
          {
            _id: '1',
            date: '2024-01-15T00:00:00.000Z',
            amount: user.salary,
            expense_category: 'Salary',
            expense_for: 'Monthly Salary Payment',
            payment_type: 'bank transfer',
            reference_num: 'SAL-2024-001'
          },
          {
            _id: '2',
            date: '2024-02-15T00:00:00.000Z',
            amount: user.salary,
            expense_category: 'Salary',
            expense_for: 'Monthly Salary Payment',
            payment_type: 'bank transfer',
            reference_num: 'SAL-2024-002'
          },
          {
            _id: '3',
            date: '2024-03-15T00:00:00.000Z',
            amount: user.salary,
            expense_category: 'Salary',
            expense_for: 'Monthly Salary Payment',
            payment_type: 'bank transfer',
            reference_num: 'SAL-2024-003'
          }
        ])
        setPagination(prev => ({ ...prev, total: 3, totalPages: 1 }))
      } else {
        setExpenses(data.expenses)
        setPagination(prev => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages
        }))
      }

      setLoading(false)
    }

    fetchExpenses()
  }, [userId, user._id, user.salary, pagination.page, pagination.limit])

  // Table columns
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

          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <Typography fontWeight={600} color='primary'>
            ${parseFloat(row.original.amount || 0).toLocaleString()}
          </Typography>
        )
      },
      {
        accessorKey: 'expense_category',
        header: 'Category',
        cell: ({ row }) => (
          <Chip label={row.original.expense_category || 'N/A'} color='success' size='small' variant='outlined' />
        )
      },
      {
        accessorKey: 'expense_for',
        header: 'Description',
        cell: ({ row }) => <Typography variant='body2'>{row.original.expense_for || 'N/A'}</Typography>
      },
      {
        accessorKey: 'payment_type',
        header: 'Payment Type',
        cell: ({ row }) => (
          <Typography className='capitalize' variant='body2'>
            {row.original.payment_type || 'N/A'}
          </Typography>
        )
      },
      {
        accessorKey: 'reference_num',
        header: 'Reference Number',
        cell: ({ row }) => (
          <Typography variant='body2' color='textSecondary'>
            {row.original.reference_num || 'N/A'}
          </Typography>
        )
      }
    ],
    []
  )

  const table = useReactTable({
    data: expenses,
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
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div className='space-y-6'>
      {/* User Profile Card */}
      <Card elevation={3}>
        <CardContent>
          <Grid container spacing={4} alignItems='center'>
            <Grid item>
              <Avatar src={user.image} alt={user.name} sx={{ width: 120, height: 120, fontSize: '3rem' }}>
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>

            <Grid item xs>
              <Typography variant='h4' gutterBottom fontWeight={600}>
                {user.name}
              </Typography>

              <Box display='flex' gap={2} mb={2}>
                <Chip label={user.role?.toUpperCase()} color='primary' size='small' />
                <Chip label='Active' color='success' size='small' variant='outlined' />
              </Box>

              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant='caption' color='textSecondary' display='flex' alignItems='center' gap={1}>
                      <i className='tabler-mail' />
                      Email
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>
                      {user.email}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant='caption' color='textSecondary' display='flex' alignItems='center' gap={1}>
                      <i className='tabler-phone' />
                      Phone
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>
                      {user.phone}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant='caption' color='textSecondary' display='flex' alignItems='center' gap={1}>
                      <i className='tabler-currency-dollar' />
                      Monthly Salary
                    </Typography>
                    <Typography variant='h6' fontWeight={600} color='success.main'>
                      ${user.salary?.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Salary History Table */}
      <Card elevation={3}>
        <CardContent>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
            <Box>
              <Typography variant='h5' fontWeight={600} gutterBottom>
                Salary Payment History
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                Track all salary payments and transactions
              </Typography>
            </Box>

            <Chip label={`Total: ${pagination.total} payments`} color='primary' variant='outlined' />
          </Box>

          {/* Table */}
          <Paper variant='outlined'>
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
                        <div className='flex justify-center items-center p-8'>
                          <CircularProgress size={24} className='mr-3' />
                          <Typography>Loading salary payments...</Typography>
                        </div>
                      </td>
                    </tr>
                  ) : table.getFilteredRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                        <div className='p-8 text-center'>
                          <i className='tabler-file-off text-4xl text-textSecondary mb-3' />
                          <Typography variant='h6' className='mb-2'>
                            No salary payments found
                          </Typography>
                          <Typography variant='body2' color='textSecondary'>
                            No payment records available for this user
                          </Typography>
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
          </Paper>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display='flex' justifyContent='space-between' alignItems='center' mt={3}>
              <Typography variant='body2' color='textSecondary'>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </Typography>

              <Box display='flex' gap={1}>
                <Button
                  variant='outlined'
                  size='small'
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
