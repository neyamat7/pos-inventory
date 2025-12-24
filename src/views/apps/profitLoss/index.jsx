'use client'

import { useState, useEffect, useMemo } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  TextField,
  Chip,
  Avatar,
  TablePagination,
  IconButton,
  Skeleton
} from '@mui/material'
import Grid2 from '@mui/material/Grid2'
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  MoneyOff,
  AccountBalance
} from '@mui/icons-material'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import classnames from 'classnames'

import { getLotsAnalytics } from '@/actions/incomeActions/income.action'
import TableSkeleton from '@/components/TableSkeleton'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ProfitLoss({ suppliers = [] }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    lots: [],
    totals: {
      totalCustomerProfit: 0,
      totalLotProfit: 0,
      totalCombinedProfit: 0,
      totalLoss: 0
    },
    total: 0,
    totalPages: 0
  })

  const [filters, setFilters] = useState({
    month: new Date().toLocaleString('default', { month: 'long' }),
    supplierId: ''
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getLotsAnalytics({
        page: pagination.page,
        limit: pagination.limit,
        month: filters.month,
        supplierId: filters.supplierId
      })

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.page, pagination.limit, filters])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on filter change
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('lot_name', {
        header: 'Lot Name',
        cell: info => <Typography fontWeight={500}>{info.getValue()}</Typography>
      }),
      columnHelper.accessor('purchase_date', {
        header: 'Purchase Date',
        cell: info => new Date(info.getValue()).toLocaleDateString()
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => (
          <Chip
            label={info.getValue()}
            color={info.getValue() === 'stock out' ? 'error' : 'success'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('hasCommission', {
        header: 'Commission',
        cell: info => (
          <Chip
            label={info.getValue() ? 'Yes' : 'No'}
            color={info.getValue() ? 'primary' : 'default'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('profits.lotProfit', {
        header: 'Lot Profit',
        cell: info => (
          <Typography color='success.main' fontWeight={600}>
            ৳{info.getValue()?.toLocaleString() || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('profits.customerProfit', {
        header: 'Customer Profit',
        cell: info => (
          <Typography color='info.main' fontWeight={600}>
            ৳{info.getValue()?.toLocaleString() || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('profits.totalProfit', {
        header: 'Total Profit',
        cell: info => (
          <Typography color='primary.main' fontWeight={700}>
            ৳{info.getValue()?.toLocaleString() || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('profits.lot_loss', {
        header: 'Loss',
        cell: info => (
          <Typography color='error.main' fontWeight={600}>
            ৳{info.getValue()?.toLocaleString() || 0}
          </Typography>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: data.lots,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data.totalPages,
  })

  return (
    <Box sx={{ p: 3 }}>
      {/* Header & Filters */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4} flexWrap='wrap' gap={2}>
        <Box>
          <Typography variant='h4' fontWeight={700} gutterBottom>
            Profit & Loss Analytics
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Detailed breakdown of lots performance
          </Typography>
        </Box>

        <Box display='flex' gap={2}>
          <CustomTextField
            select
            label='Month'
            value={filters.month}
            onChange={e => handleFilterChange('month', e.target.value)}
            sx={{ minWidth: 150 }}
            size='small'
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>All Months</MenuItem>
            {months.map(month => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField
            select
            label='Supplier'
            value={filters.supplierId}
            onChange={e => handleFilterChange('supplierId', e.target.value)}
            sx={{ minWidth: 200 }}
            size='small'
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>All Suppliers</MenuItem>
            {suppliers.map(supplier => (
              <MenuItem key={supplier._id} value={supplier._id}>
                {supplier.basic_info?.name || supplier.name}
              </MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField
            select
            label='Rows'
            value={pagination.limit}
            onChange={e => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
            sx={{ minWidth: 80 }}
            size='small'
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </CustomTextField>
        </Box>
      </Box>

      {/* Totals Cards */}
      <Grid2 container spacing={3} mb={4}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'primary.50', border: 1, borderColor: 'primary.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    TOTAL COMBINED PROFIT
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='primary.dark' sx={{ my: 1 }}>
                    {loading ? (
                      <Skeleton width={120} height={40} />
                    ) : (
                      `৳${data.totals.totalCombinedProfit?.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AccountBalance />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    TOTAL LOT PROFIT
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='success.dark' sx={{ my: 1 }}>
                    {loading ? (
                      <Skeleton width={120} height={40} />
                    ) : (
                      `৳${data.totals.totalLotProfit?.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'info.50', border: 1, borderColor: 'info.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    TOTAL CUSTOMER PROFIT
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='info.dark' sx={{ my: 1 }}>
                    {loading ? (
                      <Skeleton width={120} height={40} />
                    ) : (
                      `৳${data.totals.totalCustomerProfit?.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'error.50', border: 1, borderColor: 'error.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    TOTAL LOSS
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='error.dark' sx={{ my: 1 }}>
                    {loading ? (
                      <Skeleton width={120} height={40} />
                    ) : (
                      `৳${data.totals.totalLoss?.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <MoneyOff />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Lots Table */}
      <Card>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='whitespace-nowrap border-r'>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton columns={columns.length} rows={5} />
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center p-4'>
                    <Typography color='text.secondary'>No lots found for the selected criteria</Typography>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className='whitespace-nowrap border-r'>
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
            <TablePaginationComponent
              table={table}
              paginationData={{
                total: data.total,
                limit: pagination.limit,
                currentPage: pagination.page,
                totalPages: data.totalPages
              }}
              onPageChange={page => setPagination(prev => ({ ...prev, page }))}
            />
          )}
          count={data.total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={(_, page) => setPagination(prev => ({ ...prev, page: page + 1 }))}
        />
      </Card>
    </Box>
  )
}
