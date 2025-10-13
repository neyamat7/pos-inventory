'use client'

import { useMemo, useState } from 'react'

import { FaEye } from 'react-icons/fa'
import {
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Box,
  IconButton,
  Stack,
  Grid,
  Chip
} from '@mui/material'

import { motion } from 'framer-motion'
import { Receipt, Payment, Group } from '@mui/icons-material'

import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'

import { salesCollections } from '@/fake-db/apps/reportsData'
import AddIncomeModal from './AddIncomeModal'
import TablePaginationComponent from '@/components/TablePaginationComponent'

// Group sales data by date
const groupByDate = data => {
  const grouped = {}

  data.forEach(sale => {
    const { date, sub_total, profit_total } = sale.summary

    if (!grouped[date]) {
      grouped[date] = {
        date,
        total_sales: 0,
        total_income: 0,
        total_payment: 0
      }
    }

    grouped[date].total_sales += sub_total
    grouped[date].total_income += profit_total
    grouped[date].total_payment += sale.payment.receiveAmount
  })

  return Object.values(grouped).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export default function ShowIncomePage() {
  const [selectedIncome, setSelectedIncome] = useState(null)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [incomeData, setIncomeData] = useState(groupByDate(salesCollections))

  //  Apply date filter
  const data = useMemo(() => {
    if (filterDate) return incomeData.filter(row => row.date === filterDate)

    return incomeData
  }, [filterDate, incomeData])

  //  Define table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: info => (
          <Typography variant='body2' fontWeight={600}>
            {info.getValue()}
          </Typography>
        )
      },
      {
        accessorKey: 'total_sales',
        header: 'Total Sales',
        cell: info => `৳ ${info.getValue().toLocaleString()}`
      },
      {
        accessorKey: 'total_income',
        header: 'Profit',
        cell: info => (
          <Typography color='success.main' fontWeight={600}>
            ৳ {info.getValue().toLocaleString()}
          </Typography>
        )
      },
      {
        accessorKey: 'total_payment',
        header: 'Received',
        cell: info => (
          <Typography color='primary.main' fontWeight={600}>
            ৳ {info.getValue().toLocaleString()}
          </Typography>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <IconButton
            color='primary'
            onClick={() => {
              const fullDetail = salesCollections.filter(sale => sale.summary.date === row.original.date)

              setSelectedIncome(fullDetail)
              setOpenDetailModal(true)
            }}
          >
            <FaEye />
          </IconButton>
        )
      }
    ],
    []
  )

  // Setup table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  // Add income handler
  const handleAddIncome = newIncome => {
    setIncomeData(prev => {
      const existing = prev.find(row => row.date === newIncome.date)

      if (existing) {
        return prev.map(row =>
          row.date === newIncome.date
            ? {
                ...row,
                total_sales: row.total_sales + Number(newIncome.total_sales),
                total_income: row.total_income + Number(newIncome.total_income),
                total_payment: row.total_payment + Number(newIncome.total_payment)
              }
            : row
        )
      }

      return [...prev, newIncome]
    })
  }

  return (
    <Card component={motion.div} layout className='shadow-lg rounded-2xl'>
      <CardContent>
        {/* Header */}
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3} flexWrap='wrap' gap={2}>
          <Typography variant='h4' fontWeight={700}>
            Income Report
          </Typography>
          <Box display='flex' gap={2} alignItems='center'>
            <TextField
              label='Filter by Date'
              type='date'
              size='small'
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant='contained' onClick={() => setOpenModal(true)}>
              + Add Income
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            overflow: 'hidden',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
            marginTop: 15
          }}
        >
          <Table
            sx={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              '& th, & td': {
                border: '1px solid #e0e0e0'
              }
            }}
          >
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} sx={{ backgroundColor: '#' }}>
                  {headerGroup.headers.map(header => (
                    <TableCell
                      key={header.id}
                      sx={{
                        color: '',
                        fontWeight: 600,
                        fontSize: '18px',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>

            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'white',
                       
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} sx={{ fontSize: '14px', borderBottom: '1px solid #eee' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box mt={3}>
          <TablePaginationComponent table={table} />
        </Box>
      </CardContent>

      {/* Modals */}
      <AddIncomeModal open={openModal} handleClose={() => setOpenModal(false)} onAddIncome={handleAddIncome} />

      {/* Detail Modal */}
      <IncomeDetailModal
        open={openDetailModal}
        handleClose={() => setOpenDetailModal(false)}
        incomeData={selectedIncome}
      />
      {/* <Dialog open={openDetailModal} onClose={() => setOpenDetailModal(false)} fullWidth maxWidth='md'>
        <DialogTitle>
          <Typography variant='h5' fontWeight={700}>
            Income Details
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedIncome && selectedIncome.length > 0 ? (
            selectedIncome.map((sale, idx) => (
              <Box key={idx} mb={3} p={2} border='1px solid #eee' borderRadius={2}>
                <Typography variant='h6'>
                  Customer: {sale.customer?.name || 'N/A'} ({sale.customer?.phone})
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total: ৳{sale.summary.sub_total} | Profit: ৳{sale.summary.profit_total} | Received: ৳
                  {sale.payment.receiveAmount}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No income details found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailModal(false)}>Close</Button>
        </DialogActions>
      </Dialog> */}
    </Card>
  )
}

function IncomeDetailModal({ open, handleClose, incomeData }) {
  if (!incomeData || incomeData.length === 0) return null

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
        {incomeData.map((sale, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Paper
              variant='outlined'
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                background: 'white'
              }}
            >
              {/* Summary */}
              <Stack spacing={1.5} mb={3}>
                <Box display='flex' alignItems='center' gap={1}>
                  <Typography variant='h6' fontWeight={600} color='primary'>
                    Sale Summary
                  </Typography>
                  <Chip label={`#${idx + 1}`} color='primary' size='small' />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant='body2' color='text.secondary'>
                      Date
                    </Typography>
                    <Typography fontWeight={500}>{sale.summary.date}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant='body2' color='text.secondary'>
                      Total Sales
                    </Typography>
                    <Typography fontWeight={500}>৳ {sale.summary.sub_total.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant='body2' color='text.secondary'>
                      Profit (Income)
                    </Typography>
                    <Typography fontWeight={500} color='success.main'>
                      ৳ {sale.summary.profit_total.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>

              {/* Payment Info */}
              <Divider sx={{ my: 3 }} />
              <Stack spacing={1.5} mb={2}>
                <Box display='flex' alignItems='center' gap={1}>
                  <Payment color='secondary' />
                  <Typography variant='h6' fontWeight={600} color='secondary'>
                    Payment Info
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='body2' color='text.secondary'>
                      Type
                    </Typography>
                    <Typography fontWeight={500}>{sale.payment.paymentType}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='body2' color='text.secondary'>
                      Receive Amount
                    </Typography>
                    <Typography fontWeight={500} color='success.main'>
                      ৳ {sale.payment.receiveAmount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='body2' color='text.secondary'>
                      Due Amount
                    </Typography>
                    <Typography fontWeight={500} color='error.main'>
                      ৳ {sale.payment.dueAmount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant='body2' color='text.secondary'>
                      Note
                    </Typography>
                    <Typography fontWeight={500}>{sale.payment.note || '-'}</Typography>
                  </Grid>
                </Grid>
              </Stack>

              {/* Customer Info */}
              <Divider sx={{ my: 3 }} />
              <Box display='flex' alignItems='center' gap={1} mb={1}>
                <Group color='action' />
                <Typography variant='h6' fontWeight={600}>
                  Customer Information
                </Typography>
              </Box>

              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: 'grey.50',
                  border: '1px solid #e0e0e0'
                }}
                elevation={0}
              >
                <Typography variant='subtitle1' fontWeight={600}>
                  {sale.customer.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  📍 {sale.customer.location}
                </Typography>
                <Typography variant='body2'>📞 {sale.customer.phone}</Typography>
                <Stack direction='row' spacing={1} mt={1}>
                  <Chip label={`Orders: ${sale.customer.orders}`} size='small' color='info' />
                  <Chip label={`Due: ৳${sale.customer.due}`} size='small' color='error' />
                  <Chip label={`Total Spent: ৳${sale.customer.totalSpent}`} size='small' color='primary' />
                </Stack>
              </Paper>

              {/* Items Section */}
              <Divider sx={{ my: 3 }} />
              <Typography variant='h6' fontWeight={600} mb={2}>
                Sold Items
              </Typography>

              <Grid container spacing={2}>
                {sale.items.map((item, iIdx) => (
                  <Grid item xs={12} sm={6} key={iIdx}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        border: '1px solid #eee',
                        transition: '0.2s',
                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                      }}
                      elevation={0}
                    >
                      <Typography variant='subtitle1' fontWeight={600}>
                        {item.product_name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Category: {item.category}
                      </Typography>
                      <Stack direction='row' spacing={1} mt={1}>
                        <Chip label={`Qty: ${item.kg}`} size='small' />
                        <Chip label={`Price: ৳${item.price}`} size='small' />
                        <Chip label={`Profit: ৳${item.profit}`} size='small' color='success' />
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        ))}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={handleClose}
          variant='contained'
          color='primary'
          sx={{ px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 600, marginTop: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
