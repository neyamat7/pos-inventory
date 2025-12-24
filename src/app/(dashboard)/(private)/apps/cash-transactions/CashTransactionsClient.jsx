'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import {
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Skeleton
} from '@mui/material'
import Grid2 from '@mui/material/Grid2'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import { getDailyCashHistory, addCashIn, addCashOut } from '@/actions/cashActions'
import { useAdmin } from '@/hooks/useAdmin'
import { showSuccess, showError } from '@/utils/toastUtils'
import TableSkeleton from '@/components/TableSkeleton'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
]

export default function CashTransactionsClient({ initialData }) {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(initialData)
  
  const [cashInModalOpen, setCashInModalOpen] = useState(false)
  const [cashOutModalOpen, setCashOutModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [cashInData, setCashInData] = useState({ date: new Date().toISOString().split('T')[0], amount: '', note: '' })
  const [cashOutData, setCashOutData] = useState({ date: new Date().toISOString().split('T')[0], amount: '', note: '' })
  
  const [filters, setFilters] = useState({
    date: initialData.filter?.date || '',
    year: initialData.filter?.year || '',
    month: initialData.filter?.month || ''
  })

  const [pagination, setPagination] = useState({
    page: initialData.pagination?.page || 1,
    limit: initialData.pagination?.limit || 10
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getDailyCashHistory({
        date: filters.date || undefined,
        year: filters.year || undefined,
        month: filters.month || undefined,
        page: pagination.page,
        limit: pagination.limit
      })

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching cash history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.page, pagination.limit, filters])

  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value }
      
      // Auto-select current year when only month is selected
      if (field === 'month' && value && !prev.year) {
        newFilters.year = new Date().getFullYear().toString()
      }
      
      // Clear date when year or month is selected
      if ((field === 'year' || field === 'month') && value) {
        newFilters.date = ''
      }
      
      // Clear year and month when date is selected
      if (field === 'date' && value) {
        newFilters.year = ''
        newFilters.month = ''
      }
      
      return newFilters
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('businessDate', {
        header: 'Business Date',
        cell: info => new Date(info.getValue()).toLocaleDateString()
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: info => (
          <Chip
            label={info.getValue()}
            color={info.getValue() === 'IN' ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: info => (
          <Typography fontWeight={600} color={info.row.original.type === 'IN' ? 'success.main' : 'error.main'}>
            ৳{info.getValue()?.toLocaleString() || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('source', {
        header: 'Source',
        cell: info => (
          <Typography variant='body2' className='capitalize'>
            {info.getValue()?.replace(/-/g, ' ') || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('note', {
        header: 'Note',
        cell: info => (
          <Typography variant='body2' color='text.secondary'>
            {info.getValue() || '—'}
          </Typography>
        )
      }),
    ],
    []
  )

  const table = useReactTable({
    data: data.history || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data.pagination?.totalPages || 0
  })

  return (
    <Box sx={{ p: 3 }}>
      {/* Header & Filters */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4} flexWrap='wrap' gap={2}>
        <Box>
          <Typography variant='h4' fontWeight={700} gutterBottom>
            Cash Transactions
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            View and manage daily cash transactions
          </Typography>
        </Box>

        <Box display='flex' gap={2} flexWrap='wrap' alignItems='center'>
          {isAdmin && (
            <>
              <Button
                variant='contained'
                color='success'
                size='small'
                onClick={() => setCashInModalOpen(true)}
              >
                Add Cash In
              </Button>
              <Button
                variant='contained'
                color='error'
                size='small'
                onClick={() => setCashOutModalOpen(true)}
              >
                Add Cash Out
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Box display='flex' gap={2} flexWrap='wrap' mb={4} alignItems='flex-end'>
          <CustomTextField
            type='date'
            label='Date'
            value={filters.date}
            onChange={e => handleFilterChange('date', e.target.value)}
            size='small'
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
          />

          <CustomTextField
            select
            label='Year'
            value={filters.year}
            onChange={e => handleFilterChange('year', e.target.value)}
            size='small'
            sx={{ minWidth: 120 }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Year</MenuItem>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <MenuItem key={year} value={year.toString()}>
                {year}
              </MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField
            select
            label='Month'
            value={filters.month}
            onChange={e => handleFilterChange('month', e.target.value)}
            size='small'
            sx={{ minWidth: 120 }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Month</MenuItem>
            {months.map(month => (
              <MenuItem key={month.value} value={month.value}>
                {month.label}
              </MenuItem>
            ))}
          </CustomTextField>

          <Button
            variant='outlined'
            size='small'
            sx={{ height: '40px' }}
            onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setFilters({ date: today, year: '', month: '' })
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
          >
            Clear Filters
          </Button>
        </Box>

      {/* Summary Stats */}
      <Grid2 container spacing={3} mb={4}>
        <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
            <CardContent>
              <Typography variant='caption' fontWeight={600} color='text.secondary'>
                TOTAL CASH IN
              </Typography>
              <Typography variant='h4' fontWeight={700} color='success.dark' sx={{ mt: 1 }}>
                {loading ? <Skeleton width={120} height={40} /> : `৳${data.totals?.totalCashIn?.toLocaleString() || 0}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <Card elevation={0} sx={{ bgcolor: 'error.50', border: 1, borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant='caption' fontWeight={600} color='text.secondary'>
                TOTAL CASH OUT
              </Typography>
              <Typography variant='h4' fontWeight={700} color='error.dark' sx={{ mt: 1 }}>
                {loading ? <Skeleton width={120} height={40} /> : `৳${data.totals?.totalCashOut?.toLocaleString() || 0}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <Card 
            elevation={0} 
            sx={{ 
              bgcolor: data.dailyCash ? 'info.50' : 'grey.100', 
              border: 1, 
              borderColor: data.dailyCash ? 'info.main' : 'grey.300',
              opacity: data.dailyCash ? 1 : 0.6
            }}
          >
            <CardContent>
              <Typography variant='caption' fontWeight={600} color='text.secondary'>
                OPENING CASH
              </Typography>
              <Typography variant='h4' fontWeight={700} color={data.dailyCash ? 'info.dark' : 'text.disabled'} sx={{ mt: 1 }}>
                {loading ? <Skeleton width={120} height={40} /> : `৳${data.dailyCash?.openingCash?.toLocaleString() || 0}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
          <Card 
            elevation={0} 
            sx={{ 
              bgcolor: data.dailyCash ? 'warning.50' : 'grey.100', 
              border: 1, 
              borderColor: data.dailyCash ? 'warning.main' : 'grey.300',
              opacity: data.dailyCash ? 1 : 0.6
            }}
          >
            <CardContent>
              <Typography variant='caption' fontWeight={600} color='text.secondary'>
                CLOSING CASH
              </Typography>
              <Typography variant='h4' fontWeight={700} color={data.dailyCash ? 'warning.dark' : 'text.disabled'} sx={{ mt: 1 }}>
                {loading ? <Skeleton width={120} height={40} /> : `৳${data.dailyCash?.closingCash?.toLocaleString() || 0}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Transaction History Table */}
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
                <TableSkeleton columns={columns.length} rows={10} />
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center p-4'>
                    <Typography color='text.secondary'>No transactions found for the selected criteria</Typography>
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

        <TablePaginationComponent
          table={table}
          paginationData={{
            total: data.pagination?.total || 0,
            currentPage: pagination.page,
            limit: pagination.limit,
            totalPages: data.pagination?.totalPages || 0
          }}
          onPageChange={page => setPagination(prev => ({ ...prev, page }))}
        />
      </Card>

      {/* Cash In Modal */}
      <Dialog open={cashInModalOpen} onClose={() => !modalLoading && setCashInModalOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add Cash In</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type='date'
              label='Date'
              value={cashInData.date}
              onChange={e => setCashInData(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type='number'
              label='Amount'
              value={cashInData.amount}
              onChange={e => setCashInData(prev => ({ ...prev, amount: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label='Note'
              value={cashInData.note}
              onChange={e => setCashInData(prev => ({ ...prev, note: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCashInModalOpen(false)} disabled={modalLoading}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!cashInData.amount) {
                showError('Amount is required')
                return
              }
              setModalLoading(true)
              const result = await addCashIn(cashInData)
              setModalLoading(false)
              if (result.success) {
                showSuccess('Cash-in added successfully')
                setCashInModalOpen(false)
                setCashInData({ date: new Date().toISOString().split('T')[0], amount: '', note: '' })
                fetchData()
              } else {
                showError(result.error || 'Failed to add cash-in')
              }
            }}
            variant='contained'
            color='success'
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={24} /> : 'Add Cash In'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cash Out Modal */}
      <Dialog open={cashOutModalOpen} onClose={() => !modalLoading && setCashOutModalOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add Cash Out</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type='date'
              label='Date'
              value={cashOutData.date}
              onChange={e => setCashOutData(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type='number'
              label='Amount'
              value={cashOutData.amount}
              onChange={e => setCashOutData(prev => ({ ...prev, amount: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label='Note'
              value={cashOutData.note}
              onChange={e => setCashOutData(prev => ({ ...prev, note: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCashOutModalOpen(false)} disabled={modalLoading}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!cashOutData.amount) {
                showError('Amount is required')
                return
              }
              setModalLoading(true)
              const result = await addCashOut(cashOutData)
              setModalLoading(false)
              if (result.success) {
                showSuccess('Cash-out added successfully')
                setCashOutModalOpen(false)
                setCashOutData({ date: new Date().toISOString().split('T')[0], amount: '', note: '' })
                fetchData()
              } else {
                showError(result.error || 'Failed to add cash-out')
              }
            }}
            variant='contained'
            color='error'
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={24} /> : 'Add Cash Out'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
