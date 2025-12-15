'use client'

import { useState, useEffect, useMemo } from 'react'
import Grid2 from '@mui/material/Grid2';

import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
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
import { getExpensesByUser } from '@/actions/authActions/login.actions'
import { getImageUrl } from '@/utils/getImageUrl'

const Profile = ({ user: initialUser, userId }) => {
  // Use dummy data if no real user data
  const user = initialUser

  if (!user) {
    return (
      <div className='flex items-center justify-center p-10'>
        <Typography variant='h5' color='textSecondary'>
          User not found
        </Typography>
      </div>
    )
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
        setExpenses([])
        setPagination(prev => ({ ...prev, total: 0, totalPages: 1 }))
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
            ৳{parseFloat(row.original.amount || 0).toLocaleString()}
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
      <Card elevation={3} sx={{ overflow: 'visible', mt: 8 }}>
        <Box
          sx={{
            height: 150,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px 8px 0 0',
            mx: -1,
            mt: -1
          }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Grid2 container spacing={4} alignItems='flex-end'>
            <Grid2 size={{ xs: 12 }} sx={{ mt: -8, mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={getImageUrl(user.image)}
                alt={user.name}
                sx={{
                  width: 140,
                  height: 140,
                  fontSize: '3.5rem',
                  border: '5px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid2>

            <Grid2 size={{ xs: 12 }} textAlign='center'>
              <Typography variant='h4' gutterBottom fontWeight={700}>
                {user.name}
              </Typography>

              <Box display='flex' gap={2} mb={3} justifyContent='center'>
                <Chip
                  label={user.role?.toUpperCase()}
                  color='primary'
                  size='small'
                  sx={{ fontWeight: 600, borderRadius: '6px' }}
                />
                <Chip
                  label='Active'
                  color='green'
                  size='small'
                  variant='outlined'
                  sx={{ fontWeight: 600, borderRadius: '6px', bgcolor: 'green.light', color: 'green.dark' }}
                />
              </Box>
            </Grid2>

            <Grid2 container size={{ xs: 12 }} spacing={3} sx={{ mt: 2 }}>
              <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'common.white', width: 48, height: 48 }}>
                    <i className='tabler-mail text-xl' />
                  </Avatar>
                  <Box textAlign='center'>
                    <Typography variant='caption' color='textSecondary' fontWeight={500}>
                      Email Address
                    </Typography>
                    <Typography variant='body1' fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Paper>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <Avatar sx={{ bgcolor: 'info.main', color: 'common.white', width: 48, height: 48 }}>
                    <i className='tabler-phone text-xl' />
                  </Avatar>
                  <Box textAlign='center'>
                    <Typography variant='caption' color='textSecondary' fontWeight={500}>
                      Phone Number
                    </Typography>
                    <Typography variant='body1' fontWeight={600}>
                      {user.phone}
                    </Typography>
                  </Box>
                </Paper>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 4, md: 3}}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <Avatar sx={{ bgcolor: 'success.main', color: 'common.white', width: 48, height: 48 }}>
                    <i className='tabler-currency-taka text-xl' />
                  </Avatar>
                  <Box textAlign='center'>
                    <Typography variant='caption' color='textSecondary' fontWeight={500}>
                      Monthly Salary
                    </Typography>
                    <Typography variant='h6' fontWeight={700} color='success.main'>
                      ৳{user.salary?.toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 4, md: 3}}>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <Avatar sx={{ bgcolor: 'warning.main', color: 'common.white', width: 48, height: 48 }}>
                    <i className='tabler-wallet text-xl' />
                  </Avatar>
                  <Box textAlign='center'>
                    <Typography variant='caption' color='textSecondary' fontWeight={500}>
                      Remaining Salary
                    </Typography>
                    <Typography variant='h6' fontWeight={700} color='warning.main'>
                      ৳{(user.remaining_salary || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid2>
            </Grid2>
          </Grid2>
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
