'use client'

import { useEffect, useState } from 'react'

import CrateManagement from '@/views/apps/cratesManagement'
import { getSuppliers } from '@/actions/supplierAction'
import { getAllCrateTransactions, getCrateTotals } from '@/actions/crateActions'
import { getCustomers } from '@/actions/customerActions'

const CratesMangementPage = () => {
  // Refresh trigger for instant updates
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Separate pagination states for suppliers
  const [supplierCurrentPage, setSupplierCurrentPage] = useState(1)
  const [supplierPageSize, setSupplierPageSize] = useState(10)
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('')

  // Separate pagination states for transactions
  const [transactionCurrentPage, setTransactionCurrentPage] = useState(1)
  const [transactionPageSize, setTransactionPageSize] = useState(10)
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('')

  // Track active tab to know which pagination to use
  const [activeTab, setActiveTab] = useState('suppliers')

  // supplier states
  const [supplierData, setSupplierData] = useState([])
  const [paginationData, setPaginationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  //  Transaction states
  const [transactionsData, setTransactionsData] = useState([])
  const [transactionsPaginationData, setTransactionsPaginationData] = useState(null)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true)

  const [totalCrates, setTotalCrates] = useState({})
  const [totalCrateLoading, setTotalCrateLoading] = useState(false)

  // Separate pagination states for customers
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1)
  const [customerPageSize, setCustomerPageSize] = useState(10)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')

  // Customer states
  const [customerData, setCustomerData] = useState([])
  const [customerPaginationData, setCustomerPaginationData] = useState(null)
  const [isCustomerLoading, setIsCustomerLoading] = useState(true)

  // Fetch suppliers
  useEffect(() => {
    const fetchSupplierData = async () => {
      setIsLoading(true)

      try {
        const result = await getSuppliers(supplierCurrentPage, supplierPageSize, supplierSearchTerm)

        if (result.success) {
          setSupplierData(result.data.suppliers || [])
          setPaginationData({
            total: result.data.total,
            totalPages: result.data.totalPages,
            currentPage: result.data.page,
            limit: result.data.limit
          })
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupplierData()
  }, [supplierCurrentPage, supplierPageSize, supplierSearchTerm, refreshTrigger])

  // fetch total crates
  useEffect(() => {
    const fetchTotalCrates = async () => {
      setTotalCrateLoading(true)

      try {
        const result = await getCrateTotals()

        // console.log('result of crates', result)

        if (result.success) {
          setTotalCrates(result.data || {})
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      } finally {
        setTotalCrateLoading(false)
      }
    }

    fetchTotalCrates()
  }, [refreshTrigger])

  // Fetch transactions
  useEffect(() => {
    const fetchTransactionData = async () => {
      setIsTransactionsLoading(true)

      try {
        const result = await getAllCrateTransactions(transactionCurrentPage, transactionPageSize, transactionSearchTerm)

        if (result.success && result.data) {
          // Check which structure we have
          if (result.data.data) {
            setTransactionsData(result.data.data.transitions || [])
            setTransactionsPaginationData({
              total: result.data.data.total,
              totalPages: result.data.data.totalPages,
              currentPage: result.data.data.page,
              limit: result.data.data.limit
            })
          } else if (result.data.transitions) {
            setTransactionsData(result.data.transitions || [])
            setTransactionsPaginationData({
              total: result.data.total,
              totalPages: result.data.totalPages,
              currentPage: result.data.page,
              limit: result.data.limit
            })
          } else {
            console.error('Unknown response structure:', result)
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setIsTransactionsLoading(false)
      }
    }

    fetchTransactionData()
  }, [transactionCurrentPage, transactionPageSize, transactionSearchTerm, refreshTrigger])

  // Fetch customers
  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsCustomerLoading(true)

      try {
        const result = await getCustomers(customerCurrentPage, customerPageSize)

        if (result.success) {
          setCustomerData(result.data.customers || [])
          setCustomerPaginationData({
            total: result.data.total,
            totalPages: result.data.totalPages,
            currentPage: result.data.page,
            limit: result.data.limit
          })
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setIsCustomerLoading(false)
      }
    }

    fetchCustomerData()
  }, [customerCurrentPage, customerPageSize, customerSearchTerm, refreshTrigger])

  // Handle page change based on active tab
  const handlePageChange = newPage => {
    if (activeTab === 'suppliers') {
      setSupplierCurrentPage(newPage)
    } else if (activeTab === 'customers') {
      setCustomerCurrentPage(newPage)
    } else if (activeTab === 'history') {
      setTransactionCurrentPage(newPage)
    }
  }

  // Handle page size change based on active tab
  const handlePageSizeChange = newSize => {
    if (activeTab === 'suppliers') {
      setSupplierPageSize(newSize)
      setSupplierCurrentPage(1)
    } else if (activeTab === 'customers') {
      setCustomerPageSize(newSize)
      setCustomerCurrentPage(1)
    } else if (activeTab === 'history') {
      setTransactionPageSize(newSize)
      setTransactionCurrentPage(1)
    }
  }

  // Handle search based on active tab
  const handleSearch = searchValue => {
    if (activeTab === 'suppliers') {
      setSupplierSearchTerm(searchValue)
      setSupplierCurrentPage(1)
    } else if (activeTab === 'customers') {
      setCustomerSearchTerm(searchValue)
      setCustomerCurrentPage(1)
    } else if (activeTab === 'history') {
      setTransactionSearchTerm(searchValue)
      setTransactionCurrentPage(1)
    }
  }

  // Function to trigger refresh of all data
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <CrateManagement
      supplierData={supplierData}
      paginationData={paginationData}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearch={handleSearch}
      searchTerm={
        activeTab === 'suppliers'
          ? supplierSearchTerm
          : activeTab === 'customers'
            ? customerSearchTerm
            : transactionSearchTerm
      }
      loading={isLoading}
      transactionsData={transactionsData}
      transactionsPaginationData={transactionsPaginationData}
      transactionsLoading={isTransactionsLoading}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      totalCrates={totalCrates}
      totalCrateLoading={totalCrateLoading}
      customerData={customerData}
      customerPaginationData={customerPaginationData}
      customerLoading={isCustomerLoading}
      onRefresh={handleRefresh}
    />
  )
}

export default CratesMangementPage
