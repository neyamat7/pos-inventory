'use client'

import React, { useState, useMemo } from 'react'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table'
import { Package, Plus, X, TrendingUp, AlertCircle } from 'lucide-react'

// Dummy supplier data based on schema
const dummySuppliers = [
  {
    _id: '1',
    basic_info: {
      sl: 'SUP001',
      name: 'Rahman Traders',
      avatar: '',
      role: 'supplier'
    },
    contact_info: {
      email: 'rahman@traders.com',
      phone: '+880 1712-345678',
      location: 'Chittagong'
    },
    account_info: {
      accountNumber: 'ACC001',
      balance: 50000,
      due: 15000,
      cost: 35000
    },
    crate_info: {
      crate1: 120,
      crate1Price: 50,
      needToGiveCrate1: 15,
      crate2: 80,
      crate2Price: 75,
      needToGiveCrate2: 8
    }
  },
  {
    _id: '2',
    basic_info: {
      sl: 'SUP002',
      name: 'Karim Suppliers',
      avatar: '',
      role: 'supplier'
    },
    contact_info: {
      email: 'karim@suppliers.com',
      phone: '+880 1812-345678',
      location: 'Dhaka'
    },
    account_info: {
      accountNumber: 'ACC002',
      balance: 75000,
      due: 25000,
      cost: 50000
    },
    crate_info: {
      crate1: 200,
      crate1Price: 55,
      needToGiveCrate1: 0,
      crate2: 150,
      crate2Price: 80,
      needToGiveCrate2: 20
    }
  },
  {
    _id: '3',
    basic_info: {
      sl: 'SUP003',
      name: 'Ahmed Enterprises',
      avatar: '',
      role: 'supplier'
    },
    contact_info: {
      email: 'ahmed@enterprises.com',
      phone: '+880 1912-345678',
      location: 'Sylhet'
    },
    account_info: {
      accountNumber: 'ACC003',
      balance: 30000,
      due: 10000,
      cost: 20000
    },
    crate_info: {
      crate1: 90,
      crate1Price: 48,
      needToGiveCrate1: 5,
      crate2: 60,
      crate2Price: 72,
      needToGiveCrate2: 0
    }
  }
]

// Dummy transaction history
const dummyTransactions = [
  {
    _id: 'TXN001',
    date: '2025-11-05T10:30:00',
    supplierName: 'Rahman Traders',
    crateType: 'Type 1',
    quantityAdded: 20,
    debtCleared: 15,
    netAdded: 5,
    notes: 'Regular monthly supply'
  },
  {
    _id: 'TXN002',
    date: '2025-11-04T14:20:00',
    supplierName: 'Karim Suppliers',
    crateType: 'Type 2',
    quantityAdded: 30,
    debtCleared: 20,
    netAdded: 10,
    notes: 'Extra order for festival season'
  },
  {
    _id: 'TXN003',
    date: '2025-11-03T09:15:00',
    supplierName: 'Ahmed Enterprises',
    crateType: 'Type 1',
    quantityAdded: 10,
    debtCleared: 5,
    netAdded: 5,
    notes: ''
  }
]

const CrateManagement = () => {
  const [activeTab, setActiveTab] = useState('suppliers')
  const [suppliers, setSuppliers] = useState(dummySuppliers)
  const [transactions, setTransactions] = useState(dummyTransactions)
  const [showAddCrateModal, setShowAddCrateModal] = useState(false)
  const [showAddTotalModal, setShowAddTotalModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const [totalCrates, setTotalCrates] = useState({
    type1: 300,
    type2: 200
  })

  // Modal form state
  const [modalForm, setModalForm] = useState({
    type1Quantity: '',
    type2Quantity: '',
    notes: ''
  })

  // Calculate remaining crates (total debt across all suppliers)
  const remainingCrates = useMemo(() => {
    return suppliers.reduce((total, supplier) => {
      return total + supplier.crate_info.needToGiveCrate1 + supplier.crate_info.needToGiveCrate2
    }, 0)
  }, [suppliers])

  // Calculate real-time debt clearance
  const calculation = useMemo(() => {
    if (!selectedSupplier) return null

    const type1Qty = parseInt(modalForm.type1Quantity) || 0
    const type2Qty = parseInt(modalForm.type2Quantity) || 0
    const type1Debt = selectedSupplier.crate_info.needToGiveCrate1
    const type2Debt = selectedSupplier.crate_info.needToGiveCrate2

    const type1DebtCleared = Math.min(type1Qty, type1Debt)
    const type1NetAdded = Math.max(0, type1Qty - type1Debt)

    const type2DebtCleared = Math.min(type2Qty, type2Debt)
    const type2NetAdded = Math.max(0, type2Qty - type2Debt)

    return {
      type1: {
        debtCleared: type1DebtCleared,
        netAdded: type1NetAdded,
        message:
          type1Qty === 0
            ? ''
            : type1Qty <= type1Debt
              ? `Reduces debt by ${type1Qty} crate(s)`
              : `Debt of ${type1Debt} cleared! ${type1NetAdded} crate(s) added`
      },
      type2: {
        debtCleared: type2DebtCleared,
        netAdded: type2NetAdded,
        message:
          type2Qty === 0
            ? ''
            : type2Qty <= type2Debt
              ? `Reduces debt by ${type2Qty} crate(s)`
              : `Debt of ${type2Debt} cleared! ${type2NetAdded} crate(s) added`
      },
      hasInput: type1Qty > 0 || type2Qty > 0
    }
  }, [selectedSupplier, modalForm.type1Quantity, modalForm.type2Quantity])

  // Handle add crate from supplier
  const handleAddCrate = () => {
    if (!selectedSupplier) return

    const type1Qty = parseInt(modalForm.type1Quantity) || 0
    const type2Qty = parseInt(modalForm.type2Quantity) || 0

    if (type1Qty === 0 && type2Qty === 0) return

    const type1Debt = selectedSupplier.crate_info.needToGiveCrate1
    const type2Debt = selectedSupplier.crate_info.needToGiveCrate2

    const type1DebtCleared = Math.min(type1Qty, type1Debt)
    const type1NetAdded = Math.max(0, type1Qty - type1Debt)

    const type2DebtCleared = Math.min(type2Qty, type2Debt)
    const type2NetAdded = Math.max(0, type2Qty - type2Debt)

    // Update supplier
    setSuppliers(
      suppliers.map(s => {
        if (s._id === selectedSupplier._id) {
          return {
            ...s,
            crate_info: {
              ...s.crate_info,
              needToGiveCrate1: Math.max(0, type1Debt - type1Qty),
              needToGiveCrate2: Math.max(0, type2Debt - type2Qty)
            }
          }
        }

        return s
      })
    )

    // Update total crates by type
    setTotalCrates({
      type1: totalCrates.type1 + type1NetAdded,
      type2: totalCrates.type2 + type2NetAdded
    })

    // Add transactions for each type if quantity > 0
    const newTransactions = []

    if (type1Qty > 0) {
      newTransactions.push({
        _id: `TXN${Date.now()}_T1`,
        date: new Date().toISOString(),
        supplierName: selectedSupplier.basic_info.name,
        crateType: 'Type 1',
        quantityAdded: type1Qty,
        debtCleared: type1DebtCleared,
        netAdded: type1NetAdded,
        notes: modalForm.notes
      })
    }

    if (type2Qty > 0) {
      newTransactions.push({
        _id: `TXN${Date.now()}_T2`,
        date: new Date().toISOString(),
        supplierName: selectedSupplier.basic_info.name,
        crateType: 'Type 2',
        quantityAdded: type2Qty,
        debtCleared: type2DebtCleared,
        netAdded: type2NetAdded,
        notes: modalForm.notes
      })
    }

    setTransactions([...newTransactions, ...transactions])

    // Reset and close
    setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
    setShowAddCrateModal(false)
    setSelectedSupplier(null)
  }

  // Handle add to total crates
  const handleAddTotalCrates = () => {
    const type1Qty = parseInt(modalForm.type1Quantity) || 0
    const type2Qty = parseInt(modalForm.type2Quantity) || 0

    if (type1Qty === 0 && type2Qty === 0) return

    setTotalCrates({
      type1: totalCrates.type1 + type1Qty,
      type2: totalCrates.type2 + type2Qty
    })

    setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
    setShowAddTotalModal(false)
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
            <div className='text-xs text-gray-500'>{info.row.original.basic_info.sl}</div>
          </div>
        )
      },
      {
        accessorKey: 'crate_info.crate1',
        header: 'Crate Type 1',
        cell: info => (
          <div className='text-center'>
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
          <div className='text-center'>
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
        cell: info => <div className='text-center'>৳{info.getValue()}</div>
      },
      {
        accessorKey: 'crate_info.crate2Price',
        header: 'Type 2 Price',
        cell: info => <div className='text-center'>৳{info.getValue()}</div>
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <button
            onClick={() => {
              setSelectedSupplier(info.row.original)
              setShowAddCrateModal(true)
            }}
            className='px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1 mx-auto'
          >
            <Plus className='w-4 h-4' />
            Add Crate
          </button>
        )
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
        accessorKey: 'supplierName',
        header: 'Supplier',
        cell: info => <div className='font-medium'>{info.getValue()}</div>
      },
      {
        accessorKey: 'crateType',
        header: 'Crate Type',
        cell: info => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              info.getValue() === 'Type 1' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}
          >
            {info.getValue()}
          </span>
        )
      },
      {
        accessorKey: 'quantityAdded',
        header: 'Quantity',
        cell: info => <div className='text-center font-semibold'>{info.getValue()}</div>
      },
      {
        accessorKey: 'debtCleared',
        header: 'Debt Cleared',
        cell: info => (
          <div className='text-center'>
            <span className='text-red-600 font-medium'>{info.getValue()}</span>
          </div>
        )
      },
      {
        accessorKey: 'netAdded',
        header: 'Net Added',
        cell: info => (
          <div className='text-center'>
            <span className='text-green-600 font-medium'>+{info.getValue()}</span>
          </div>
        )
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: info => <div className='text-sm text-gray-600 max-w-xs truncate'>{info.getValue() || '-'}</div>
      }
    ],
    []
  )

  const supplierTable = useReactTable({
    data: suppliers,
    columns: supplierColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  const transactionTable = useReactTable({
    data: transactions,
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Crate Management</h1>
          <p className='text-gray-600'>Manage your crate inventory and supplier transactions</p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-6 mb-8'>
          {/* Total All Crates */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-green-100 rounded-lg'>
                <Package className='w-6 h-6 text-green-600' />
              </div>
              <TrendingUp className='w-5 h-5 text-green-500' />
            </div>
            <h3 className='text-gray-600 text-sm font-medium mb-1'>Total Crates</h3>
            <p className='text-3xl font-bold text-green-600'>{totalCrates.type1 + totalCrates.type2}</p>
            <p className='text-xs text-gray-500 mt-1'>Type 1 + Type 2</p>
          </div>

          {/* Total Type 1 Crates */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <Package className='w-6 h-6 text-blue-600' />
              </div>
            </div>
            <h3 className='text-gray-600 text-sm font-medium mb-1'>Type 1 Crates</h3>
            <p className='text-3xl font-bold text-blue-600'>{totalCrates.type1}</p>
          </div>

          {/* Total Type 2 Crates */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-purple-100 rounded-lg'>
                <Package className='w-6 h-6 text-purple-600' />
              </div>
            </div>
            <h3 className='text-gray-600 text-sm font-medium mb-1'>Type 2 Crates</h3>
            <p className='text-3xl font-bold text-purple-600'>{totalCrates.type2}</p>
          </div>

          {/* Remaining Crates */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-red-100 rounded-lg'>
                <AlertCircle className='w-6 h-6 text-red-600' />
              </div>
            </div>
            <h3 className='text-gray-600 text-sm font-medium mb-1'>Remaining Due</h3>
            <p className='text-3xl font-bold text-red-600'>{remainingCrates}</p>
            <p className='text-xs text-gray-500 mt-1'>Crates owed to suppliers</p>
          </div>

          {/* Add Crate Button */}
          <div className='bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 flex items-center justify-center'>
            <button
              onClick={() => setShowAddTotalModal(true)}
              className='w-full h-full flex flex-col items-center justify-center text-white hover:scale-105 transition-transform'
            >
              <Plus className='w-12 h-12 mb-2' />
              <span className='text-lg font-semibold'>Add Crates</span>
              <span className='text-sm opacity-90'>to collection</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'suppliers'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Supplier List
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Transaction History
            </button>
          </div>

          <div className='p-6'>
            {activeTab === 'suppliers' && (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    {supplierTable.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id} className='border-b border-gray-200'>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {supplierTable.getRowModel().rows.map(row => (
                      <tr key={row.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className='px-4 py-4'>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'history' && (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    {transactionTable.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id} className='border-b border-gray-200'>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {transactionTable.getRowModel().rows.map(row => (
                      <tr key={row.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className='px-4 py-4'>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Crate from Supplier Modal */}
      {showAddCrateModal && selectedSupplier && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6'>
            <div className='flex justify-between items-start mb-6'>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Add Crate</h2>
                <p className='text-sm text-gray-600 mt-1'>{selectedSupplier.basic_info.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowAddCrateModal(false)
                  setSelectedSupplier(null)
                  setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Current Debt Display */}
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
              <div className='flex items-start gap-2'>
                <AlertCircle className='w-5 h-5 text-red-600 mt-0.5' />
                <div>
                  <p className='text-sm font-semibold text-red-900'>Current Debt</p>
                  <p className='text-xs text-red-700 mt-1'>
                    Type 1: <span className='font-bold'>{selectedSupplier.crate_info.needToGiveCrate1}</span> crates
                  </p>
                  <p className='text-xs text-red-700'>
                    Type 2: <span className='font-bold'>{selectedSupplier.crate_info.needToGiveCrate2}</span> crates
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Type 1 Crates (৳{selectedSupplier.crate_info.crate1Price})
                </label>
                <input
                  type='number'
                  min='0'
                  value={modalForm.type1Quantity}
                  onChange={e => setModalForm({ ...modalForm, type1Quantity: e.target.value })}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Enter Type 1 quantity'
                />
                {calculation?.type1.message && (
                  <p className='text-xs text-blue-600 mt-1'>{calculation.type1.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Type 2 Crates (৳{selectedSupplier.crate_info.crate2Price})
                </label>
                <input
                  type='number'
                  min='0'
                  value={modalForm.type2Quantity}
                  onChange={e => setModalForm({ ...modalForm, type2Quantity: e.target.value })}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                  placeholder='Enter Type 2 quantity'
                />
                {calculation?.type2.message && (
                  <p className='text-xs text-purple-600 mt-1'>{calculation.type2.message}</p>
                )}
              </div>

              {/* Summary Calculation */}
              {calculation?.hasInput && (
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-4'>
                  <p className='text-sm font-semibold text-gray-900 mb-2'>Summary</p>
                  <div className='space-y-1 text-xs'>
                    {(parseInt(modalForm.type1Quantity) || 0) > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Type 1:</span>
                        <span className='font-medium'>
                          Debt -{calculation.type1.debtCleared}, Added +
                          <span className='text-green-600'>{calculation.type1.netAdded}</span>
                        </span>
                      </div>
                    )}
                    {(parseInt(modalForm.type2Quantity) || 0) > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Type 2:</span>
                        <span className='font-medium'>
                          Debt -{calculation.type2.debtCleared}, Added +
                          <span className='text-green-600'>{calculation.type2.netAdded}</span>
                        </span>
                      </div>
                    )}
                    <div className='border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold'>
                      <span className='text-gray-900'>Total Added:</span>
                      <span className='text-green-600'>+{calculation.type1.netAdded + calculation.type2.netAdded}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Notes (Optional)</label>
                <textarea
                  value={modalForm.notes}
                  onChange={e => setModalForm({ ...modalForm, notes: e.target.value })}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
                  rows='3'
                  placeholder='Add any notes...'
                />
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => {
                  setShowAddCrateModal(false)
                  setSelectedSupplier(null)
                  setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
                }}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddCrate}
                disabled={!calculation?.hasInput}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Total Crates Modal */}
      {showAddTotalModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl shadow-xl max-w-md w-full p-6'>
            <div className='flex justify-between items-start mb-6'>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Add Crates to Collection</h2>
                <p className='text-sm text-gray-600 mt-1'>Increase your total crate inventory</p>
              </div>
              <button
                onClick={() => {
                  setShowAddTotalModal(false)
                  setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Type 1 Crates</label>
                <input
                  type='number'
                  min='0'
                  value={modalForm.type1Quantity}
                  onChange={e => setModalForm({ ...modalForm, type1Quantity: e.target.value })}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Enter Type 1 quantity'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Type 2 Crates</label>
                <input
                  type='number'
                  min='0'
                  value={modalForm.type2Quantity}
                  onChange={e => setModalForm({ ...modalForm, type2Quantity: e.target.value })}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                  placeholder='Enter Type 2 quantity'
                />
              </div>

              {((parseInt(modalForm.type1Quantity) || 0) > 0 || (parseInt(modalForm.type2Quantity) || 0) > 0) && (
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-lg p-4'>
                  <p className='text-sm font-semibold text-gray-900 mb-2'>Preview</p>
                  <div className='space-y-2 text-sm'>
                    {(parseInt(modalForm.type1Quantity) || 0) > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Type 1:</span>
                        <span className='font-medium'>
                          {totalCrates.type1} →{' '}
                          <span className='text-blue-600'>{totalCrates.type1 + parseInt(modalForm.type1Quantity)}</span>
                        </span>
                      </div>
                    )}
                    {(parseInt(modalForm.type2Quantity) || 0) > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Type 2:</span>
                        <span className='font-medium'>
                          {totalCrates.type2} →{' '}
                          <span className='text-purple-600'>
                            {totalCrates.type2 + parseInt(modalForm.type2Quantity)}
                          </span>
                        </span>
                      </div>
                    )}
                    <div className='border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold'>
                      <span className='text-gray-900'>Total:</span>
                      <span className='text-green-600'>
                        {totalCrates.type1 + totalCrates.type2} →{' '}
                        {totalCrates.type1 +
                          totalCrates.type2 +
                          (parseInt(modalForm.type1Quantity) || 0) +
                          (parseInt(modalForm.type2Quantity) || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => {
                  setShowAddTotalModal(false)
                  setModalForm({ type1Quantity: '', type2Quantity: '', notes: '' })
                }}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddTotalCrates}
                disabled={
                  (parseInt(modalForm.type1Quantity) || 0) === 0 && (parseInt(modalForm.type2Quantity) || 0) === 0
                }
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
              >
                Add Crates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CrateManagement
