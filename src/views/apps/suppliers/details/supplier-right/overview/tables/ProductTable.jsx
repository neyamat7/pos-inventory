'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  TablePagination,
  TextField,
  Typography
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Printer, X } from 'lucide-react'

import TableSkeleton from '@/components/TableSkeleton'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

import OptionMenu from '@/@core/components/option-menu'
import { getLotSaleSummary, getUnpaidStockOutLotsBySupplier, updateLotExtraExpense } from '@/actions/lotActions'
import LotInvoicePrintHandler from '@/components/LotSaleInvoice/LotInvoicePrintHandler'
import { showError, showSuccess } from '@/utils/toastUtils'
import PaymentModal from './PaymentModal'

const columnHelper = createColumnHelper()

const ProductTable = ({ data, summary, pagination, total, onPaginationChange, loading, supplierData, onPaymentSuccess }) => {

  // console.log('data in supplier lot tab', data)

  const router = useRouter()
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [unpaidLotsData, setUnpaidLotsData] = useState([])

  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)

  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedLotDetails, setSelectedLotDetails] = useState(null)
  const [lotSaleData, setLotSaleData] = useState(null)
  const [loadingSaleData, setLoadingSaleData] = useState(false)
  const [selectedLotIdForDetails, setSelectedLotIdForDetails] = useState(null)

  const [printTrigger, setPrintTrigger] = useState(false)
  const [printLotData, setPrintLotData] = useState(null)

  // console.log('data in supplier lot tab', data)

  useEffect(() => {
    const fetchUnpaidLots = async () => {
      if (!supplierData?._id) return

      try {
        const result = await getUnpaidStockOutLotsBySupplier(supplierData._id)

        if (result.success) {
          setUnpaidLotsData(result?.data || [])
        }
      } catch (error) {
        console.error('Error fetching unpaid lots:', error)
      }
    }

    fetchUnpaidLots()
  }, [supplierData?._id])

  // Function to handle payment success
  const handlePaymentSuccess = async () => {
    // Refetch unpaid lots
    if (supplierData?._id) {
      try {
        const result = await getUnpaidStockOutLotsBySupplier(supplierData._id)
        if (result.success) {
          setUnpaidLotsData(result?.data || [])
        }
      } catch (error) {
        console.error('Error refetching unpaid lots:', error)
      }
    }

    // Call parent callback to refresh main table
    if (onPaymentSuccess) {
      onPaymentSuccess()
    }
  }

  const fetchLotSaleSummary = async lotId => {
    setLoadingSaleData(true)
    setSelectedLotIdForDetails(lotId)

    try {
      const result = await getLotSaleSummary(lotId)

      // console.log('sale data', result)

      if (result.success) {
        setLotSaleData(result.data)
      } else {
        console.error('Failed to fetch sale summary:', result.error)
        setLotSaleData(null)
      }
    } catch (error) {
      console.error('Error fetching lot sale summary:', error)
      setLotSaleData(null)
    } finally {
      setLoadingSaleData(false)
    }
  }

  const handlePrintInvoice = lotData => {
    if (!lotData) return

    setPrintLotData(lotData)
    setPrintTrigger(prev => !prev)
  }

  const handlePrintComplete = () => {
    showSuccess('Print completed successfully')
    setPrintLotData(null)
  }

  const handlePrintError = error => {
    showSuccess('Print error:', error)
    setPrintLotData(null)
  }

  const stockColumns = [
    columnHelper.accessor('lot_name', {
      header: 'Lot Name',
      cell: info => info.getValue() || 'N/A'
    }),
    columnHelper.accessor(row => row.productsId?.[0]?.productName, {
      id: 'productName',
      header: 'Product Name',
      cell: info => info.getValue() || 'N/A'
    }),
    columnHelper.accessor('purchase_date', {
      header: 'Purchase Date',
      cell: info => {
        const date = info.getValue()

        return date ? new Date(date).toLocaleDateString() : 'N/A'
      }
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue()

        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'
      }
    }),
    columnHelper.accessor('payment_status', {
      header: 'Payment Status',
      cell: info => {
        const status = info.getValue()

        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'
      }
    }),
    columnHelper.accessor('box_quantity', {
      header: 'Total Boxes',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('remaining_boxes', {
      header: 'Remaining Boxes',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('costs.unitCost', {
      header: 'Unit Cost',
      cell: info => `$${info.getValue() || 0}`
    }),
    columnHelper.accessor('carat.carat_Type_1', {
      header: 'Carat Type 1',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('carat.carat_Type_2', {
      header: 'Carat Type 2',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('sales.totalKgSold', {
      header: 'Kg Sold',
      cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('profits.totalProfit', {
      header: 'Total Profit',
      cell: info => `${info.getValue() || 0}`
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'Add Expense',
                icon: 'tabler-plus',
                menuItemProps: {
                  onClick: () => {
                    setSelectedLot(row.original)
                    setExpenseModalOpen(true)
                  },
                  className: 'flex items-center',
                  disabled: row.original.payment_status === 'paid'
                }
              },
              {
                text: 'Show Details',
                icon: 'tabler-eye',
                menuItemProps: {
                  onClick: () => {
                    const lot = row.original

                    setSelectedLotDetails(lot)
                    fetchLotSaleSummary(lot._id)
                    setDetailsModalOpen(true)
                  },
                  className: 'flex items-center'
                }
              }
            ]}
          />
        </div>
      )
    })
  ]

  const table = useReactTable({
    data: data || [],
    columns: stockColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.limit),
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit
      }
    },
    onPaginationChange: updater => {
      const newState = updater(table.getState().pagination)

      onPaginationChange(newState.pageIndex + 1, newState.pageSize)
    }
  })

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false)
    setLotSaleData(null) // Reset sale data on close
    setSelectedLotDetails(null)
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        {/* Summary Stats - Only show when summary data is available */}
        {summary && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
            {/* Only show Total Crates Sold if value > 0 */}
            {summary.totalCratesSold > 0 && (
              <Paper elevation={2} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: '#f0f9ff' }}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  Total Crates Sold
                </Typography>
                <Typography variant='h6' fontWeight='bold' color='primary'>
                  {summary.totalCratesSold}
                </Typography>
              </Paper>
            )}
            
            {/* Only show Total Boxes Sold if value > 0 */}
            {summary.totalBoxesSold > 0 && (
              <Paper elevation={2} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: '#f0fdf4' }}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  Total Boxes Sold
                </Typography>
                <Typography variant='h6' fontWeight='bold' color='success.main'>
                  {summary.totalBoxesSold}
                </Typography>
              </Paper>
            )}
            
            {/* Only show Total Pieces Sold if value > 0 */}
            {summary.totalPiecesSold > 0 && (
              <Paper elevation={2} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: '#fef3c7' }}>
                <Typography variant='caption' color='text.secondary' display='block'>
                  Total Pieces Sold
                </Typography>
                <Typography variant='h6' fontWeight='bold' color='warning.main'>
                  {summary.totalPiecesSold}
                </Typography>
              </Paper>
            )}
            
            {/* Always show Total Sold Amount */}
            <Paper elevation={2} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: '#fce7f3' }}>
              <Typography variant='caption' color='text.secondary' display='block'>
                Total Sold Amount
              </Typography>
              <Typography variant='h6' fontWeight='bold' color='secondary.main'>
                ৳ {summary.totalSoldAmount?.toLocaleString() || 0}
              </Typography>
            </Paper>
            
            {/* Always show Supplier Due */}
            <Paper elevation={2} sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: '#fee2e2' }}>
              <Typography variant='caption' color='text.secondary' display='block'>
                Supplier Due
              </Typography>
              <Typography variant='h6' fontWeight='bold' color='error.main'>
                ৳ {summary.supplierDue?.toLocaleString() || 0}
              </Typography>
            </Paper>
          </Box>
        )}
        
        <div></div>

        <Button
          variant='contained'
          color='primary'
          onClick={() => setPaymentModalOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Clear Payment
        </Button>
      </Box>

      <table className={`${tableStyles.table} border border-gray-200 border-collapse`}>
        <thead>
          {table.getHeaderGroups().map(group => (
            <tr key={group.id}>
              {group.headers.map(header => (
                <th className='border border-gray-200' key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <TableSkeleton columns={stockColumns.length} />
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={stockColumns.length} className='text-center p-4'>
                No data available
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td className='border border-gray-200' key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={total}
        rowsPerPage={pagination.limit}
        page={pagination.page - 1}
        onPageChange={(_, page) => onPaginationChange(page + 1, pagination.limit)}
        onRowsPerPageChange={event => onPaginationChange(1, parseInt(event.target.value, 10))}
      />

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        supplierData={supplierData}
        lotsData={unpaidLotsData}
        supplierId={supplierData?._id}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <AddExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        lot={selectedLot}
        onSuccess={() => router.refresh()}
      />

      <LotDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        lot={selectedLotDetails}
        lotSaleData={lotSaleData}
        loadingSaleData={loadingSaleData}
        onPrint={handlePrintInvoice}
      />

      <LotInvoicePrintHandler
        lotSaleData={printLotData}
        triggerPrint={printTrigger}
        onPrintComplete={handlePrintComplete}
        onPrintError={handlePrintError}
      />
    </>
  )
}

export default ProductTable

// Optional: Update AddExpenseModal to show lot information
const AddExpenseModal = ({ open, onClose, lot, onSuccess }) => {
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseReason, setExpenseReason] = useState('')
  const [loading, setLoading] = useState(false)

  // Pre-fill form with existing expense data when modal opens
  useEffect(() => {
    if (open && lot) {
      setExpenseAmount(lot?.expenses?.extra_expense || '')
      setExpenseReason(lot?.expenses?.extra_expense_note || '')
    }
  }, [open, lot])

  const handleSubmit = async () => {
    if (!expenseAmount || !expenseReason) {
      showError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const result = await updateLotExtraExpense(lot?._id, {
        extra_expense: expenseAmount,
        extra_expense_note: expenseReason
      })

      if (result.success) {
        showSuccess('Extra expense added successfully')
        setExpenseAmount('')
        setExpenseReason('')
        onClose()
        if (onSuccess) onSuccess()
      } else {
        showError(result.error || 'Failed to add extra expense')
      }
    } catch (error) {
      console.error('Error adding extra expense:', error)
      showError('An error occurred while adding extra expense')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    // Reset form on close
    setExpenseAmount('')
    setExpenseReason('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Add Extra Expense for {lot?.lot_name || 'Lot'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='Expense Amount'
          type='number'
          fullWidth
          value={expenseAmount}
          onChange={e => setExpenseAmount(e.target.value)}
          onWheel={e => e.target.blur()} // Disable mouse wheel scroll
          inputProps={{ min: 0 }} // Prevent negative values
          sx={{ mb: 2 }}
        />
        <TextField
          label='Reason for Expense'
          multiline
          rows={3}
          fullWidth
          value={expenseReason}
          onChange={e => setExpenseReason(e.target.value)}
          placeholder='Enter the reason for this extra expense...'
          variant='outlined'
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained' color='primary' disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Add Expense'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const LotDetailsModal = ({ open, onClose, lot, lotSaleData, loadingSaleData, onPrint }) => {
  // Use real data from lot
  const extraExpenseAmount = lot?.expenses?.extra_expense || 0
  const extraExpenseNote = lot?.expenses?.extra_expense_note || ''
  const extraExpenseDate = lot?.updatedAt || new Date()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          py: 2
        }}
      >
        <Typography fontWeight='bold'>Lot Details - {lot?.lot_name || 'N/A'}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => onPrint(lotSaleData)} sx={{ color: 'white' }} title='Print'>
            <Printer size={20} />
          </IconButton>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <X size={24} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Basic Information Section */}
        <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
            Basic Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Product Name
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {lot?.productsId?.[0]?.productName || 'N/A'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Purchase Date
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {lot?.purchase_date ? new Date(lot.purchase_date).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Status
              </Typography>
              <Typography
                variant='body1'
                fontWeight='600'
                sx={{
                  color: lot?.status === 'in stock' ? 'success.main' : 'warning.main'
                }}
              >
                {lot?.status ? lot.status.charAt(0).toUpperCase() + lot.status.slice(1) : 'N/A'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Total Boxes
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {lot?.box_quantity || 0}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Remaining Boxes
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {lot?.remaining_boxes || 0}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                Payment Status
              </Typography>
              <Typography
                variant='body1'
                fontWeight='600'
                sx={{
                  color: lot?.payment_status === 'paid' ? 'success.main' : 'error.main'
                }}
              >
                {lot?.payment_status ? lot.payment_status.charAt(0).toUpperCase() + lot.payment_status.slice(1) : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Costs & Expenses Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Costs Column */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper elevation={2} sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
              <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
                Costs
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Unit Cost
                  </Typography>
                  <Typography variant='body1' fontWeight='600'>
                    ${lot?.costs?.unitCost?.toLocaleString() || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Commission Rate
                  </Typography>
                  <Typography variant='body1' fontWeight='600'>
                    {lot?.costs?.commissionRate || 0}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Expenses Column */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper elevation={2} sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
              <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
                Expenses
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Transportation
                  </Typography>
                  <Typography variant='body1' fontWeight='600'>
                    ${lot?.expenses?.transportation?.toLocaleString() || 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Labour
                  </Typography>
                  <Typography variant='body1' fontWeight='600'>
                    ${lot?.expenses?.labour?.toLocaleString() || 0}
                  </Typography>
                </Grid>
                {lot?.expenses?.other_expenses > 0 && (
                  <Grid size={{ xs: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Other Expenses
                    </Typography>
                    <Typography variant='body1' fontWeight='600'>
                      ${lot?.expenses?.other_expenses?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                )}
                {lot?.expenses?.custom_expenses?.map((exp, index) => (
                  <Grid size={{ xs: 6 }} key={index}>
                    <Typography variant='body2' color='text.secondary'>
                      {exp.name}
                    </Typography>
                    <Typography variant='body1' fontWeight='600'>
                      ${exp.amount?.toLocaleString() || 0}
                    </Typography>
                  </Grid>
                ))}
                <Grid size={{ xs: 6 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Expenses
                  </Typography>
                  <Typography variant='body1' fontWeight='600' color='error.main'>
                    ${lot?.expenses?.total_expenses?.toLocaleString() || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Sales & Profit Section */}
        <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
            Sales & Profit
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                Total Kg Sold
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                {lot?.sales?.totalKgSold?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                Total Sold Price
              </Typography>
              <Typography variant='body1' fontWeight='600'>
                ${lot?.sales?.totalSoldPrice?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                Lot Profit
              </Typography>
              <Typography
                variant='body1'
                fontWeight='600'
                sx={{
                  color: (lot?.profits?.lotProfit || 0) >= 0 ? 'success.main' : 'error.main'
                }}
              >
                ${lot?.profits?.lotProfit?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                Total Profit
              </Typography>
              <Typography
                variant='body1'
                fontWeight='600'
                sx={{
                  color: (lot?.profits?.totalProfit || 0) >= 0 ? 'success.main' : 'error.main'
                }}
              >
                ${lot?.profits?.totalProfit?.toLocaleString() || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Extra Expenses Section */}
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
            Extra Expenses
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Extra Expenses List */}
          <Box sx={{ mb: 2 }}>
            {extraExpenseAmount > 0 ? (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 1,
                  backgroundColor: '#f8f9fa'
                }}
              >
                <Grid container spacing={2} alignItems='center'>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Amount
                    </Typography>
                    <Typography variant='body1' fontWeight='600' color='error.main'>
                      ${extraExpenseAmount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 8, sm: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Reason
                    </Typography>
                    <Typography variant='body1' fontWeight='600'>
                      {extraExpenseNote || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Date
                    </Typography>
                    <Typography variant='body1' fontWeight='600'>
                      {new Date(extraExpenseDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            ) : (
              <Typography variant='body2' color='text.secondary' align='center'>
                No extra expenses recorded
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Sales Data Section */}
        <Paper elevation={2} sx={{ p: 2.5, mb: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant='h6' fontWeight='bold' color='primary' gutterBottom>
            Sales Data
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loadingSaleData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : lotSaleData?.sales && lotSaleData.sales.length > 0 ? (
            <>
              {/* Sales Table */}
              <Box sx={{ overflowX: 'auto', mb: 2 }}>
                <Box sx={{ minWidth: 800 }}>
                  {/* Table Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      py: 1.5,
                      px: 2,
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold'
                    }}
                  >
                    <Box sx={{ width: 150, minWidth: 150, px: 1 }}>Kg</Box>
                    <Box sx={{ width: 150, minWidth: 150, px: 1 }}>Unit Price</Box>
                    <Box sx={{ width: 150, minWidth: 150, px: 1 }}>Total Price</Box>
                    <Box sx={{ width: 150, minWidth: 150, px: 1 }}>Discount (Kg)</Box>
                    <Box sx={{ width: 200, minWidth: 200, px: 1 }}>Total Crate</Box>
                  </Box>

                  {/* Table Rows */}
                  {lotSaleData.sales.map((sale, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid #e0e0e0',
                        '&:hover': { backgroundColor: '#f9f9f9' }
                      }}
                    >
                      <Box sx={{ width: 150, minWidth: 150, px: 1 }}>{sale.kg || 0}</Box>
                      <Box sx={{ width: 150, minWidth: 150, px: 1 }}>${sale.unit_price?.toLocaleString() || 0}</Box>
                      <Box sx={{ width: 150, minWidth: 150, px: 1 }}>${sale.total_price?.toLocaleString() || 0}</Box>
                      <Box sx={{ width: 150, minWidth: 150, px: 1 }}>{sale.discount_Kg || 0}</Box>
                      <Box sx={{ width: 200, minWidth: 200, px: 1 }}>{sale.total_crate?.toLocaleString() || 0}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Sales Summary */}
              {lotSaleData.sales.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Paper sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                      <Typography variant='body2' color='text.secondary'>
                        Total Sales
                      </Typography>
                      <Typography variant='h6' fontWeight='bold' color='success.main'>
                        ${lotSaleData.sales.reduce((sum, sale) => sum + (sale.total_price || 0), 0).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Paper sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                      <Typography variant='body2' color='text.secondary'>
                        Total Kg
                      </Typography>
                      <Typography variant='h6' fontWeight='bold' color='warning.main'>
                        {lotSaleData.sales.reduce((sum, sale) => sum + (sale.kg || 0), 0).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Paper sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                      <Typography variant='body2' color='text.secondary'>
                        Avg Price/Kg
                      </Typography>
                      <Typography variant='h6' fontWeight='bold' color='secondary.main'>
                        $
                        {(
                          lotSaleData.sales.reduce((sum, sale) => sum + (sale.total_price || 0), 0) /
                          Math.max(
                            1,
                            lotSaleData.sales.reduce((sum, sale) => sum + (sale.kg || 0), 0)
                          )
                        ).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                      <Typography variant='body2' color='text.secondary'>
                        Total Crates
                      </Typography>
                      <Typography variant='h6' fontWeight='bold' color='info.main'>
                        {lotSaleData.sales.reduce((sum, sale) => sum + (sale.total_crate || 0), 0).toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </>
          ) : (
            <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              No sales data available
            </Typography>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8f9fa' }}>
        <Button onClick={onClose} variant='outlined' sx={{ textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
