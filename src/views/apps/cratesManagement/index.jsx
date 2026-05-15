'use client'

import { useEffect, useMemo, useState } from 'react'

// MUI Imports

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import CrateTransactionPrintHandler from './CrateTransactionPrintHandler'
import { customerColumns } from './customerColumns'

// Component Imports
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import {
  addCrates,
  addCratesForSupplier,
  getGlobalCratePrices,
  updateCrates,
  updateGlobalCratePrices
} from '@/actions/crateActions'
import { getCustomers } from '@/actions/customerActions'
import TableSkeleton from '@/components/TableSkeleton'
import { showError, showSuccess } from '@/utils/toastUtils'
import tableStyles from '@core/styles/table.module.css'
import { Autocomplete, TextField } from '@mui/material'

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
  customerLoading,
  onRefresh,
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth
}) => {
  const [rowSelection, setRowSelection] = useState({})
  const [showAddCrateModal, setShowAddCrateModal] = useState(false)
  const [showAddTotalModal, setShowAddTotalModal] = useState(false)
  const [showGlobalSettingsModal, setShowGlobalSettingsModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  // Independent customer search for the re-stock modal (not tied to table pagination)
  const [restockCustomerOptions, setRestockCustomerOptions] = useState([])
  const [restockCustomerSearch, setRestockCustomerSearch] = useState('')
  const [restockCustomerLoading, setRestockCustomerLoading] = useState(false)

  useEffect(() => {
    const fetchRestockCustomers = async () => {
      setRestockCustomerLoading(true)
      try {
        const res = await getCustomers(1, 5000, restockCustomerSearch)
        if (res.success && res.data?.customers) {
          setRestockCustomerOptions(res.data.customers)
        }
      } catch (err) {
        console.error('Failed to fetch restock customers:', err)
      } finally {
        setRestockCustomerLoading(false)
      }
    }

    const debounce = setTimeout(fetchRestockCustomers, 400)
    return () => clearTimeout(debounce)
  }, [restockCustomerSearch])

  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false)
  const [transactionToReset, setTransactionToReset] = useState(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [addTotalCrateLoading, setAddTotalCrateLoading] = useState(false)
  const [addSupplierCrateLoading, setAddSupplierCrateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [globalSettingsLoading, setGlobalSettingsLoading] = useState(false)

  const [updateForm, setUpdateForm] = useState({
    type1Quantity: '',
    type2Quantity: '',
    type1Price: '',
    type2Price: '',
    notes: ''
  })

  const [globalCratePrices, setGlobalCratePrices] = useState({
    type1: 0,
    type2: 0
  })

  const [globalSettingsForm, setGlobalSettingsForm] = useState({
    type1: '',
    type2: ''
  })

  useEffect(() => {
    const fetchGlobalPrices = async () => {
      const res = await getGlobalCratePrices()
      if (res.success && res.data) {
        setGlobalCratePrices({
          type1: res.data.global_crate_type_1_price || 0,
          type2: res.data.global_crate_type_2_price || 0
        })
        setGlobalSettingsForm({
          type1: res.data.global_crate_type_1_price || 0,
          type2: res.data.global_crate_type_2_price || 0
        })
      }
    }
    fetchGlobalPrices()
  }, [])

  // Print state
  const [printTrigger, setPrintTrigger] = useState(false)
  const [transactionToPrint, setTransactionToPrint] = useState(null)

  // Modal form state
  const [modalForm, setModalForm] = useState({
    type1Quantity: '',
    type2Quantity: '',
    type1Price: '',
    type2Price: '',
    notes: '',
    date: '',
    stockType: 'new',
    customerId: ''
  })

  // console.log('transactionsData', transactionsData)

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
        // console.log('Crates sent to supplier successfully')
        showSuccess('Crates sent to supplier successfully!')

        // Trigger instant refresh of all data
        if (onRefresh) {
          onRefresh()
        }
      } else {
        console.error('Failed to send crates to supplier:', result.error)
        showError(result.error || 'Failed to send crates to supplier!')
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
        crate_type_1_price: parseInt(modalForm.type1Price) || 0,
        crate_type_2_price: parseInt(modalForm.type2Price) || 0,
        note: modalForm.notes || '',
        stockType: modalForm.stockType
      }

      // Add customerId only if stockType is 're-stock'
      if (modalForm.stockType === 're-stock' && modalForm.customerId) {
        crateData.customerId = modalForm.customerId
      }

      const result = await addCrates(crateData)

      if (result.success) {
        // console.log('Total crates added successfully:', result.data)
        showSuccess('Total crates added successfully!')

        // Trigger instant refresh of all data
        if (onRefresh) {
          onRefresh()
        }
      } else {
        console.error('Failed to add total crates:', result.error)
        showError(result.error)
      }
    } catch (error) {
      console.error('Error adding total crates:', error)
    } finally {
      setAddTotalCrateLoading(false)
      setModalForm({
        type1Quantity: '',
        type2Quantity: '',
        type1Price: '',
        type2Price: '',
        notes: '',
        date: '',
        stockType: 'new',
        customerId: ''
      })
      setShowAddTotalModal(false)
    }
  }

  const handleUpdateCrates = async () => {
    setUpdateLoading(true)

    try {
      let query = {}

      // Check if it's a supplier update or transaction update
      if (selectedSupplier?.isSupplier) {
        query.supplierId = selectedSupplier._id
      }

      if (selectedSupplier?.isTransaction) {
        query.inventoryCratesId = selectedSupplier.transactionId
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
        // console.log('Update successful:', result.data)
        showSuccess(result.message || 'Update successful!')

        // Trigger instant refresh of all data
        if (onRefresh) {
          onRefresh()
        }
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

  // Reset a crate transaction — sets all quantities to 0, reverting all calculations
  const handleResetCrate = async () => {
    if (!transactionToReset) return
    setResetLoading(true)

    try {
      const query = { inventoryCratesId: transactionToReset._id }
      const crateInfo = { crate1: 0, crate2: 0 }

      const result = await updateCrates(query, crateInfo)

      if (result.success) {
        showSuccess('Transaction reset successfully!')
        if (onRefresh) onRefresh()
      } else {
        showError(result.error || 'Failed to reset transaction!')
      }
    } catch (error) {
      console.error('Error resetting crate transaction:', error)
      showError('Error resetting transaction!')
    } finally {
      setResetLoading(false)
      setShowResetConfirmModal(false)
      setTransactionToReset(null)
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
        accessorKey: 'crate_info.crate1Price',
        header: 'Type 1 Price',
        cell: info => <div className=''>৳{info.getValue()}</div>
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
        accessorKey: 'customerId.basic_info.name',
        header: 'Customer',
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
          const actualStatus = info.getValue()

          // CANCELLED always takes priority regardless of stockType
          if (actualStatus === 'CANCELLED') {
            return <Chip label='Cancelled' color='error' variant='tonal' size='small' />
          }

          const statusValue = isReStock ? 'Re Stock' : actualStatus

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
        cell: info => (
          <div className='text-sm text-gray-600 max-w-xs whitespace-normal break-words'>{info.getValue() || '-'}</div>
        )
      },

      {
        id: 'action',
        header: 'Action',
        cell: info => {
          const isOut = info.row.original.status === 'OUT'
          const transaction = info.row.original
          const supplier = transaction.supplierId
          const customer = transaction.customerId

          // Show print button if transaction has customer or supplier
          const canPrint = !!(customer || supplier)

          return (
            <div className='flex gap-2'>
              {(!isOut || supplier) && transaction.status !== 'CANCELLED' && (
                <Button
                  variant='outlined'
                  onClick={() => {
                    setSelectedSupplier({
                      transactionId: transaction._id,
                      isTransaction: true,
                      _id: supplier ? supplier._id || supplier : null,
                      isSupplier: !!supplier,
                      supplierData: supplier
                    })
                    setShowUpdateModal(true)
                    setUpdateForm({
                      type1Quantity: transaction.crate_type_1_qty?.toString() || '',
                      type2Quantity: transaction.crate_type_2_qty?.toString() || '',
                      type1Price: transaction.crate_type_1_price?.toString() || '',
                      type2Price: transaction.crate_type_2_price?.toString() || '',
                      notes: transaction.note || ''
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

              {/* Reset button — only for non-cancelled, non-OUT transactions */}
              {transaction.status !== 'CANCELLED' && !isOut && (
                <Button
                  variant='outlined'
                  color='error'
                  onClick={() => {
                    setTransactionToReset(transaction)
                    setShowResetConfirmModal(true)
                  }}
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '6px 12px',
                    minWidth: 'auto',
                    textTransform: 'none',
                    borderRadius: '6px'
                  }}
                  startIcon={<i className='tabler-x' style={{ fontSize: '16px' }} />}
                >
                  Reset
                </Button>
              )}

              {canPrint && (
                <Button
                  variant='contained'
                  onClick={() => {
                    setTransactionToPrint(transaction)
                    setPrintTrigger(true)
                    setTimeout(() => setPrintTrigger(false), 1000)
                  }}
                  sx={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#45a049',
                      boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)'
                    },
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '6px 12px',
                    minWidth: 'auto',
                    textTransform: 'none',
                    borderRadius: '6px'
                  }}
                  startIcon={<i className='tabler-printer' style={{ fontSize: '16px' }} />}
                >
                  Print
                </Button>
              )}
            </div>
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
    // console.log('Page change requested:', {
    //   activeTab,
    //   newPage,
    //   supplierCurrentPage: paginationData?.currentPage,
    //   transactionCurrentPage: transactionsPaginationData?.currentPage
    // })
    onPageChange(newPage)
  }

  const handleUpdateGlobalSettings = async () => {
    setGlobalSettingsLoading(true)
    try {
      const res = await updateGlobalCratePrices({
        global_crate_type_1_price: Number(globalSettingsForm.type1),
        global_crate_type_2_price: Number(globalSettingsForm.type2)
      })

      if (res.success && res.data) {
        setGlobalCratePrices({
          type1: res.data.global_crate_type_1_price,
          type2: res.data.global_crate_type_2_price
        })
        showSuccess('Global crate prices updated successfully!')
        setShowGlobalSettingsModal(false)
      } else {
        showError(res.error || 'Failed to update global crate prices')
      }
    } catch (error) {
      console.error(error)
      showError('Failed to update global crate prices')
    } finally {
      setGlobalSettingsLoading(false)
    }
  }

  return (
    <>
      {/* Add Crate Button & Filters */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='contained'
            color='primary'
            startIcon={<i className='tabler-plus' />}
            onClick={() => setShowAddTotalModal(true)}
            sx={{ height: '40px' }}
          >
            Add Crates to Collection
          </Button>

          <Button
            variant='outlined'
            color='secondary'
            startIcon={<i className='tabler-settings' />}
            onClick={() => setShowGlobalSettingsModal(true)}
            sx={{ height: '40px' }}
          >
            Global Crate Prices
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <CustomTextField
            select
            label='Year'
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            sx={{ minWidth: 120 }}
            size='small'
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>All Years</MenuItem>
            {[2025, 2026, 2027, 2028, 2029, 2030].map(year => (
              <MenuItem key={year} value={year.toString()}>
                {year}
              </MenuItem>
            ))}
          </CustomTextField>

          <CustomTextField
            select
            label='Month'
            value={filterMonth}
            onChange={e => {
              const month = e.target.value
              setFilterMonth(month)
              if (month && !filterYear) {
                setFilterYear(new Date().getFullYear().toString())
              }
            }}
            sx={{ minWidth: 150 }}
            size='small'
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>All Months</MenuItem>
            {[
              { val: '1', label: 'January' },
              { val: '2', label: 'February' },
              { val: '3', label: 'March' },
              { val: '4', label: 'April' },
              { val: '5', label: 'May' },
              { val: '6', label: 'June' },
              { val: '7', label: 'July' },
              { val: '8', label: 'August' },
              { val: '9', label: 'September' },
              { val: '10', label: 'October' },
              { val: '11', label: 'November' },
              { val: '12', label: 'December' }
            ].map(m => (
              <MenuItem key={m.val} value={m.val}>
                {m.label}
              </MenuItem>
            ))}
          </CustomTextField>

          {(filterYear || filterMonth) && (
            <Button
              variant='text'
              color='error'
              onClick={() => {
                setFilterYear('')
                setFilterMonth('')
              }}
              size='small'
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 3
        }}
      >
        {/* Total Crates Bought Type 1 */}
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
              {filterYear || filterMonth
                ? totalCrates?.period_new_stock?.type_1_total || 0
                : totalCrates?.lifetime_totals?.type_1_total || 0}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600, mt: 1 }}>
              Cost: ৳
              {filterYear || filterMonth
                ? totalCrates?.period_new_stock?.type_1_total_cost || 0
                : totalCrates?.lifetime_totals?.type_1_total_cost || 0}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {filterYear || filterMonth ? 'Total for selected period' : 'Lifetime total'}
            </Typography>
          </CardContent>
        </Card>

        {/* Total Crates Bought Type 2 */}
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
              {filterYear || filterMonth
                ? totalCrates?.period_new_stock?.type_2_total || 0
                : totalCrates?.lifetime_totals?.type_2_total || 0}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600, mt: 1 }}>
              Cost: ৳
              {filterYear || filterMonth
                ? totalCrates?.period_new_stock?.type_2_total_cost || 0
                : totalCrates?.lifetime_totals?.type_2_total_cost || 0}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {filterYear || filterMonth ? 'Total for selected period' : 'Lifetime total'}
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
              {totalCrates?.lifetime_totals?.remaining_type_1 || 0}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Available in stock (Lifetime)
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
              {totalCrates?.lifetime_totals?.remaining_type_2 || 0}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Available in stock (Lifetime)
            </Typography>
          </CardContent>
        </Card>

        {/* Global Prices */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '', borderRadius: 2 }}>
                <i className='tabler-currency-taka' style={{ fontSize: '2rem', color: '#ff9800' }} />
              </Box>
              <IconButton size='small' onClick={() => setShowGlobalSettingsModal(true)}>
                <i className='tabler-edit' style={{ fontSize: '1rem' }} />
              </IconButton>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
              Global Prices (Sales)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='caption' sx={{ fontWeight: 600 }}>
                  Type 1:
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ৳{globalCratePrices.type1}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='caption' sx={{ fontWeight: 600 }}>
                  Type 2:
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  ৳{globalCratePrices.type2}
                </Typography>
              </Box>
            </Box>
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
                <TableSkeleton columns={table.getVisibleFlatColumns().length} />
              ) : table.getFilteredRowModel().rows.length === 0 ? (
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
                      <td className='border-r' key={cell.id}>
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
                    onWheel={e => e.target.blur()}
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
                    value={modalForm.type1Price === '' ? '' : modalForm.type1Price}
                    onChange={e => setModalForm({ ...modalForm, type1Price: e.target.value })}
                    onWheel={e => e.target.blur()}
                    placeholder={String(selectedSupplier?.crate_info?.crate1Price ?? 0)}
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
                    onWheel={e => e.target.blur()}
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
                    value={modalForm.type2Price === '' ? '' : modalForm.type2Price}
                    onChange={e => setModalForm({ ...modalForm, type2Price: e.target.value })}
                    onWheel={e => e.target.blur()}
                    placeholder={String(selectedSupplier?.crate_info?.crate2Price ?? 0)}
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
          setModalForm({ type1Quantity: '', type2Quantity: '', notes: '', stockType: 'new', customerId: '' })
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
                onChange={e => setModalForm({ ...modalForm, stockType: e.target.value, customerId: '' })}
              >
                <MenuItem value='new'>New</MenuItem>
                <MenuItem value='re-stock'>Re-Stock</MenuItem>
              </CustomTextField>
            </Box>

            {modalForm.stockType === 're-stock' && (
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Select Customer
                </Typography>
                <Autocomplete
                  fullWidth
                  options={restockCustomerOptions}
                  loading={restockCustomerLoading}
                  getOptionLabel={option =>
                    `${option.basic_info?.name || 'Unknown'}${option.contact_info?.phone ? ` — ${option.contact_info.phone}` : ''}`
                  }
                  value={restockCustomerOptions.find(c => c._id === modalForm.customerId) || null}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input') setRestockCustomerSearch(value)
                  }}
                  onChange={(_, selected) => {
                    const customerId = selected?._id || ''
                    setModalForm({
                      ...modalForm,
                      customerId,
                      type1Price: selected?.crate_info?.type_1_price?.toString() || '',
                      type2Price: selected?.crate_info?.type_2_price?.toString() || ''
                    })
                  }}
                  filterOptions={(options, { inputValue }) => {
                    const lower = inputValue.toLowerCase()
                    return options.filter(
                      o =>
                        o.basic_info?.name?.toLowerCase().includes(lower) ||
                        o.contact_info?.phone?.includes(inputValue)
                    )
                  }}
                  renderInput={params => (
                    <TextField {...params} placeholder='Search by name or phone...' size='small' />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option._id}>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {option.basic_info?.name || 'Unknown'}
                        </Typography>
                        {option.contact_info?.phone && (
                          <Typography variant='caption' color='text.secondary'>
                            {option.contact_info.phone}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  )}
                  noOptionsText='No customers found'
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                />
                {modalForm.customerId && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: 'primary.lighter',
                      borderRadius: 1,
                      border: '1px dashed',
                      borderColor: 'primary.main'
                    }}
                  >
                    {(() => {
                      const selectedCustomer = restockCustomerOptions.find(c => c._id === modalForm.customerId)
                      if (!selectedCustomer) return null
                      return (
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around' }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant='caption'
                              sx={{ fontWeight: 600, color: 'primary.main', display: 'block' }}
                            >
                              Type 1 Due
                            </Typography>
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                              {selectedCustomer.crate_info?.type_1 || 0} (৳
                              {selectedCustomer.crate_info?.type_1_price || 0})
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography
                              variant='caption'
                              sx={{ fontWeight: 600, color: 'secondary.main', display: 'block' }}
                            >
                              Type 2 Due
                            </Typography>
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                              {selectedCustomer.crate_info?.type_2 || 0} (৳
                              {selectedCustomer.crate_info?.type_2_price || 0})
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })()}
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Type 1 Crates
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  value={modalForm.type1Quantity}
                  onChange={e => setModalForm({ ...modalForm, type1Quantity: e.target.value })}
                  onWheel={e => e.target.blur()}
                  placeholder='Quantity'
                />
              </Box>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Type 1 Price (৳)
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  value={modalForm.type1Price}
                  onChange={e => setModalForm({ ...modalForm, type1Price: e.target.value })}
                  onWheel={e => e.target.blur()}
                  placeholder='Price'
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Type 2 Crates
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  value={modalForm.type2Quantity}
                  onChange={e => setModalForm({ ...modalForm, type2Quantity: e.target.value })}
                  onWheel={e => e.target.blur()}
                  placeholder='Quantity'
                />
              </Box>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Type 2 Price (৳)
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  value={modalForm.type2Price}
                  onChange={e => setModalForm({ ...modalForm, type2Price: e.target.value })}
                  onWheel={e => e.target.blur()}
                  placeholder='Price'
                />
              </Box>
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
                      Total Cost:
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: 'error.main' }}>
                      ৳
                      {(parseInt(modalForm.type1Quantity) || 0) * (parseInt(modalForm.type1Price) || 0) +
                        (parseInt(modalForm.type2Quantity) || 0) * (parseInt(modalForm.type2Price) || 0)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      pt: 1
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
              setModalForm({
                type1Quantity: '',
                type2Quantity: '',
                type1Price: '',
                type2Price: '',
                notes: '',
                stockType: 'new',
                customerId: ''
              })
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
              ((parseInt(modalForm.type1Quantity) || 0) > 0 && (parseInt(modalForm.type1Price) || 0) <= 0) ||
              ((parseInt(modalForm.type2Quantity) || 0) > 0 && (parseInt(modalForm.type2Price) || 0) <= 0) ||
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
                  onWheel={e => e.target.blur()}
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
                  onWheel={e => e.target.blur()}
                  placeholder='Enter new quantity'
                />
              </Box>
            </Box>
            {(selectedSupplier?.isSupplier || selectedSupplier?.isTransaction) && (
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
                    onWheel={e => e.target.blur()}
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
                    onWheel={e => e.target.blur()}
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

      {/* Global Settings Modal */}
      <Dialog
        open={showGlobalSettingsModal}
        onClose={() => setShowGlobalSettingsModal(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                Set Global Crate Prices
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                These prices will be applied for customer sales when a customer does not have their own specific crate
                prices.
              </Typography>
            </Box>
            <IconButton onClick={() => setShowGlobalSettingsModal(false)}>
              <i className='tabler-x' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Type 1 Price (৳)
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  value={globalSettingsForm.type1}
                  onChange={e => setGlobalSettingsForm({ ...globalSettingsForm, type1: e.target.value })}
                  onWheel={e => e.target.blur()}
                  placeholder='Enter Global Type 1 Price'
                />
              </Box>

              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Type 2 Price (৳)
                </Typography>
                <CustomTextField
                  fullWidth
                  type='number'
                  value={globalSettingsForm.type2}
                  onChange={e => setGlobalSettingsForm({ ...globalSettingsForm, type2: e.target.value })}
                  onWheel={e => e.target.blur()}
                  placeholder='Enter Global Type 2 Price'
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, mt: 2 }}>
          <Button variant='outlined' color='secondary' onClick={() => setShowGlobalSettingsModal(false)}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleUpdateGlobalSettings}
            disabled={globalSettingsLoading}
            startIcon={globalSettingsLoading ? <CircularProgress size={16} /> : null}
          >
            {globalSettingsLoading ? 'Saving...' : 'Save Global Prices'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Handler */}
      <CrateTransactionPrintHandler
        transactionData={transactionToPrint}
        triggerPrint={printTrigger}
        onPrintComplete={() => {
          console.log('Print completed successfully')
          setPrintTrigger(false)
        }}
        onPrintError={error => {
          console.error('Print failed:', error)
          setPrintTrigger(false)
          showError('Failed to print invoice')
        }}
      />

      {/* Reset Confirmation Modal */}
      <Dialog
        open={showResetConfirmModal}
        onClose={() => {
          if (!resetLoading) {
            setShowResetConfirmModal(false)
            setTransactionToReset(null)
          }
        }}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, bgcolor: 'error.lighter', borderRadius: 2 }}>
              <i className='tabler-alert-triangle' style={{ fontSize: '1.5rem', color: '#d32f2f' }} />
            </Box>
            <Typography variant='h6' fontWeight='bold'>Reset Crate Transaction</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1' sx={{ mb: 1 }}>
            Are you sure you want to reset this transaction?
          </Typography>
          {transactionToReset && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mt: 1 }}>
              <Typography variant='body2' color='text.secondary'>
                Type 1: <strong>{transactionToReset.crate_type_1_qty || 0}</strong> crates
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Type 2: <strong>{transactionToReset.crate_type_2_qty || 0}</strong> crates
              </Typography>
              {(transactionToReset.customerId?.basic_info?.name || transactionToReset.customerId?.name) && (
                <Typography variant='body2' color='text.secondary'>
                  Customer: <strong>
                    {transactionToReset.customerId?.basic_info?.name || transactionToReset.customerId?.name}
                  </strong>
                </Typography>
              )}
              {transactionToReset.note && (
                <Typography variant='body2' color='text.secondary'>
                  Note: {transactionToReset.note}
                </Typography>
              )}
            </Box>
          )}
          <Typography variant='body2' color='error.main' sx={{ mt: 2 }}>
            This will set all crate quantities to zero and reverse all related calculations (customer crate count, DailyCash, customer due). This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => {
              setShowResetConfirmModal(false)
              setTransactionToReset(null)
            }}
            disabled={resetLoading}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleResetCrate}
            disabled={resetLoading}
            startIcon={resetLoading ? <CircularProgress size={16} color='inherit' /> : <i className='tabler-x' />}
          >
            {resetLoading ? 'Resetting...' : 'Yes, Reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CrateManagementTable
