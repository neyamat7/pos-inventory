'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import Swal from 'sweetalert2'
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
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import OptionMenu from '@/@core/components/option-menu'

import LotInvoicePrintHandler from './LotInvoicePrintHandler'

// Util Imports
import tableStyles from '@core/styles/table.module.css'
import { adjustStock, getLotSaleSummary, updateLotStatus } from '@/actions/lotActions'
import { showSuccess, showError } from '@/utils/toastUtils'

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

const AllLotListTable = ({ lotData = [], paginationData, loading, onPageChange, onPageSizeChange }) => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const [selectedLot, setSelectedLot] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [adjustStockOpen, setAdjustStockOpen] = useState(false)
  const [adjustLoading, setAdjustLoading] = useState(false)

  const [lotSaleData, setLotSaleData] = useState(null)
  const [loadingSaleData, setLoadingSaleData] = useState(false)
  const [printTrigger, setPrintTrigger] = useState(false)

  useEffect(() => {
    setData(lotData)
  }, [lotData])

  const fetchLotSaleSummary = async lotId => {
    setLoadingSaleData(true)

    try {
      const result = await getLotSaleSummary(lotId)

      if (result.success) {
        setLotSaleData(result.data)
      } else {
        showError(result.error || 'Failed to fetch sale summary')
        setLotSaleData(null)
      }
    } catch (error) {
      console.error('Error fetching lot sale summary:', error)
      showError('Failed to fetch sale summary')
      setLotSaleData(null)
    } finally {
      setLoadingSaleData(false)
    }
  }

  // Updated status change handler with proper revert logic
  const handleStatusChange = async (lotId, newStatus) => {
    const originalItem = data.find(item => item._id === lotId)
    const originalStatus = originalItem?.status

    try {
      setData(prevData => prevData.map(item => (item._id === lotId ? { ...item, status: newStatus } : item)))

      const result = await updateLotStatus(lotId, newStatus)

      if (!result.success) {
        setData(prevData => prevData.map(item => (item._id === lotId ? { ...item, status: originalStatus } : item)))
        Swal.fire('Error!', result.message, 'error')
      } else {
        Swal.fire('Updated!', 'Lot status updated successfully.', 'success')
      }
    } catch (error) {
      setData(prevData => prevData.map(item => (item._id === lotId ? { ...item, status: originalStatus } : item)))
      Swal.fire('Error!', 'Failed to update lot status', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'purchase_date',
      header: 'Purchase Date',
      cell: ({ getValue }) => {
        const value = getValue()

        if (!value) return '—'
        const date = new Date(value)

        return date.toLocaleDateString('en-GB')
      }
    },
    {
      accessorKey: 'lot_name',
      header: 'Lot Name'
    },
    {
      accessorKey: 'productsId.productName',
      header: 'Product',
      cell: ({ row }) => row.original.productsId?.productName || '—'
    },
    {
      accessorKey: 'supplierId.basic_info.name',
      header: 'Supplier',
      cell: ({ row }) => row.original.supplierId?.basic_info?.name || '—'
    },
    {
      accessorKey: 'carat',
      header: 'Total Carat',
      cell: ({ row }) => {
        const carat1 = row.original.carat?.carat_Type_1 || 0
        const carat2 = row.original.carat?.carat_Type_2 || 0

        return carat1 + carat2
      }
    },
    {
      accessorKey: 'box_quantity',
      header: 'Total Boxes',
      cell: ({ row }) => {
        const boxQty = row.original.box_quantity || 0

        return boxQty > 0 ? boxQty : '—'
      }
    },
    {
      accessorKey: 'costs.unitCost',
      header: 'Unit Cost',
      cell: ({ getValue }) => {
        const value = getValue()

        return value ? `৳${value}` : '—'
      }
    },
    {
      accessorKey: 'sales.totalKgSold',
      header: 'Sold (kg)',
      cell: ({ getValue }) => getValue() || 0
    },
    {
      accessorKey: 'sold_boxes',
      header: 'Sold (Boxes)',
      cell: ({ row }) => {
        const totalBoxes = row.original.box_quantity || 0
        const remainingBoxes = row.original.remaining_boxes || 0
        const soldBoxes = totalBoxes - remainingBoxes

        return totalBoxes > 0 ? soldBoxes : '—'
      }
    },
    {
      accessorKey: 'sales.totalSoldPrice',
      header: 'Sold Amount',
      cell: ({ getValue }) => {
        const value = getValue()

        return value ? `৳${value}` : '৳0'
      }
    },
    {
      accessorKey: 'profits.totalProfit',
      header: 'Profit',
      cell: ({ getValue }) => {
        const value = getValue()

        return value ? `৳${value}` : '৳0'
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const displayText = status === 'in stock' ? 'In Stock' : 'Stock Out'
        const color = status === 'in stock' ? '#2e7d32' : '#d32f2f'

        return (
          <div
            style={{
              color,
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: status === 'in stock' ? '#f1f8e9' : '#ffebee',
              display: 'inline-block',
              minWidth: '100px',
              textAlign: 'center'
            }}
          >
            {displayText}
          </div>
        )
      }
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center'>
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'View Sales',
                icon: 'tabler-receipt',
                menuItemProps: {
                  onClick: () => {
                    setSelectedLot(row.original)
                    setViewOpen(true)
                    fetchLotSaleSummary(row.original._id)
                  },
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Adjust Stock',
                icon: 'tabler-edit',
                menuItemProps: {
                  onClick: () => {
                    setSelectedLot(row.original)
                    setAdjustStockOpen(true)
                  },
                  className: 'flex items-center gap-2'
                }
              }
            ]}
          />
        </div>
      ),
      enableSorting: false
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: paginationData?.totalPages || 1
  })

  const ViewDetailsModal = () => (
    <Dialog
      open={viewOpen}
      onClose={() => {
        setViewOpen(false)
        setLotSaleData(null)
      }}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* ============================================ */}
      {/* MODAL HEADER - Simplified, Sales Focus      */}
      {/* ============================================ */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: 3
        }}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
              <i className='tabler-receipt-2 text-2xl' />
            </div>
            <div>
              <h3 className='text-xl font-bold mb-0'>Sale Summary</h3>
              <p className='text-sm opacity-90 mb-0'>{selectedLot?.lot_name}</p>
            </div>
          </div>
          <IconButton
            size='small'
            onClick={() => {
              setViewOpen(false)
              setLotSaleData(null)
            }}
            sx={{
              color: 'white',
              '&:hover': { background: 'rgba(255,255,255,0.1)' }
            }}
          >
            <i className='tabler-x' />
          </IconButton>
        </div>
      </DialogTitle>

      {/* ============================================ */}
      {/* CONTENT AREA - Sales Summary Only           */}
      {/* NO TABS - Direct display of sales data      */}
      {/* ============================================ */}
      <DialogContent sx={{ p: 3, bgcolor: '#fafbfc', minHeight: 400 }}>
        {/* Loading State */}
        {loadingSaleData ? (
          <div className='flex flex-col items-center justify-center py-12'>
            <CircularProgress size={40} sx={{ color: '#667eea' }} />
            <p className='mt-4 text-gray-600'>Loading sale summary...</p>
          </div>
        ) : !lotSaleData ? (
          <div className='flex flex-col items-center justify-center py-12'>
            <i className='tabler-alert-circle text-6xl text-gray-400 mb-4' />
            <p className='text-gray-600'>No sale data available</p>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {/* Sale Summary Header Card */}
            <Card
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm opacity-90 mb-1'>Lot Name</p>
                    <h3 className='text-2xl font-bold mb-2'>{lotSaleData.lot_name}</h3>
                    <p className='text-sm opacity-90'>Supplier: {lotSaleData.supplier_name}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm opacity-90 mb-1'>Total Transactions</p>
                    <p className='text-4xl font-bold'>{lotSaleData.sales?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sales Transactions Table */}
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-list text-purple-600 text-xl' />
                    <h4 className='font-semibold text-lg mb-0'>Sales Transactions</h4>
                  </div>
                </div>

                {/* Responsive Table */}
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-gray-100 border-b-2 border-gray-200'>
                        <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>#</th>
                        <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase'>Kg</th>
                        <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase'>
                          Discount
                        </th>
                        <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>
                          Unit Price
                        </th>
                        <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase'>Crate</th>
                        <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotSaleData.sales?.map((sale, index) => (
                        <tr key={index} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                          <td className='px-4 py-3 text-sm font-medium text-gray-700'>{index + 1}</td>
                          <td className='px-4 py-3 text-center'>
                            <span className='inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold'>
                              {sale.kg || 0} kg
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center text-sm text-gray-600'>
                            {sale.discount_Kg > 0 ? (
                              <span className='text-orange-600 font-medium'>{sale.discount_Kg} kg</span>
                            ) : (
                              <span className='text-gray-400'>—</span>
                            )}
                          </td>
                          <td className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                            ৳{sale.unit_price?.toFixed(2) || 0}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            <span className='inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold'>
                              {sale.total_crate || 0}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-right text-base font-bold text-green-600'>
                            ৳{sale.total_price?.toFixed(2) || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Expenses Breakdown - Only show if expenses exist */}
            {lotSaleData.lot_expenses?.total_expenses > 0 && (
              <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <CardContent>
                  <div className='flex items-center gap-2 mb-4'>
                    <i className='tabler-coin text-orange-600 text-xl' />
                    <h4 className='font-semibold text-lg mb-0'>Expenses Breakdown</h4>
                  </div>
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                    {lotSaleData.lot_expenses.labour > 0 && (
                      <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
                        <p className='text-xs font-medium text-orange-600 mb-1'>Labour</p>
                        <p className='text-lg font-semibold text-orange-700'>৳{lotSaleData.lot_expenses.labour}</p>
                      </div>
                    )}
                    {lotSaleData.lot_expenses.transportation > 0 && (
                      <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
                        <p className='text-xs font-medium text-orange-600 mb-1'>Transportation</p>
                        <p className='text-lg font-semibold text-orange-700'>
                          ৳{lotSaleData.lot_expenses.transportation}
                        </p>
                      </div>
                    )}
                    {lotSaleData.lot_expenses.van_vara > 0 && (
                      <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
                        <p className='text-xs font-medium text-orange-600 mb-1'>Van Vara</p>
                        <p className='text-lg font-semibold text-orange-700'>৳{lotSaleData.lot_expenses.van_vara}</p>
                      </div>
                    )}
                    {lotSaleData.lot_expenses.moshjid > 0 && (
                      <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
                        <p className='text-xs font-medium text-orange-600 mb-1'>Moshjid</p>
                        <p className='text-lg font-semibold text-orange-700'>৳{lotSaleData.lot_expenses.moshjid}</p>
                      </div>
                    )}
                    {lotSaleData.lot_expenses.trading_post > 0 && (
                      <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
                        <p className='text-xs font-medium text-orange-600 mb-1'>Trading Post</p>
                        <p className='text-lg font-semibold text-orange-700'>
                          ৳{lotSaleData.lot_expenses.trading_post}
                        </p>
                      </div>
                    )}
                    {lotSaleData.lot_expenses.other_expenses > 0 && (
                      <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
                        <p className='text-xs font-medium text-orange-600 mb-1'>Other</p>
                        <p className='text-lg font-semibold text-orange-700'>
                          ৳{lotSaleData.lot_expenses.other_expenses}
                        </p>
                      </div>
                    )}
                    {lotSaleData.lot_expenses.extra_discount > 0 && (
                      <div className='p-3 bg-orange-50 rounded-lg border border-orange-200'>
                        <p className='text-xs font-medium text-orange-600 mb-1'>Extra Discount</p>
                        <p className='text-lg font-semibold text-orange-700'>
                          ৳{lotSaleData.lot_expenses.extra_discount}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Totals */}
            <Card
              elevation={0}
              sx={{
                border: '2px solid #667eea',
                borderRadius: 2,
                background: 'linear-gradient(to right, #f8f9fa, #e9ecef)'
              }}
            >
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 mb-3'>Sales Summary</p>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Total Kg Sold:</span>
                        <span className='text-base font-bold text-gray-800'>
                          {lotSaleData.sales?.reduce((sum, sale) => sum + (sale.kg || 0), 0)} kg
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Total Crates:</span>
                        <span className='text-base font-bold text-gray-800'>
                          {lotSaleData.sales?.reduce((sum, sale) => sum + (sale.total_crate || 0), 0)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Total Sales Amount:</span>
                        <span className='text-lg font-bold text-green-600'>
                          ৳{lotSaleData.sales?.reduce((sum, sale) => sum + (sale.total_price || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-600 mb-3'>Financial Summary</p>
                    <div className='space-y-2'>
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-600'>Total Expenses:</span>
                        <span className='text-base font-bold text-red-600'>
                          ৳{(lotSaleData.lot_expenses?.total_expenses || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className='h-px bg-gray-300 my-2'></div>
                      <div className='flex justify-between items-center p-3 bg-purple-100 rounded-lg'>
                        <span className='text-base font-bold text-purple-700'>Grand Total:</span>
                        <span className='text-2xl font-bold text-purple-700'>
                          ৳{lotSaleData.sales?.reduce((sum, sale) => sum + (sale.total_price || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* Download Invoice Button                     */}
            {/* ============================================ */}
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, background: '#f8f9fa' }}>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <i className='tabler-printer text-gray-600 text-xl' />
                    <div>
                      <p className='font-semibold text-gray-800 mb-0'>Print Invoice</p>
                      <p className='text-xs text-gray-500 mb-0'>Download a printable invoice for this lot</p>
                    </div>
                  </div>
                  <Button
                    variant='contained'
                    startIcon={<i className='tabler-download' />}
                    onClick={() => {
                      setPrintTrigger(true)
                    }}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6941a8 100%)'
                      }
                    }}
                  >
                    Download Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>

      {/* ============================================ */}
      {/* MODAL FOOTER                                */}
      {/* ============================================ */}
      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
        <Button
          variant='outlined'
          onClick={() => {
            setViewOpen(false)
            setLotSaleData(null)
          }}
          sx={{ textTransform: 'none' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )

  const AdjustStockModal = () => {
    const [unitQuantity, setUnitQuantity] = useState('')
    const [reasonNote, setReasonNote] = useState('')

    const handleSubmit = async () => {
      if (!unitQuantity || !reasonNote.trim()) {
        Swal.fire('Error!', 'Please fill all fields', 'error')

        return
      }

      setAdjustLoading(true)

      try {
        const result = await adjustStock(selectedLot._id, {
          unit_quantity: Number(unitQuantity),
          reason_note: reasonNote.trim()
        })

        if (result.success) {
          showSuccess('Stock adjusted successfully')
          setAdjustStockOpen(false)
          setUnitQuantity('')
          setReasonNote('')
        } else {
          Swal.fire('Error!', result.error, 'error')
        }
      } catch (error) {
        Swal.fire('Error!', 'Failed to adjust stock', 'error')
      } finally {
        setAdjustLoading(false)
      }
    }

    return (
      <Dialog open={adjustStockOpen} onClose={() => setAdjustStockOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <i className='tabler-edit text-xl' />
            <span>Adjust Stock - {selectedLot?.lot_name}</span>
          </div>
          <IconButton size='small' onClick={() => setAdjustStockOpen(false)}>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent className='flex flex-col gap-4'>
          <CustomTextField
            label='Unit Quantity'
            type='number'
            value={unitQuantity}
            onChange={e => setUnitQuantity(e.target.value)}
            placeholder='Enter quantity to adjust'
            fullWidth
          />
          <CustomTextField
            label='Reason Note'
            multiline
            rows={3}
            value={reasonNote}
            onChange={e => setReasonNote(e.target.value)}
            placeholder='Enter reason for stock adjustment'
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={() => setAdjustStockOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={adjustLoading}
            startIcon={adjustLoading ? <CircularProgress size={16} /> : null}
          >
            {adjustLoading ? 'Adjusting...' : 'Adjust Stock'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Lot'
          className='sm:is-auto'
        />
        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <CustomTextField
            select
            value={paginationData?.limit || 10}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className='is-[70px] max-sm:is-full'
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
                  <th key={header.id} className='whitespace-nowrap border-r text-sm'>
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
                  <div className='flex items-center justify-center gap-2 p-4'>
                    <CircularProgress size={20} />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={classnames('whitespace-nowrap border border-solid border-gray-200 text-gray-800')}
                    >
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

      <ViewDetailsModal />
      <AdjustStockModal />

      {printTrigger && lotSaleData && (
        <LotInvoicePrintHandler
          lotSaleData={{
            ...lotSaleData,
            printTrigger: Date.now()
          }}
          triggerPrint={printTrigger}
          onPrintComplete={() => {
            console.log('Lot invoice print completed')
            setPrintTrigger(false)
            showSuccess('Invoice printed successfully!')
          }}
          onPrintError={error => {
            console.error('Print failed:', error)
            setPrintTrigger(false)
            showError('Failed to print invoice')
          }}
        />
      )}
    </Card>
  )
}

export default AllLotListTable
