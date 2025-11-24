'use client'

import { useState, useMemo, useEffect } from 'react'

// MUI Imports
import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { customerColumns } from './customerColumns'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { addCrates, addCratesForSupplier, updateCrates } from '@/actions/crateActions'
import { showError, showSuccess } from '@/utils/toastUtils'

const CrateManagementTable = ({
  supplierData,
  transactionsData,
  transactionsPaginationData,
  transactionsLoading,
  paginationData,
  loading,
  onPageChange,
  onPageSizeChange,
  onSearch,
  searchTerm,
  totalCratesBought,
  remainingCrates,
  totalDebt,
  activeTab,
  setActiveTab,
  totalCrates,
  totalCrateLoading,
  customerData,
  customerPaginationData,
  customerLoading
}) => {
  const [rowSelection, setRowSelection] = useState({})
  const [showAddCrateModal, setShowAddCrateModal] = useState(false)
  const [showAddTotalModal, setShowAddTotalModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [addTotalCrateLoading, setAddTotalCrateLoading] = useState(false)
  const [addSupplierCrateLoading, setAddSupplierCrateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const router = useRouter()

  const [updateForm, setUpdateForm] = useState({
    type1Quantity: '',
    type2Quantity: '',
    type1Price: '',
    type2Price: '',
    notes: ''
  })

  // Modal form state
  const [modalForm, setModalForm] = useState({
    type1Quantity: '',
    type2Quantity: '',
    type1Price: '',
    type2Price: '',
    notes: '',
    date: '',
    stockType: 'new'
  })

  const handleSearch = value => {
    if (onSearch) {
      onPageChange(1)
      onSearch(value)
    }
  }

  // Calculate real-time debt clearance
  const calculation = useMemo(() => {
    if (!selectedSupplier || !selectedSupplier.crate_info) return null

    const type1Qty = parseInt(modalForm.type1Quantity) || 0
    const type2Qty = parseInt(modalForm.type2Quantity) || 0
    const type1Debt = selectedSupplier.crate_info.needToGiveCrate1 || 0
    const type2Debt = selectedSupplier.crate_info.needToGiveCrate2 || 0

    const type1DebtCleared = Math.min(type1Qty, type1Debt)
    const type2DebtCleared = Math.min(type2Qty, type2Debt)

    return {
      type1: {
        debtCleared: type1DebtCleared,
        message:
          type1Qty === 0
            ? ''
            : type1Qty <= type1Debt
              ? `Reduces debt by ${type1Qty} crate(s)`
              : `Debt of ${type1Debt} cleared! ${type1Qty - type1Debt} excess crate(s)`
      },
      type2: {
        debtCleared: type2DebtCleared,
        message:
          type2Qty === 0
            ? ''
            : type2Qty <= type2Debt
              ? `Reduces debt by ${type2Qty} crate(s)`
              : `Debt of ${type2Debt} cleared! ${type2Qty - type2Debt} excess crate(s)`
      },
      hasInput: type1Qty > 0 || type2Qty > 0
    }
  }, [selectedSupplier, modalForm.type1Quantity, modalForm.type2Quantity])

  const handleSendCratesToSupplier = async () => {
    if (!selectedSupplier || !calculation?.hasInput) return

    setAddSupplierCrateLoading(true)

    try {
      const crateInfo = {
        crate1: parseInt(modalForm.type1Quantity) || 0,
        crate2: parseInt(modalForm.type2Quantity) || 0,
        crate1Price: parseInt(modalForm.type1Price) || selectedSupplier.crate_info.crate1Price,
        crate2Price: parseInt(modalForm.type2Price) || selectedSupplier.crate_info.crate2Price
      }

      const result = await addCratesForSupplier(selectedSupplier._id, crateInfo)

      if (result.success) {
        console.log('Crates sent to supplier successfully')
        showSuccess('Crates sent to supplier successfully!')
      } else {
        console.error('Failed to send crates to supplier')
        showError('Failed to send crates to supplier!')
      }
    } catch (error) {
      console.error('Error sending crates to supplier:', error)
    } finally {
      setAddSupplierCrateLoading(false)
      setModalForm({
        type1Quantity: '',
        type2Quantity: '',
        type1Price: '',
        type2Price: '',
        notes: '',
        date: ''
      })
      setShowAddCrateModal(false)
      setSelectedSupplier(null)
    }
  }

  const handleAddTotalCrates = async () => {
    const type1Qty = parseInt(modalForm.type1Quantity) || 0
    const type2Qty = parseInt(modalForm.type2Quantity) || 0

    if (type1Qty === 0 && type2Qty === 0) return
    setAddTotalCrateLoading(true)

    try {
      const crateData = {
        date: modalForm.date || new Date().toISOString(),
        crate_type_1_qty: type1Qty,
        crate_type_2_qty: type2Qty,
        note: modalForm.notes || '',
        stockType: modalForm.stockType
      }

      const result = await addCrates(crateData)

      if (result.success) {
        console.log('Total crates added successfully:', result.data)
        showSuccess('Total crates added successfully!')
      } else {
        console.error('Failed to add total crates:', result.error)
        showError('Failed to add total crates!')
      }
    } catch (error) {
      console.error('Error adding total crates:', error)
    } finally {
      setAddTotalCrateLoading(false)
      setModalForm({ type1Quantity: '', type2Quantity: '', notes: '', date: '' })
      setShowAddTotalModal(false)
    }
  }

  const handleUpdateCrates = async () => {
    setUpdateLoading(true)

    try {
      let query = {}

      // Check if it's a supplier update or transaction update
      if (selectedSupplier?.isSupplier) {
        // Updating from supplier list
        query = { supplierId: selectedSupplier._id }
      } else if (selectedSupplier?.isTransaction) {
        // Updating from transaction history
        query = { inventoryCratesId: selectedSupplier.transactionId }
      }

      // Prepare crate info from updateForm
      const crateInfo = {
        crate1: parseInt(updateForm.type1Quantity) || 0,
        crate2: parseInt(updateForm.type2Quantity) || 0,
        crate1Price: parseInt(updateForm.type1Price) || 0,
        crate2Price: parseInt(updateForm.type2Price) || 0
      }

      const result = await updateCrates(query, crateInfo)

      if (result.success) {
        router.refresh()
        console.log('Update successful:', result.data)
        showSuccess(result.message || 'Update successful!')
      } else {
        console.error('Failed to update:', result.error)
        showError(result.error || 'Failed to update!')
      }
    } catch (error) {
      console.error('Error updating:', error)
      showError('Error updating!')
    } finally {
      setUpdateLoading(false)
      setShowUpdateModal(false)
      setSelectedSupplier(null)
      setUpdateForm({
        type1Quantity: '',
        type2Quantity: '',
        type1Price: '',
        type2Price: '',
        notes: ''
      })
    }
  }

  // Supplier table columns
  const supplierColumns = useMemo(
    () => [
      {
        accessorKey: 'basic_info.name',
        header: 'Supplier Name',
        cell: info => (
          <div>
            <div className='font-medium text-gray-900'>{info.getValue()}</div>
          </div>
        )
      },
      {
        accessorKey: 'crate_info.crate1',
        header: 'Crate Type 1',
        cell: info => (
          <div className=''>
            <div className='font-semibold text-blue-600'>{info.getValue()}</div>
            {info.row.original.crate_info.needToGiveCrate1 > 0 && (
              <div className='text-xs text-red-500'>Due: {info.row.original.crate_info.needToGiveCrate1}</div>
            )}
          </div>
        )
      },
      {
        accessorKey: 'crate_info.crate2',
        header: 'Crate Type 2',
        cell: info => (
          <div className=''>
            <div className='font-semibold text-purple-600'>{info.getValue()}</div>
            {info.row.original.crate_info.needToGiveCrate2 > 0 && (
              <div className='text-xs text-red-500'>Due: {info.row.original.crate_info.needToGiveCrate2}</div>
            )}
          </div>
        )
      },
      {
        accessorKey: 'crate_info.crate1Price',
        header: 'Type 1 Price',
        cell: info => <div className=''>৳{info.getValue()}</div>
      },
      {
        accessorKey: 'crate_info.crate2Price',
        header: 'Type 2 Price',
        cell: info => <div className=''>৳{info.getValue()}</div>
      },
      {
        id: 'action',
        header: 'Action',
        cell: info => (
          <div className='flex gap-2'>
            <Button
              variant='contained'
              onClick={() => {
                setSelectedSupplier(info.row.original)
                setShowAddCrateModal(true)
              }}
              sx={{
                backgroundColor: '#897ff3',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#756ae8',
                  boxShadow: '0 4px 8px rgba(137, 127, 243, 0.3)'
                },
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '6px 12px',
                minWidth: 'auto',
                textTransform: 'none',
                borderRadius: '6px'
              }}
              startIcon={<i className='tabler-plus' style={{ fontSize: '16px' }} />}
            >
              Add
            </Button>

            <Button
              variant='outlined'
              onClick={() => {
                setSelectedSupplier({
                  _id: info.row.original._id,
                  isSupplier: true,
                  supplierData: info.row.original
                })
                setShowUpdateModal(true)
                setUpdateForm({
                  type1Quantity: info.row.original.crate_info.crate1?.toString() || '',
                  type2Quantity: info.row.original.crate_info.crate2?.toString() || '',
                  type1Price: info.row.original.crate_info.crate1Price?.toString() || '',
                  type2Price: info.row.original.crate_info.crate2Price?.toString() || '',
                  notes: ''
                })
              }}
              sx={{
                borderColor: '#666',
                color: '#666',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: 'rgba(102, 102, 102, 0.04)'
                },
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '6px 12px',
                minWidth: 'auto',
                textTransform: 'none',
                borderRadius: '6px'
              }}
              startIcon={<i className='tabler-edit' style={{ fontSize: '16px' }} />}
            >
              Update
            </Button>
          </div>
        ),
        enableSorting: false
      }
    ],
    []
  )

  // Transaction table columns
  const transactionColumns = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: 'Date & Time',
        cell: info => (
          <div className='text-sm'>
            <div className='font-medium text-gray-900'>{new Date(info.getValue()).toLocaleDateString('en-GB')}</div>
            <div className='text-xs text-gray-500'>
              {new Date(info.getValue()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )
      },

      {
        accessorKey: 'supplierId.basic_info.name',
        header: 'Supplier',
        cell: info => <div className='font-medium'>{info.getValue() || '-'}</div>
      },

      {
        accessorKey: 'crate_type_1_qty',
        header: 'Type 1 Qty',
        cell: info => <div className='text-center font-semibold'>{info.getValue() || 0}</div>
      },

      {
        accessorKey: 'crate_type_2_qty',
        header: 'Type 2 Qty',
        cell: info => <div className='text-center font-semibold'>{info.getValue() || 0}</div>
      },

      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const isReStock = info.row.original.stockType === 're-stock'
          const statusValue = isReStock ? 'Re Stock' : info.getValue()

          return (
            <Chip
              label={statusValue}
              color={statusValue === 'IN' ? 'success' : statusValue === 'Re Stock' ? 'warning' : 'primary'}
              variant='tonal'
              size='small'
            />
          )
        }
      },

      {
        accessorKey: 'note',
        header: 'Notes',
        cell: info => <div className='text-sm text-gray-600 max-w-xs truncate'>{info.getValue() || '-'}</div>
      },

      {
        id: 'action',
        header: 'Action',
        cell: info => {
          const isReStock = info.row.original.stockType === 're-stock'
          const isOut = info.row.original.status === 'OUT'

          return (
            <>
              {!isOut && !isReStock && (
                <Button
                  variant='outlined'
                  onClick={() => {
                    setSelectedSupplier({
                      transactionId: info.row.original._id,
                      isTransaction: true
                    })
                    setShowUpdateModal(true)
                    setUpdateForm({
                      type1Quantity: info.row.original.crate_type_1_qty?.toString() || '',
                      type2Quantity: info.row.original.crate_type_2_qty?.toString() || '',
                      type1Price: '',
                      type2Price: '',
                      notes: info.row.original.note || ''
                    })
                  }}
                  sx={{
                    borderColor: '#666',
                    color: '#666',
                    '&:hover': {
                      borderColor: '#333',
                      backgroundColor: 'rgba(102, 102, 102, 0.04)'
                    },
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '6px 12px',
                    minWidth: 'auto',
                    textTransform: 'none',
                    borderRadius: '6px'
                  }}
                  startIcon={<i className='tabler-edit' style={{ fontSize: '16px' }} />}
                >
                  Update
                </Button>
              )}
            </>
          )
        },
        enableSorting: false
      }
    ],
    []
  )

  const table = useReactTable({
    data:
      activeTab === 'suppliers'
        ? supplierData || []
        : activeTab === 'customers'
          ? customerData || []
          : transactionsData || [],
    columns:
      activeTab === 'suppliers' ? supplierColumns : activeTab === 'customers' ? customerColumns : transactionColumns,
    pageCount:
      activeTab === 'suppliers'
        ? paginationData?.totalPages || 0
        : activeTab === 'customers'
          ? customerPaginationData?.totalPages || 0
          : transactionsPaginationData?.totalPages || 0,
    state: {
      rowSelection,
      pagination: {
        pageIndex:
          activeTab === 'suppliers'
            ? (paginationData?.currentPage || 1) - 1
            : activeTab === 'customers'
              ? (customerPaginationData?.currentPage || 1) - 1
              : (transactionsPaginationData?.currentPage || 1) - 1,
        pageSize:
          activeTab === 'suppliers'
            ? paginationData?.limit || 10
            : activeTab === 'customers'
              ? customerPaginationData?.limit || 10
              : transactionsPaginationData?.limit || 10
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true
  })

  useEffect(() => {
    if (activeTab === 'suppliers' && paginationData) {
      table.setPageIndex(paginationData.currentPage - 1)
    } else if (activeTab === 'history' && transactionsPaginationData) {
      table.setPageIndex(transactionsPaginationData.currentPage - 1)
    }
  }, [paginationData, transactionsPaginationData, activeTab, table])

  const handlePageChangeWrapper = newPage => {
    console.log('Page change requested:', {
      activeTab,
      newPage,
      supplierCurrentPage: paginationData?.currentPage,
      transactionCurrentPage: transactionsPaginationData?.currentPage
    })
    onPageChange(newPage)
  }

  return (
    <>
      {/* Add Crate Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant='contained'
          color='primary'
          startIcon={<i className='tabler-plus' />}
          onClick={() => setShowAddTotalModal(true)}
        >
          Add Crates to Collection
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 3
        }}
      >
        {/* Total Crates Bought */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2 }}>
                <i className='tabler-package' style={{ fontSize: '2rem', color: '#4caf50' }} />
              </Box>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
              Total Bought Type 1
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'success.main' }}>
              {totalCrates?.type_1_total || 0}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Total purchased this year
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2 }}>
                <i className='tabler-package' style={{ fontSize: '2rem', color: '#4caf50' }} />
              </Box>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
              Total Bought Type 2
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'success.main' }}>
              {totalCrates?.type_2_total || 0}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Total purchased this year
            </Typography>
          </CardContent>
        </Card>

        {/* Remaining Type 1 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '', borderRadius: 2 }}>
                <i className='tabler-package' style={{ fontSize: '2rem', color: '#2196f3' }} />
              </Box>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
              Remaining Type 1
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'primary.main' }}>
              {totalCrates?.remaining_type_1 || 0}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Available in stock
            </Typography>
          </CardContent>
        </Card>

        {/* Remaining Type 2 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '', borderRadius: 2 }}>
                <i className='tabler-package' style={{ fontSize: '2rem', color: '#9c27b0' }} />
              </Box>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
              Remaining Type 2
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {totalCrates?.remaining_type_2 || 0}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Available in stock
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex' }}>
            <Button
              onClick={() => setActiveTab('suppliers')}
              sx={{
                flex: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'suppliers' ? 2 : 0,
                borderColor: 'primary.main',
                bgcolor: activeTab === 'suppliers' ? 'primary.light' : 'transparent',
                color: activeTab === 'suppliers' ? 'white' : 'text.secondary',
                '&:hover': {
                  bgcolor: activeTab === 'suppliers' ? 'primary.light' : 'action.hover',
                  color: activeTab === 'suppliers' ? 'black' : 'text.secondary'
                }
              }}
            >
              Supplier List
            </Button>

            <Button
              onClick={() => setActiveTab('customers')}
              sx={{
                flex: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'customers' ? 2 : 0,
                borderColor: 'primary.main',
                bgcolor: activeTab === 'customers' ? 'primary.light' : 'transparent',
                color: activeTab === 'customers' ? 'white' : 'text.secondary',
                '&:hover': {
                  bgcolor: activeTab === 'customers' ? 'primary.light' : 'action.hover',
                  color: activeTab === 'customers' ? 'black' : 'text.secondary'
                }
              }}
            >
              Customer List
            </Button>

            <Button
              onClick={() => setActiveTab('history')}
              sx={{
                flex: 1,
                borderRadius: 0,
                borderBottom: activeTab === 'history' ? 2 : 0,
                borderColor: 'primary.main',
                bgcolor: activeTab === 'history' ? 'primary.light' : 'transparent',
                color: activeTab === 'history' ? 'white' : 'text.secondary',
                '&:hover': {
                  bgcolor: activeTab === 'history' ? 'primary.light' : 'action.hover',
                  color: activeTab === 'history' ? 'black' : 'text.secondary'
                }
              }}
            >
              Transaction History
            </Button>
          </Box>
        </Box>

        <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
          <CustomTextField
            value={searchTerm || ''}
            onChange={e => handleSearch(e.target.value)}
            placeholder={
              activeTab === 'suppliers'
                ? 'Search Supplier'
                : activeTab === 'customers'
                  ? 'Search Customer'
                  : 'Search Transaction'
            }
            className='sm:is-auto'
          />

          <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <CustomTextField
              select
              value={
                activeTab === 'suppliers'
                  ? paginationData?.limit || 10
                  : activeTab === 'customers'
                    ? customerPaginationData?.limit || 10
                    : transactionsPaginationData?.limit || 10
              }
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
                    <th key={header.id} className='whitespace-nowrap border-r'>
                      {header.isPlaceholder ? null : (
                        <div>{flexRender(header.column.columnDef.header, header.getContext())}</div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {(
                activeTab === 'suppliers' ? loading : activeTab === 'customers' ? customerLoading : transactionsLoading
              ) ? (
                <tr>
                  <td
                    colSpan={
                      activeTab === 'suppliers'
                        ? supplierColumns.length
                        : activeTab === 'customers'
                          ? customerColumns.length
                          : transactionColumns.length
                    }
                    className='text-center py-8'
                  >
                    <div className='flex justify-center items-center'>
                      <CircularProgress />
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === 'suppliers' ? supplierColumns.length : transactionColumns.length}
                    className='text-center'
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
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

        <TablePaginationComponent
          table={table}
          paginationData={
            activeTab === 'suppliers'
              ? paginationData
              : activeTab === 'customers'
                ? customerPaginationData
                : transactionsPaginationData
          }
          onPageChange={handlePageChangeWrapper}
        />
      </Card>

      {/* Add Crate to Supplier Modal */}
      <Dialog
        open={showAddCrateModal && selectedSupplier !== null}
        onClose={() => {
          setShowAddCrateModal(false)
          setSelectedSupplier(null)
          setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                Add Crate
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {selectedSupplier?.basic_info?.name}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setShowAddCrateModal(false)
                setSelectedSupplier(null)
                setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
              }}
            >
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Current Debt Display */}
          {selectedSupplier && (
            <>
              <Box sx={{ bgcolor: '#ffebee', p: 2, borderRadius: 2, mb: 3, border: '1px solid #f44336' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <i className='tabler-alert-circle' style={{ color: '#d32f2f', marginTop: '2px' }} />
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600, color: '#d32f2f' }}>
                      Current Debt
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#d32f2f', display: 'block' }}>
                      Type 1: <strong>{selectedSupplier?.crate_info?.needToGiveCrate1}</strong> crates
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#d32f2f', display: 'block' }}>
                      Type 2: <strong>{selectedSupplier?.crate_info?.needToGiveCrate2}</strong> crates
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                    Type 1 Crates (৳{selectedSupplier?.crate_info?.crate1Price})
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={modalForm.type1Quantity}
                    onChange={e => setModalForm({ ...modalForm, type1Quantity: e.target.value })}
                    placeholder='Enter Type 1 quantity'
                  />
                  {calculation?.type1.message && (
                    <Typography variant='caption' color='primary.main' sx={{ mt: 0.5, display: 'block' }}>
                      {calculation?.type1.message}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                    Type 1 Price (৳)
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={modalForm.type1Price || selectedSupplier?.crate_info?.crate1Price}
                    onChange={e => setModalForm({ ...modalForm, type1Price: e.target.value })}
                    placeholder='Enter Type 1 price'
                  />
                </Box>

                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                    Type 2 Crates (৳{selectedSupplier?.crate_info?.crate2Price})
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={modalForm.type2Quantity}
                    onChange={e => setModalForm({ ...modalForm, type2Quantity: e.target.value })}
                    placeholder='Enter Type 2 quantity'
                  />
                  {calculation?.type2.message && (
                    <Typography variant='caption' color='secondary.main' sx={{ mt: 0.5, display: 'block' }}>
                      {calculation.type2.message}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                    Type 2 Price (৳)
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={modalForm.type2Price || selectedSupplier?.crate_info?.crate2Price}
                    onChange={e => setModalForm({ ...modalForm, type2Price: e.target.value })}
                    placeholder='Enter Type 2 price'
                  />
                </Box>

                {calculation?.hasInput && (
                  <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                      Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {(parseInt(modalForm.type1Quantity) || 0) > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant='caption'>Type 1:</Typography>
                          <Typography variant='caption' sx={{ fontWeight: 600 }}>
                            Debt -{calculation.type1.debtCleared}
                          </Typography>
                        </Box>
                      )}
                      {(parseInt(modalForm.type2Quantity) || 0) > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant='caption'>Type 2:</Typography>
                          <Typography variant='caption' sx={{ fontWeight: 600 }}>
                            Debt -{calculation.type2.debtCleared}
                          </Typography>
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderTop: 1,
                          borderColor: 'divider',
                          pt: 1,
                          mt: 1
                        }}
                      >
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          Total Debt Cleared:
                        </Typography>
                        <Typography variant='body2' sx={{ fontWeight: 700, color: 'error.main' }}>
                          -{calculation.type1.debtCleared + calculation.type2.debtCleared}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                    Notes (Optional)
                  </Typography>
                  <CustomTextField
                    fullWidth
                    multiline
                    rows={3}
                    value={modalForm.notes}
                    onChange={e => setModalForm({ ...modalForm, notes: e.target.value })}
                    placeholder='Add any notes...'
                  />
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              setShowAddCrateModal(false)
              setSelectedSupplier(null)
              setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleSendCratesToSupplier}
            disabled={!calculation?.hasInput || addSupplierCrateLoading}
            startIcon={addSupplierCrateLoading ? <CircularProgress size={16} /> : null}
          >
            {addSupplierCrateLoading ? 'Adding...' : 'Add Crates'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Total Crates Modal */}
      <Dialog
        open={showAddTotalModal}
        onClose={() => {
          setShowAddTotalModal(false)
          setModalForm({ type1Quantity: '', type2Quantity: '', notes: '', stockType: 'new' })
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                Add Crates to Collection
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Increase your total crate inventory
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setShowAddTotalModal(false)
                setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
              }}
            >
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                Date
              </Typography>
              <CustomTextField
                fullWidth
                type='date'
                value={modalForm.date || new Date().toISOString().split('T')[0]}
                onChange={e => setModalForm({ ...modalForm, date: e.target.value })}
              />
            </Box>

            <Box>
              <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                Stock Type
              </Typography>
              <CustomTextField
                select
                fullWidth
                value={modalForm.stockType}
                onChange={e => setModalForm({ ...modalForm, stockType: e.target.value })}
              >
                <MenuItem value='new'>New</MenuItem>
                <MenuItem value='re-stock'>Re-Stock</MenuItem>
              </CustomTextField>
            </Box>

            <Box>
              <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                Type 1 Crates
              </Typography>
              <CustomTextField
                fullWidth
                type='number'
                value={modalForm.type1Quantity}
                onChange={e => setModalForm({ ...modalForm, type1Quantity: e.target.value })}
                placeholder='Enter Type 1 quantity'
              />
            </Box>

            <Box>
              <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                Type 2 Crates
              </Typography>
              <CustomTextField
                fullWidth
                type='number'
                value={modalForm.type2Quantity}
                onChange={e => setModalForm({ ...modalForm, type2Quantity: e.target.value })}
                placeholder='Enter Type 2 quantity'
              />
            </Box>

            {((parseInt(modalForm.type1Quantity) || 0) > 0 || (parseInt(modalForm.type2Quantity) || 0) > 0) && (
              <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                  Preview
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {(parseInt(modalForm.type1Quantity) || 0) > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant='caption'>Type 1:</Typography>
                      <Typography variant='caption' sx={{ fontWeight: 600 }}>
                        {remainingCrates?.type1 || 0} →{' '}
                        <span style={{ color: '#2196f3' }}>
                          {(remainingCrates?.type1 || 0) + parseInt(modalForm.type1Quantity)}
                        </span>
                      </Typography>
                    </Box>
                  )}
                  {(parseInt(modalForm.type2Quantity) || 0) > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant='caption'>Type 2:</Typography>
                      <Typography variant='caption' sx={{ fontWeight: 600 }}>
                        {remainingCrates?.type2 || 0} →{' '}
                        <span style={{ color: '#9c27b0' }}>
                          {(remainingCrates?.type2 || 0) + parseInt(modalForm.type2Quantity)}
                        </span>
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: 1,
                      borderColor: 'divider',
                      pt: 1,
                      mt: 1
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      Total Bought:
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: 'success.main' }}>
                      {totalCratesBought || 0} →{' '}
                      {(totalCratesBought || 0) +
                        (parseInt(modalForm.type1Quantity) || 0) +
                        (parseInt(modalForm.type2Quantity) || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              setShowAddTotalModal(false)
              setModalForm({ type1Quantity: '', type2Quantity: '', notes: '', stockType: 'new' })
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleAddTotalCrates}
            disabled={
              ((parseInt(modalForm.type1Quantity) || 0) === 0 && (parseInt(modalForm.type2Quantity) || 0) === 0) ||
              addTotalCrateLoading
            }
            startIcon={addTotalCrateLoading ? <CircularProgress size={16} /> : null}
          >
            {addTotalCrateLoading ? 'Adding...' : 'Add Crates'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Supplier Crate Info Modal */}
      <Dialog
        open={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false)
          setSelectedSupplier(null)
          setUpdateForm({
            type1Quantity: '',
            type2Quantity: '',
            type1Price: '',
            type2Price: '',
            notes: ''
          })
        }}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                Update Crate Information
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {selectedSupplier?.isSupplier ? selectedSupplier.supplierData?.basic_info?.name : 'Transaction Update'}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setShowUpdateModal(false)
                setSelectedSupplier(null)
                setUpdateForm({
                  type1Quantity: '',
                  type2Quantity: '',
                  type1Price: '',
                  type2Price: '',
                  notes: ''
                })
              }}
            >
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Update Form */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Type 1 Crates
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  value={updateForm.type1Quantity}
                  onChange={e => setUpdateForm({ ...updateForm, type1Quantity: e.target.value })}
                  placeholder='Enter new quantity'
                />
              </Box>

              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Type 2 Crates
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  value={updateForm.type2Quantity}
                  onChange={e => setUpdateForm({ ...updateForm, type2Quantity: e.target.value })}
                  placeholder='Enter new quantity'
                />
              </Box>
            </Box>
            {selectedSupplier?.isSupplier && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                    Type 1 Price (৳)
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={updateForm.type1Price}
                    onChange={e => setUpdateForm({ ...updateForm, type1Price: e.target.value })}
                    placeholder='Enter Type 1 price'
                  />
                </Box>

                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                    Type 2 Price (৳)
                  </Typography>
                  <CustomTextField
                    fullWidth
                    type='number'
                    value={updateForm.type2Price}
                    onChange={e => setUpdateForm({ ...updateForm, type2Price: e.target.value })}
                    placeholder='Enter Type 2 price'
                  />
                </Box>
              </Box>
            )}

            <Box>
              <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                Notes (Optional)
              </Typography>
              <CustomTextField
                fullWidth
                multiline
                rows={3}
                value={updateForm.notes}
                onChange={e => setUpdateForm({ ...updateForm, notes: e.target.value })}
                placeholder='Add update notes...'
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              setShowUpdateModal(false)
              setSelectedSupplier(null)
              setUpdateForm({
                type1Quantity: '',
                type2Quantity: '',
                type1Price: '',
                type2Price: '',
                notes: ''
              })
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleUpdateCrates}
            disabled={updateLoading}
            startIcon={updateLoading ? <CircularProgress size={16} /> : null}
          >
            {updateLoading ? 'Updating...' : 'Update Information'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CrateManagementTable
