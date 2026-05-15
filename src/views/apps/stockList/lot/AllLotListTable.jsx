'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import classnames from 'classnames'
import Swal from 'sweetalert2'

// Component Imports
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'

import OptionMenu from '@/@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// import LotInvoicePrintHandler from './LotInvoicePrintHandler'

// Util Imports
import {
    adjustStock,
    deleteLot,
    deleteLotReceipt,
    getLotSaleSummary,
    updateAllLotExpenses,
    updateLotCost,
    updateLotInfo,
    updateLotStatus,
    uploadLotReceipt
} from '@/actions/lotActions'
import { updateSupplier } from '@/actions/supplierAction'
import LotInvoicePrintHandler from '@/components/LotSaleInvoice/LotInvoicePrintHandler'
import TableSkeleton from '@/components/TableSkeleton'
import { useAdmin } from '@/hooks/useAdmin'
import { showError, showSuccess } from '@/utils/toastUtils'
import tableStyles from '@core/styles/table.module.css'

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

const AllLotListTable = ({ lotData = [], paginationData, loading, onPageChange, onPageSizeChange, onSearchChange }) => {
  // console.log('lot data', lotData)
  const { isAdmin } = useAdmin()
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const [selectedLot, setSelectedLot] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [adjustStockOpen, setAdjustStockOpen] = useState(false)
  const [editCostOpen, setEditCostOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [adjustLoading, setAdjustLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  const [lotSaleData, setLotSaleData] = useState(null)
  const [loadingSaleData, setLoadingSaleData] = useState(false)
  const [printTrigger, setPrintTrigger] = useState(false)

  // Manage Expenses modal state
  const [expensesOpen, setExpensesOpen] = useState(false)
  const [expensesLot, setExpensesLot] = useState(null)

  // console.log('lot sale data', lotSaleData)

  useEffect(() => {
    setData(lotData)
  }, [lotData])

  // Handle search change
  const handleSearch = value => {
    setGlobalFilter(String(value))
    if (onSearchChange) {
      onSearchChange(String(value))
    }
  }

  const fetchLotSaleSummary = async lotId => {
    setLoadingSaleData(true)

    try {
      const result = await getLotSaleSummary(lotId)

      // console.log('sale data', result)

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

  const handleDeleteLot = async lotId => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! This will attempt to restore supplier crate balances.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        const response = await deleteLot(lotId)

        if (response.success) {
          setData(prevData => prevData.filter(item => item._id !== lotId))
          Swal.fire('Deleted!', 'Lot has been deleted.', 'success')
        } else {
          Swal.fire('Error!', response.error || 'Failed to delete lot.', 'error')
        }
      } catch (error) {
        Swal.fire('Error!', 'Something went wrong.', 'error')
      }
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
      cell: ({ row }) => row.original.productsId?.productNameBn || row.original.productsId?.productName || '—'
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
      accessorKey: 'carat.remaining_crate_Type_1',
      header: 'Remaining Crate 1',
      cell: ({ row }) => {
        const remainingCrate1 = row.original.carat?.remaining_crate_Type_1 || 0

        return remainingCrate1 > 0 ? remainingCrate1 : '—'
      }
    },

    {
      accessorKey: 'carat.remaining_crate_Type_2',
      header: 'Remaining Crate 2',
      cell: ({ row }) => {
        const remainingCrate2 = row.original.carat?.remaining_crate_Type_2 || 0

        return remainingCrate2 > 0 ? remainingCrate2 : '—'
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
      accessorKey: 'remaining_boxes',
      header: 'Remaining Boxes',
      cell: ({ row }) => {
        const remainingBoxes = row.original.remaining_boxes || 0

        return remainingBoxes > 0 ? remainingBoxes : '—'
      }
    },
    {
      accessorKey: 'piece_quantity',
      header: 'Total Pieces',
      cell: ({ row }) => {
        const pieceQty = row.original.piece_quantity || 0

        return pieceQty > 0 ? pieceQty : '—'
      }
    },
    {
      accessorKey: 'remaining_pieces',
      header: 'Remaining Pieces',
      cell: ({ row }) => {
        const remainingPieces = row.original.remaining_pieces || 0

        return remainingPieces > 0 ? remainingPieces : '—'
      }
    },
    {
      accessorKey: 'bag_quantity',
      header: 'Total Bags',
      cell: ({ row }) => {
        const bagQty = row.original.bag_quantity || 0

        return bagQty > 0 ? bagQty : '—'
      }
    },
    {
      accessorKey: 'remaining_bags',
      header: 'Remaining Bags',
      cell: ({ row }) => {
        const remainingBags = row.original.remaining_bags || 0

        return remainingBags > 0 ? remainingBags : '—'
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
              },
              {
                text: 'Manage Receipts',
                icon: 'tabler-photo',
                menuItemProps: {
                  onClick: () => {
                    setSelectedLot(row.original)
                    setReceiptOpen(true)
                  },
                  className: 'flex items-center gap-2'
                }
              },
              {
                text: 'Edit Cost Price',
                icon: 'tabler-pencil',
                menuItemProps: {
                  onClick: () => {
                    setSelectedLot(row.original)
                    setEditCostOpen(true)
                  },
                  className: 'flex items-center gap-2 text-indigo-600'
                }
              },
              {
                text: 'Manage Expenses',
                icon: 'tabler-coin',
                menuItemProps: {
                  onClick: () => {
                    setExpensesLot(row.original)
                    setExpensesOpen(true)
                  },
                  className: 'flex items-center gap-2 text-orange-600'
                }
              },
              ...(isAdmin
                ? [
                    {
                      text: 'Delete',
                      icon: 'tabler-trash',
                      menuItemProps: {
                        onClick: () => handleDeleteLot(row.original._id),
                        className: 'flex items-center gap-2 text-red-500 hover:bg-red-50'
                      }
                    }
                  ]
                : [])
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

  const ViewDetailsModal = () => {
    const [editLotName, setEditLotName] = useState(selectedLot?.lot_name || '')
    const [editSupplierName, setEditSupplierName] = useState(selectedLot?.supplierId?.basic_info?.name || '')
    const [saveLoading, setSaveLoading] = useState(false)

    // Sync when lotSaleData loads (may have more up-to-date name)
    useEffect(() => {
      if (lotSaleData) {
        setEditLotName(lotSaleData.lot_name || selectedLot?.lot_name || '')
        setEditSupplierName(lotSaleData.supplier_name || selectedLot?.supplierId?.basic_info?.name || '')
      }
    }, [lotSaleData?.lot_name, lotSaleData?.supplier_name])

    const handleSaveInfo = async () => {
      if (!selectedLot?._id) return
      setSaveLoading(true)
      try {
        const promises = []

        if (editLotName.trim() && editLotName.trim() !== lotSaleData?.lot_name) {
          promises.push(updateLotInfo(selectedLot._id, { lot_name: editLotName.trim() }))
        }

        if (editSupplierName.trim() && editSupplierName.trim() !== lotSaleData?.supplier_name) {
          const supplierId = selectedLot?.supplierId?._id || selectedLot?.supplierId
          if (supplierId) {
            // Use $set with dot notation to only update the name field, not replace the whole basic_info object
            promises.push(updateSupplier(supplierId, { $set: { 'basic_info.name': editSupplierName.trim() } }))
          }
        }

        if (promises.length === 0) {
          showSuccess('No changes to save')
          setSaveLoading(false)
          return
        }

        const results = await Promise.all(promises)
        const hasError = results.some(r => r && r.success === false)

        if (hasError) {
          showError('Failed to save some changes')
        } else {
          setLotSaleData(prev => prev ? { ...prev, lot_name: editLotName.trim(), supplier_name: editSupplierName.trim() } : prev)
          setData(prev => prev.map(item =>
            item._id === selectedLot._id ? { ...item, lot_name: editLotName.trim() } : item
          ))
          showSuccess('Saved successfully')
        }
      } catch (err) {
        console.error('Save info error:', err)
        showError(err?.message || 'Failed to save changes')
      } finally {
        setSaveLoading(false)
      }
    }

    // Determine which columns to show based on sale data
    const hasDiscount = lotSaleData?.sales?.some(sale => (sale.discount_Kg || 0) > 0) || false
    const hasCrate =
      lotSaleData?.sales?.some(
        sale => (sale.total_crate || 0) > 0 || (sale.crate_type1 || 0) > 0 || (sale.crate_type2 || 0) > 0
      ) || false
    const hasBox = lotSaleData?.sales?.some(sale => sale.isBoxed && (sale.box_quantity || 0) > 0) || false
    const hasPiece = lotSaleData?.sales?.some(sale => sale.isPieced && (sale.piece_quantity || 0) > 0) || false
    const hasKg = lotSaleData?.sales?.some(sale => (sale.kg || 0) > 0) || false

    // Calculate totals
    const totalKg = lotSaleData?.sales?.reduce((sum, sale) => sum + (sale.kg || 0), 0) || 0
    const totalBox = lotSaleData?.sales?.reduce((sum, sale) => sum + (sale.box_quantity || 0), 0) || 0
    const totalPiece = lotSaleData?.sales?.reduce((sum, sale) => sum + (sale.piece_quantity || 0), 0) || 0
    const totalCrate = lotSaleData?.sales?.reduce((sum, sale) => sum + (sale.total_crate || 0), 0) || 0
    const totalPrice = lotSaleData?.sales?.reduce((sum, sale) => sum + (sale.total_price || 0), 0) || 0

    return (
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
        {/* MODAL HEADER Sales Focus      */}
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
          {/* Edit lot name + supplier name — always visible */}
          <Card
            elevation={0}
            sx={{
              mb: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <CardContent>
              <div className='flex items-start justify-between flex-wrap gap-4'>
                <div className='flex flex-col gap-2' style={{ width: '48%', minWidth: '200px' }}>
                  <div>
                    <p className='text-xs opacity-80 mb-1 text-white'>Lot Name</p>
                    <input
                      value={editLotName}
                      onChange={e => setEditLotName(e.target.value)}
                      className='w-full bg-white/20 text-white placeholder-white/60 border border-white/40 rounded px-2 py-1 text-base font-bold outline-none focus:bg-white/30'
                      placeholder='Lot name...'
                    />
                  </div>
                  <div>
                    <p className='text-xs opacity-80 mb-1 text-white'>Supplier</p>
                    <input
                      value={editSupplierName}
                      onChange={e => setEditSupplierName(e.target.value)}
                      className='w-full bg-white/20 text-white placeholder-white/60 border border-white/40 rounded px-2 py-1 text-sm outline-none focus:bg-white/30'
                      placeholder='Supplier name...'
                    />
                  </div>
                  <button
                    onClick={handleSaveInfo}
                    disabled={saveLoading}
                    className='self-start mt-1 px-3 py-1 bg-white text-indigo-700 text-xs font-semibold rounded hover:bg-indigo-50 disabled:opacity-60 flex items-center gap-1'
                  >
                    {saveLoading ? <CircularProgress size={12} sx={{ color: '#4f46e5' }} /> : <i className='tabler-device-floppy text-sm' />}
                    Save
                  </button>
                </div>
                <div className='text-right'>
                  <p className='text-sm opacity-90 mb-1 text-white'>Total Transactions</p>
                  <p className='text-4xl font-bold text-white'>{lotSaleData?.sales?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                          {hasKg && (
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Kg</th>
                          )}
                          {hasBox && (
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Box</th>
                          )}
                          {hasPiece && (
                            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>Piece</th>
                          )}
                          <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>
                            Unit Price
                          </th>
                          {hasDiscount && (
                            <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase'>
                              Discount
                            </th>
                          )}
                          {hasCrate && (
                            <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase'>
                              Crate
                            </th>
                          )}
                          <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase'>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lotSaleData.sales?.map((sale, index) => (
                          <tr key={index} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                            <td className='px-4 py-3 text-sm font-medium text-gray-700'>{index + 1}</td>
                            {hasKg && (
                              <td className='px-4 py-3 text-center'>
                                <span className='inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold'>
                                  {sale.kg || 0} kg
                                </span>
                              </td>
                            )}
                            {hasBox && (
                              <td className='px-4 py-3 text-center'>
                                <span className='inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold'>
                                  {sale.box_quantity || 0}
                                </span>
                              </td>
                            )}
                            {hasPiece && (
                              <td className='px-4 py-3 text-center'>
                                <span className='inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold'>
                                  {sale.piece_quantity || 0}
                                </span>
                              </td>
                            )}
                            <td className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                              ৳{sale.unit_price?.toFixed(2) || 0}
                            </td>
                            {hasDiscount && (
                              <td className='px-4 py-3 text-center text-sm text-gray-600'>
                                {sale.discount_Kg > 0 ? (
                                  <span className='text-orange-600 font-medium'>{sale.discount_Kg} kg</span>
                                ) : (
                                  <span className='text-gray-400'>—</span>
                                )}
                              </td>
                            )}
                            {hasCrate && (
                              <td className='px-4 py-3 text-center'>
                                <span className='inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold'>
                                  {sale.total_crate || 0}
                                </span>
                              </td>
                            )}
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
                      {lotSaleData.lot_expenses.custom_expenses?.map((exp, index) => (
                        <div key={index} className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
                          <p className='text-xs font-medium text-blue-600 mb-1'>{exp.name}</p>
                          <p className='text-lg font-semibold text-blue-700'>৳{exp.amount}</p>
                        </div>
                      ))}
                      {lotSaleData.lot_expenses.extra_expense > 0 && (
                        <div className='p-3 bg-red-50 rounded-lg border border-red-200'>
                          <p className='text-xs font-medium text-red-600 mb-1'>Extra Expense</p>
                          <p className='text-lg font-semibold text-red-700'>
                            ৳{lotSaleData.lot_expenses.extra_expense}
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
                        {hasKg && totalKg > 0 && (
                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-600'>Total Kg Sold:</span>
                            <span className='text-base font-bold text-gray-800'>{totalKg} kg</span>
                          </div>
                        )}
                        {hasBox && totalBox > 0 && (
                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-600'>Total Boxes:</span>
                            <span className='text-base font-bold text-gray-800'>{totalBox}</span>
                          </div>
                        )}
                        {hasPiece && totalPiece > 0 && (
                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-600'>Total Pieces:</span>
                            <span className='text-base font-bold text-gray-800'>{totalPiece}</span>
                          </div>
                        )}
                        {hasCrate && totalCrate > 0 && (
                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-600'>Total Crates:</span>
                            <span className='text-base font-bold text-gray-800'>{totalCrate}</span>
                          </div>
                        )}
                        <div className='flex justify-between items-center'>
                          <span className='text-sm text-gray-600'>Total Sales Amount:</span>
                          <span className='text-lg font-bold text-green-600'>৳{totalPrice.toFixed(2)}</span>
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
                          <span className='text-2xl font-bold text-purple-700'>৳{totalPrice.toFixed(2)}</span>
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
  }

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

  const handleReceiptFileUpload = async e => {
    const file = e.target.files[0]

    if (!file) return

    setUploadLoading(true)

    const formData = new FormData()

    formData.append('image', file)

    try {
      const result = await uploadLotReceipt(selectedLot._id, formData)

      if (result.success) {
        setData(prev =>
          prev.map(lot =>
            lot._id === selectedLot._id ? { ...lot, receiptImages: [...(lot.receiptImages || []), result.data] } : lot
          )
        )
        setSelectedLot(prev => ({ ...prev, receiptImages: [...(prev.receiptImages || []), result.data] }))
        showSuccess('Receipt uploaded successfully')
      } else {
        showError(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload Error:', error)
      showError(error.message || 'Something went wrong during upload')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleReceiptDelete = async imageId => {
    const confirm = await Swal.fire({
      title: 'Delete Receipt?',
      text: 'This image will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        container: 'my-swal-container'
      },
      didOpen: () => {
        const container = document.querySelector('.my-swal-container')
        if (container) container.style.zIndex = '9999'
      }
    })

    if (confirm.isConfirmed) {
      try {
        const result = await deleteLotReceipt(selectedLot._id, imageId)
        console.log('Backend result:', result)

        if (result.success) {
          setData(prev =>
            prev.map(lot => {
              if (lot._id === selectedLot._id) {
                return {
                  ...lot,
                  receiptImages: lot.receiptImages.filter(img => {
                    const id = typeof img === 'object' ? img._id || img.id : img

                    return id !== imageId
                  })
                }
              }

              return lot
            })
          )
          setSelectedLot(prev => ({
            ...prev,
            receiptImages: prev.receiptImages.filter(img => {
              const id = typeof img === 'object' ? img._id || img.id : img

              return id !== imageId
            })
          }))
          showSuccess('Receipt deleted')
        } else {
          showError(result.error)
        }
      } catch (error) {
        console.error('Delete flow caught error:', error)
        showError('Failed to delete')
      }
    }
  }

  return (
    <>
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={handleSearch}
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
              <TableSkeleton columns={table.getVisibleFlatColumns().length} />
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
      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        selectedLot={selectedLot}
        uploadLoading={uploadLoading}
        onUpload={handleReceiptFileUpload}
        onDelete={handleReceiptDelete}
      />

      {printTrigger && lotSaleData && (
        <LotInvoicePrintHandler
          lotSaleData={{
            ...lotSaleData,
            printTrigger: Date.now()
          }}
          triggerPrint={printTrigger}
          onPrintComplete={() => {
            // console.log('Lot invoice print completed')
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

      {/* Edit Cost Modal */}
      {editCostOpen && selectedLot && (
        <Dialog open={editCostOpen} onClose={() => setEditCostOpen(false)} maxWidth='xs' fullWidth>
          <DialogTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-xl font-bold text-indigo-600'>৳</span>
              <span className='font-bold'>Edit Cost Price</span>
            </div>
            <IconButton size='small' onClick={() => setEditCostOpen(false)}>
              <i className='tabler-x' />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <form
              id='edit-cost-form'
              onSubmit={async e => {
                e.preventDefault()
                const newCost = e.target.elements.newCost.value

                if (!newCost || isNaN(newCost)) {
                  showError('Please enter a valid amount')

                  return
                }

                try {
                  const res = await updateLotCost(selectedLot._id, Number(newCost))
                  console.log('[EditCost] Response:', res)

                  if (res && res.success) {
                    setData(prev =>
                      prev.map(l =>
                        l._id === selectedLot._id ? { ...l, costs: { ...l.costs, unitCost: Number(newCost) } } : l
                      )
                    )
                    showSuccess('Cost updated and history corrected successfully!')
                    setEditCostOpen(false)
                  } else {
                    showError(res?.error || res?.message || 'Failed to update cost')
                  }
                } catch (err) {
                  console.error('[EditCost] Caught error:', err)
                  showError(err?.message || 'An error occurred during update')
                }
              }}
              className='flex flex-col gap-4 mt-2'
            >
              <div className='bg-indigo-50 p-3 rounded-lg border border-indigo-100'>
                <p className='text-sm text-indigo-800 font-medium mb-1'>{selectedLot.lot_name}</p>
                <div className='flex justify-between text-xs'>
                  <span className='text-gray-600'>Current Cost:</span>
                  <span className='font-bold text-gray-800'>৳{selectedLot.costs?.unitCost || 0}</span>
                </div>
              </div>

              <CustomTextField
                fullWidth
                label='New Unit Cost (৳)'
                name='newCost'
                type='number'
                inputProps={{ step: '0.01', min: '0' }}
                defaultValue={selectedLot.costs?.unitCost || ''}
                autoFocus
              />

              <div className='bg-orange-50 p-3 rounded-lg border border-orange-200 mt-2 flex gap-2'>
                <i className='tabler-alert-triangle text-orange-600 text-lg mt-0.5' />
                <p className='text-xs text-orange-800 mb-0'>
                  <strong>Warning:</strong> Changing this price will automatically retroactively recalculate and rewrite
                  the profit for <strong>all past sales</strong> related to this lot!
                </p>
              </div>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditCostOpen(false)} color='secondary'>
              Cancel
            </Button>
            <Button
              type='submit'
              form='edit-cost-form'
              variant='contained'
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Update Cost
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>

      <ManageExpensesModal
        open={expensesOpen}
        onClose={() => { setExpensesOpen(false); setExpensesLot(null) }}
        lot={expensesLot}
        onSuccess={updatedLot => {
          if (updatedLot?._id) {
            setData(prev => prev.map(item => item._id === updatedLot._id ? { ...item, expenses: updatedLot.expenses } : item))
          }
          setExpensesOpen(false)
          setExpensesLot(null)
        }}
      />
    </>
  )
}

export default AllLotListTable

const ReceiptModal = ({ open, onClose, selectedLot, uploadLoading, onUpload, onDelete }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 50px rgba(0,0,0,0.15)' } }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          p: 3
        }}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-white/20 rounded-xl backdrop-blur-md'>
              <i className='tabler-photo-check text-2xl' />
            </div>
            <div>
              <h3 className='text-xl font-bold mb-0'>Supplier Receipts</h3>
              <p className='text-sm opacity-80 mb-0'>{selectedLot?.lot_name}</p>
            </div>
          </div>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <i className='tabler-x' />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent sx={{ p: 4, bgcolor: '#fdfdff' }}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Upload Zone */}
          <div className='flex flex-col gap-4'>
            <h4 className='font-bold text-gray-700 flex items-center gap-2'>
              <i className='tabler-cloud-upload text-indigo-500' />
              Upload New Receipt
            </h4>
            <div
              onClick={() => document.getElementById('receipt-upload-input').click()}
              className='relative group flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer bg-white h-full min-h-[200px]'
            >
              {uploadLoading ? (
                <div className='flex flex-col items-center'>
                  <CircularProgress size={40} sx={{ color: '#6366f1', mb: 2 }} />
                  <p className='text-indigo-600 font-medium'>Uploading proof...</p>
                </div>
              ) : (
                <>
                  <div className='w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                    <i className='tabler-camera-plus text-3xl text-indigo-600' />
                  </div>
                  <p className='text-gray-600 font-medium text-center'>Click or tap to snap or pick a photo</p>
                  <p className='text-gray-400 text-xs mt-1'>Supports JPG, PNG, WebP (Max 5MB)</p>
                </>
              )}
              <input
                id='receipt-upload-input'
                type='file'
                hidden
                accept='image/*'
                onChange={onUpload}
                disabled={uploadLoading}
              />
            </div>
          </div>

          {/* Gallery Zone */}
          <div className='flex flex-col gap-4'>
            <h4 className='font-bold text-gray-700 flex items-center gap-2'>
              <i className='tabler-files text-purple-500' />
              Attached Receipts ({selectedLot?.receiptImages?.length || 0})
            </h4>
            <div className='grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1'>
              {selectedLot?.receiptImages?.length > 0 ? (
                selectedLot.receiptImages.map((img, idx) => (
                  <div
                    key={img._id || img.id || idx}
                    className='relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm'
                  >
                    <img
                      src={`${baseUrl}/uploads/${img.filename}`}
                      alt='Receipt'
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    />
                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                      <IconButton
                        size='small'
                        sx={{
                          bgcolor: 'white',
                          '&:hover': { bgcolor: '#fef2f2' },
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                        onClick={e => {
                          e.stopPropagation()
                          window.open(`${baseUrl}/uploads/${img.filename}`, '_blank')
                        }}
                      >
                        <i className='tabler-eye text-indigo-600' />
                      </IconButton>
                      <IconButton
                        size='small'
                        sx={{
                          bgcolor: '#fee2e2',
                          '&:hover': { bgcolor: '#fca5a5' },
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                        onClick={e => {
                          e.stopPropagation()
                          onDelete(img._id || img.id || img)
                        }}
                      >
                        <i className='tabler-trash text-red-600' />
                      </IconButton>
                    </div>
                  </div>
                ))
              ) : (
                <div className='col-span-2 py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-100'>
                  <i className='tabler-photo-off text-4xl text-gray-300 mb-2' />
                  <p className='text-gray-400 text-sm'>No receipts attached yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const ManageExpensesModal = ({ open, onClose, lot, onSuccess }) => {
  const [form, setForm] = useState({
    labour: '',
    transportation: '',
    van_vara: '',
    moshjid: '',
    trading_post: '',
    extra_expense: '',
    extra_expense_note: '',
    custom_expenses: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && lot) {
      setForm({
        labour: lot.expenses?.labour ?? '',
        transportation: lot.expenses?.transportation ?? '',
        van_vara: lot.expenses?.van_vara ?? '',
        moshjid: lot.expenses?.moshjid ?? '',
        trading_post: lot.expenses?.trading_post ?? '',
        extra_expense: lot.expenses?.extra_expense ?? '',
        extra_expense_note: lot.expenses?.extra_expense_note ?? '',
        custom_expenses: (lot.expenses?.custom_expenses || []).map(e => ({ name: e.name, amount: e.amount }))
      })
    }
  }, [open, lot])

  const handleField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleCustomChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.custom_expenses]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, custom_expenses: updated }
    })
  }

  const handleAddCustomRow = () => {
    setForm(prev => ({ ...prev, custom_expenses: [...prev.custom_expenses, { name: '', amount: '' }] }))
  }

  const handleRemoveCustomRow = index => {
    setForm(prev => ({ ...prev, custom_expenses: prev.custom_expenses.filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateAllLotExpenses(lot._id, {
        labour: Number(form.labour) || 0,
        transportation: Number(form.transportation) || 0,
        van_vara: Number(form.van_vara) || 0,
        moshjid: Number(form.moshjid) || 0,
        trading_post: Number(form.trading_post) || 0,
        custom_expenses: form.custom_expenses.filter(e => e.name?.trim()),
        extra_expense: Number(form.extra_expense) || 0,
        extra_expense_note: form.extra_expense_note || ''
      })

      if (result.success) {
        showSuccess('Expenses updated successfully')
        if (onSuccess) onSuccess(result.data?.lot || result.data)
      } else {
        showError(result.error || 'Failed to update expenses')
      }
    } catch (err) {
      showError('Failed to update expenses')
    } finally {
      setLoading(false)
    }
  }

  const fixedFields = [
    { key: 'labour', label: 'Labour' },
    { key: 'transportation', label: 'Transportation' },
    { key: 'van_vara', label: 'Van Vara' },
    { key: 'moshjid', label: 'Moshjid' },
    { key: 'trading_post', label: 'Trading Post' }
  ]

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className='font-bold'>Manage Expenses — {lot?.lot_name}</span>
        <IconButton size='small' onClick={onClose}><i className='tabler-x' /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <div className='grid grid-cols-2 gap-3'>
          {fixedFields.map(({ key, label }) => (
            <div key={key}>
              <label className='text-xs font-medium text-gray-600 mb-1 block'>{label}</label>
              <input
                type='number'
                min='0'
                onWheel={e => e.currentTarget.blur()}
                value={form[key]}
                onChange={e => handleField(key, e.target.value)}
                placeholder='0'
                className='w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-indigo-400'
              />
            </div>
          ))}
        </div>

        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>Custom Expenses</label>
            <button
              type='button'
              onClick={handleAddCustomRow}
              className='text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium'
            >
              <i className='tabler-plus text-sm' /> Add Row
            </button>
          </div>
          {form.custom_expenses.length === 0 && (
            <p className='text-xs text-gray-400 italic'>No custom expenses. Click "Add Row" to add one.</p>
          )}
          {form.custom_expenses.map((exp, index) => (
            <div key={index} className='flex gap-2 mb-2 items-center'>
              <input
                type='text'
                value={exp.name}
                onChange={e => handleCustomChange(index, 'name', e.target.value)}
                placeholder='Name'
                className='flex-1 px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-indigo-400'
              />
              <input
                type='number'
                min='0'
                onWheel={e => e.currentTarget.blur()}
                value={exp.amount}
                onChange={e => handleCustomChange(index, 'amount', e.target.value)}
                placeholder='Amount'
                className='w-28 px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-indigo-400'
              />
              <button
                type='button'
                onClick={() => handleRemoveCustomRow(index)}
                className='text-red-500 hover:text-red-700 p-1'
              >
                <i className='tabler-trash text-base' />
              </button>
            </div>
          ))}
        </div>

        <div className='border-t pt-3'>
          <label className='text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block'>Extra Expense</label>
          <div className='flex flex-col gap-2'>
            <input
              type='number'
              min='0'
              onWheel={e => e.currentTarget.blur()}
              value={form.extra_expense}
              onChange={e => handleField('extra_expense', e.target.value)}
              placeholder='Amount'
              className='w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-indigo-400'
            />
            <textarea
              value={form.extra_expense_note}
              onChange={e => handleField('extra_expense_note', e.target.value)}
              placeholder='Note (reason for extra expense)...'
              rows={2}
              className='w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-indigo-400 resize-none'
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color='secondary' disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={loading}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save Expenses'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
