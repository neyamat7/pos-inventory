'use client'

import { useEffect, useMemo, useState } from 'react'

import { AccountBalance, AttachMoney, MoneyOff, TrendingDown, TrendingUp } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Skeleton,
  Tab,
  TablePagination,
  Tabs,
  Typography
} from '@mui/material'
import Grid2 from '@mui/material/Grid2'

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { getLotsAnalytics } from '@/actions/incomeActions/income.action'
import TableSkeleton from '@/components/TableSkeleton'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export default function ProfitLoss({ suppliers = [] }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    lots: [],
    settlements: [],
    totals: {
      totalCustomerProfit: 0,
      totalLotProfit: 0,
      totalCombinedProfit: 0,
      totalLoss: 0,
      totalExpenses: 0,
      totalDiscount: 0,
      expenseBreakdown: {
        expenseRecords: 0,
        cashOutTransactions: 0
      },
      totalCrateProfit: 0,
      crateProfitBreakdown: {
        type1Profit: 0,
        type2Profit: 0,
        type1Quantity: 0,
        type2Quantity: 0
      },
      grossProfit: 0,
      netProfit: 0
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

  const [activeView, setActiveView] = useState(0)

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

        // console.log('result', result.data)
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
    pageCount: data.totalPages
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
        {/* Gross Profit */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card
            elevation={0}
            sx={{
              bgcolor: filters.supplierId ? 'grey.100' : 'primary.50',
              border: 1,
              borderColor: filters.supplierId ? 'grey.300' : 'primary.main',
              opacity: filters.supplierId ? 0.6 : 1
            }}
          >
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    GROSS PROFIT
                  </Typography>
                  <Typography
                    variant='h4'
                    fontWeight={700}
                    color={filters.supplierId ? 'text.disabled' : 'primary.dark'}
                    sx={{ my: 1 }}
                  >
                    {loading ? (
                      <Skeleton width={120} height={40} />
                    ) : filters.supplierId ? (
                      '৳0'
                    ) : (
                      `৳${data.totals.grossProfit?.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: filters.supplierId ? 'grey.400' : 'primary.main' }}>
                  <AccountBalance />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* Net Profit */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card
            elevation={0}
            sx={{
              bgcolor: filters.supplierId ? 'grey.100' : 'secondary.50',
              border: 1,
              borderColor: filters.supplierId ? 'grey.300' : 'secondary.main',
              opacity: filters.supplierId ? 0.6 : 1
            }}
          >
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    NET PROFIT
                  </Typography>
                  <Typography
                    variant='h4'
                    fontWeight={700}
                    color={filters.supplierId ? 'text.disabled' : 'secondary.dark'}
                    sx={{ my: 1 }}
                  >
                    {loading ? (
                      <Skeleton width={120} height={40} />
                    ) : filters.supplierId ? (
                      '৳0'
                    ) : (
                      `৳${data.totals.netProfit?.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: filters.supplierId ? 'grey.400' : 'secondary.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* Lot Profit */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    LOT PROFIT
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
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* Customer Profit */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'info.50', border: 1, borderColor: 'info.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    CUSTOMER PROFIT
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
                  <TrendingDown />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* Crate Profit */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'warning.50', border: 1, borderColor: 'warning.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    CRATE PROFIT
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='warning.dark' sx={{ my: 1 }}>
                    {loading ? (
                      <Skeleton width={120} height={40} />
                    ) : (
                      `৳${data.totals.totalCrateProfit?.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <MoneyOff />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* Total Loss */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'error.50', border: 1, borderColor: 'error.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    TOTAL LOSS
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='error.dark' sx={{ my: 1 }}>
                    {loading ? <Skeleton width={120} height={40} /> : `৳${data.totals.totalLoss?.toLocaleString()}`}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <TrendingDown />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* Total Discount */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'info.50', border: 1, borderColor: 'info.main' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    TOTAL DISCOUNT
                  </Typography>
                  <Typography variant='h4' fontWeight={700} color='info.dark' sx={{ my: 1 }}>
                    {loading ? <Skeleton width={120} height={40} /> : `৳${data.totals.totalDiscount?.toLocaleString()}`}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>

        {/* Total Expense */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
          <Card
            elevation={0}
            sx={{
              bgcolor: filters.supplierId ? 'grey.100' : 'grey.50',
              border: 1,
              borderColor: filters.supplierId ? 'grey.300' : 'grey.400',
              opacity: filters.supplierId ? 0.6 : 1
            }}
          >
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='caption' fontWeight={600} color='text.secondary'>
                    TOTAL EXPENSE
                  </Typography>
                  <Typography
                    variant='h4'
                    fontWeight={700}
                    color={filters.supplierId ? 'text.disabled' : 'text.primary'}
                    sx={{ my: 1 }}
                  >
                    {loading ? (
                      <Skeleton width={120} height={40} />
                    ) : filters.supplierId ? (
                      '৳0'
                    ) : (
                      `৳${data.totals.totalExpenses?.toLocaleString()}`
                    )}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: filters.supplierId ? 'grey.400' : 'grey.600' }}>
                  <MoneyOff />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Tabs for Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeView} onChange={(_, val) => setActiveView(val)}>
          <Tab label='Lots Performance' />
          <Tab label='Discounts & Settlements' />
        </Tabs>
      </Box>

      {/* Content based on Active Tab */}
      {activeView === 0 ? (
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
      ) : (
        <Card>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th className='whitespace-nowrap border-r'>Date</th>
                  <th className='whitespace-nowrap border-r'>Transaction ID</th>
                  <th className='whitespace-nowrap border-r'>Supplier</th>
                  <th className='whitespace-nowrap border-r'>Note</th>
                  <th className='whitespace-nowrap border-r'>Discount Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton columns={5} rows={5} />
                ) : data.settlements?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='text-center p-4'>
                      <Typography color='text.secondary'>
                        No settlement discounts found for the selected criteria
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  data.settlements?.map((settle, index) => (
                    <tr key={settle._id || index}>
                      <td className='whitespace-nowrap border-r'>{new Date(settle.date).toLocaleDateString()}</td>
                      <td className='whitespace-nowrap border-r'>{settle.transactionId || 'N/A'}</td>
                      <td className='whitespace-nowrap border-r'>{settle.supplierId?.basic_info?.name || 'N/A'}</td>
                      <td className='whitespace-nowrap border-r' style={{ minWidth: 200 }}>
                        {settle.note || 'N/A'}
                      </td>
                      <td className='whitespace-nowrap border-r'>
                        <Typography color='primary.main' fontWeight={700}>
                          ৳{settle.discount_received?.toLocaleString() || 0}
                        </Typography>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant='caption' color='text.secondary'>
              * Discounts shown here are from full supplier settlements and lot extra discounts.
            </Typography>
          </Box>
        </Card>
      )}
    </Box>
  )
}
