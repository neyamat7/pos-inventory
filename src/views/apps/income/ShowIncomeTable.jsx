'use client'

import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Component Imports
import { FaEye } from 'react-icons/fa'

import { Receipt, Payment, Group } from '@mui/icons-material'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { getIncomePeriods } from '@/actions/incomeActions'
import TableSkeleton from '@/components/TableSkeleton'

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

// Column Definitions
const columnHelper = createColumnHelper()

export default function ShowIncomeTable({
  incomeData = [],
  paginationData,
  loading = false,
  onPageChange,
  onPageSizeChange
}) {
  const [selectedIncome, setSelectedIncome] = useState(null)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [data, setData] = useState(incomeData)

  // Update data when incomeData prop changes
  useEffect(() => {
    setData(incomeData)
  }, [incomeData])

  // Apply date filter
  const filteredData = useMemo(() => {
    if (filterDate) {
      return data.filter(income => {
        const incomeDate = new Date(income.sellDate).toISOString().split('T')[0]

        return incomeDate === filterDate
      })
    }

    return data
  }, [data, filterDate])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'sellDate',
        header: 'Date',
        cell: ({ row }) => (
          <Typography variant='body2' fontWeight={600}>
            {new Date(row.original.sellDate).toLocaleDateString()}
          </Typography>
        )
      },
      {
        accessorKey: 'information.saleId',
        header: 'Sale ID',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {row.original.information?.saleId ? row.original.information.saleId.substring(0, 8) + '...' : '-'}
          </Typography>
        )
      },
      {
        accessorKey: 'total_Sell',
        header: 'Total Sales',
        cell: ({ row }) => `৳ ${(row.original.total_Sell || 0).toLocaleString()}`
      },
      {
        accessorKey: 'total_Income',
        header: 'Total Income',
        cell: ({ row }) => (
          <Typography color='success.main' fontWeight={600}>
            ৳ {(row.original.total_Income || 0).toLocaleString()}
          </Typography>
        )
      },
      {
        accessorKey: 'received_amount',
        header: 'Received',
        cell: ({ row }) => (
          <Typography color='primary.main' fontWeight={600}>
            ৳ {(row.original.received_amount || 0).toLocaleString()}
          </Typography>
        )
      },
      {
        accessorKey: 'due',
        header: 'Due',
        cell: ({ row }) => (
          <Typography color='error.main' fontWeight={600}>
            ৳ {(row.original.due || 0).toLocaleString()}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              color='primary'
              size='small'
              onClick={() => {
                setSelectedIncome(row.original)
                setOpenDetailModal(true)
              }}
            >
              <FaEye />
            </IconButton>
          </div>
        ),
        enableSorting: false
      }
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: paginationData?.totalPages || 1
  })

  const handlePageSizeChange = newSize => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    }
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <div className='flex items-center gap-4 max-sm:is-full max-sm:flex-col'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search incomes...'
              className='max-sm:is-full'
            />
            <CustomTextField
              label='Filter by Date'
              type='date'
              size='small'
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className='max-sm:is-full'
            />
          </div>
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={paginationData?.limit || 10}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              className='is-full sm:is-[70px]'
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
                    <th key={header.id} className='whitespace-nowrap border-r text-base'>
                      {header.isPlaceholder ? null : (
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
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
            ) : filteredData.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
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

        {/* Server-side pagination */}
        <TablePaginationComponent table={table} paginationData={paginationData} onPageChange={onPageChange} />
      </Card>

      <IncomeDetailModal
        open={openDetailModal}
        handleClose={() => setOpenDetailModal(false)}
        incomeData={selectedIncome}
      />
    </>
  )
}

function IncomeDetailModal({ open, handleClose, incomeData }) {
  if (!incomeData) return null

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          bgcolor: '#fafafa'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}
      >
        <Receipt fontSize='medium' />
        Income Details
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Paper
          variant='outlined'
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            background: 'white'
          }}
        >
          {/* Basic Information */}
          <Stack spacing={1.5} mb={3}>
            <Typography variant='h6' fontWeight={600} color='primary'>
              Sale Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='body2' color='text.secondary'>
                  Sale Date
                </Typography>
                <Typography fontWeight={500}>{new Date(incomeData.sellDate).toLocaleDateString()}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='body2' color='text.secondary'>
                  Sale ID
                </Typography>
                <Typography fontWeight={500}>{incomeData.information?.saleId || '-'}</Typography>
              </Grid>
            </Grid>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Financial Summary */}
          <Stack spacing={1.5} mb={3}>
            <Box display='flex' alignItems='center' gap={1}>
              <Payment color='secondary' />
              <Typography variant='h6' fontWeight={600} color='secondary'>
                Financial Summary
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Total Sales
                </Typography>
                <Typography fontWeight={500}>৳ {(incomeData.total_Sell || 0).toLocaleString()}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Total Income
                </Typography>
                <Typography fontWeight={500} color='success.main'>
                  ৳ {(incomeData.total_Income || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Received Amount
                </Typography>
                <Typography fontWeight={500} color='primary.main'>
                  ৳ {(incomeData.received_amount || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Due Amount
                </Typography>
                <Typography fontWeight={500} color='error.main'>
                  ৳ {(incomeData.due || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Lot Commission
                </Typography>
                <Typography fontWeight={500}>৳ {(incomeData.lot_Commission || 0).toLocaleString()}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  Customer Commission
                </Typography>
                <Typography fontWeight={500}>৳ {(incomeData.customer_Commission || 0).toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </Stack>

          {/* Lot Information */}
          {incomeData.information?.lots_Ids && incomeData.information.lots_Ids.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box display='flex' alignItems='center' gap={1} mb={2}>
                <Group color='action' />
                <Typography variant='h6' fontWeight={600}>
                  Lot Information
                </Typography>
              </Box>

              {incomeData.information.lots_Ids.map((lot, index) => (
                <Paper
                  key={lot._id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    border: '1px solid #e0e0e0'
                  }}
                  elevation={0}
                >
                  <Typography variant='subtitle1' fontWeight={600} mb={1}>
                    {lot.lot_name || `Lot ${index + 1}`}
                  </Typography>
                  <Stack direction='row' spacing={1} flexWrap='wrap' gap={1}>
                    <Chip label={`Product: ${lot.productsId?.productName || 'N/A'}`} size='small' color='primary' />
                    <Chip label={`Category: ${lot.productsId?.description || 'N/A'}`} size='small' color='secondary' />
                  </Stack>
                </Paper>
              ))}
            </>
          )}

          {/* Dates */}
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Created At
              </Typography>
              <Typography fontWeight={500}>{new Date(incomeData.createdAt).toLocaleString()}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Updated At
              </Typography>
              <Typography fontWeight={500}>{new Date(incomeData.updatedAt).toLocaleString()}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={handleClose}
          variant='contained'
          color='primary'
          sx={{ px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
