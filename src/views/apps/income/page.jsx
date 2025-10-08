'use client'

import { useMemo, useState } from 'react'

import { FaEye } from 'react-icons/fa'

import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'

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
  TablePagination,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Box,
  Stack
} from '@mui/material'

import { salesCollections } from '@/fake-db/apps/reportsData'

import AddIncomeModal from './AddIncomeModal'
import TablePaginationComponent from '@/components/TablePaginationComponent'

// 🔹 Group sales data by date
const groupByDate = data => {
  const grouped = {}

  data.forEach(sale => {
    const { date, sub_total, profit_total } = sale.summary

    if (!grouped[date]) {
      grouped[date] = { date, total_sales: 0, total_income: 0, total_payment: 0 }
    }

    grouped[date].total_sales += sub_total
    grouped[date].total_income += profit_total
    grouped[date].total_payment += sale.payment.receiveAmount
  })

  return Object.values(grouped).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export default function ShowIncomePage() {
  const today = new Date().toISOString().split('T')[0]

  const [selectedIncome, setSelectedIncome] = useState(null)
  const [openDetailModal, setOpenDetailModal] = useState(false)

  const [filterDate, setFilterDate] = useState('')
  const [openModal, setOpenModal] = useState(false)

  // 🔹 State for income rows
  const [incomeData, setIncomeData] = useState(groupByDate(salesCollections))

  // Apply filter
  const data = useMemo(() => {
    if (filterDate) {
      return incomeData.filter(row => row.date === filterDate)
    }

    return incomeData
  }, [filterDate, incomeData])

  // Table setup
  const columns = useMemo(
    () => [
      { accessorKey: 'date', header: 'Date' },
      { accessorKey: 'total_sales', header: 'Total Sales' },
      { accessorKey: 'total_income', header: 'Total Income' },
      { accessorKey: 'total_payment', header: 'Received' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <FaEye
            className='cursor-pointer text-blue-600 hover:text-blue-800'
            size={18}
            onClick={() => {
              const fullDetail = salesCollections.filter(sale => sale.summary.date === row.original.date)

              setSelectedIncome(fullDetail)
              setOpenDetailModal(true)
            }}
          />
        )
      }
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  // 🔹 Handle new income addition
  const handleAddIncome = newIncome => {
    setIncomeData(prev => {
      const existing = prev.find(row => row.date === newIncome.date)

      if (existing) {
        // update existing row totals
        return prev.map(row =>
          row.date === newIncome.date
            ? {
                ...row,
                total_sales: row.total_sales + Number(newIncome.total_sales),
                total_commission: row.total_commission + Number(newIncome.total_commission),
                total_income: row.total_income + Number(newIncome.total_income)
              }
            : row
        )
      }

      // add as new row
      return [...prev, newIncome]
    })
  }

  return (
    <Card>
      <CardContent>
        <div className='flex flex-col md:flex-row gap-5 justify-between items-center mb-4'>
          <Typography variant='h3'>Income Report</Typography>

          <div className='flex gap-3'>
            <TextField
              label='Filter by Date'
              type='date'
              size='small'
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Button variant='contained' className='whitespace-nowrap' onClick={() => setOpenModal(true)}>
              + Add Income
            </Button>
          </div>
        </div>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id} className='text-base border-t-2 border-r border-l whitespace-nowrap'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>

            <TableBody className=''>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell className='text-[14px] whitespace-nowrap border-r border-l' key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component={() => <div />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        />
      </CardContent>

      {/* Add Income Modal */}
      <AddIncomeModal open={openModal} handleClose={() => setOpenModal(false)} onAddIncome={handleAddIncome} />

      <IncomeDetailModal
        open={openDetailModal}
        handleClose={() => setOpenDetailModal(false)}
        incomeData={selectedIncome}
      />

      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => {
          table.setPageSize(Number(e.target.value))
        }}
      />
    </Card>
  )
}

function IncomeDetailModal({ open, handleClose, incomeData }) {
  if (!incomeData || incomeData.length === 0) return null

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Income Details</DialogTitle>

        <DialogContent dividers>
          {incomeData.map((sale, idx) => (
            <Paper key={idx} variant='outlined' sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              {/* 🔹 Summary Section */}
              <Stack spacing={1} mb={2}>
                <Typography variant='h6' color='primary'>
                  Summary
                </Typography>
                <Typography>Date: {sale.summary.date}</Typography>
                <Typography>Total Sales: {sale.summary.sub_total}</Typography>
                <Typography>Profit (Income): {sale.summary.profit_total}</Typography>
              </Stack>

              {/* 🔹 Payment Info */}
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1} mb={2}>
                <Typography variant='h6' color='secondary'>
                  Payment Info
                </Typography>
                <Typography>Type: {sale.payment.paymentType}</Typography>
                <Typography>Receive Amount: {sale.payment.receiveAmount}</Typography>
                <Typography>Due Amount: {sale.payment.dueAmount}</Typography>
                <Typography>Note: {sale.payment.note || '-'}</Typography>
              </Stack>

              {/* 🔹 Customers */}
              <Divider sx={{ my: 2 }} />
              <Typography variant='h6' gutterBottom>
                Customers
              </Typography>

              {sale.customers.map((cust, cIdx) => (
                <Paper key={cIdx} sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: 'grey.50' }} elevation={0}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                    Customer #{cust.customer_id}
                  </Typography>
                  <Typography variant='body2'>Subtotal: {cust.sub_total}</Typography>
                  <Typography variant='body2'>Profit: {cust.profit_total}</Typography>

                  {/* 🔹 Products */}
                  <Box mt={1} pl={2}>
                    <Typography variant='subtitle2' gutterBottom>
                      Products
                    </Typography>
                    <Stack spacing={0.5}>
                      {cust.items.map((item, iIdx) => (
                        <Paper
                          key={iIdx}
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: 'white',
                            border: '1px solid #eee'
                          }}
                          elevation={0}
                        >
                          <Typography variant='body2'>
                            <b>{item.product_name}</b> (ID: {item.product_id})
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            Crate: {item.crate}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Paper>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant='contained' color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
