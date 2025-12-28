import { useRef, useState } from 'react'

import { useReactToPrint } from 'react-to-print'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Component Imports
import Swal from 'sweetalert2'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import SalesListInvoice from './SalesListInvoice'
import { showError, showSuccess } from '@/utils/toastUtils'
import TableSkeleton from '@/components/TableSkeleton'

const SalesListTable = ({
  salesData,
  paginationData,
  loading,
  onPageChange,
  onPageSizeChange,
  onSearch,
  searchTerm
}) => {
  const [rowSelection, setRowSelection] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)


  // console.log('selectedSale', JSON.stringify(selectedSale))

  const [printSale, setPrintSale] = useState(null)
  const componentRef = useRef(null)

  const handleSearch = value => {
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleViewDetails = sale => {
    setSelectedSale(sale)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedSale(null)
  }

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice_${printSale?._id || 'Sale'}_${new Date().toISOString().split('T')[0]}`,
    onBeforePrint: () => {
      // console.log('Preparing invoice for printing...')

      return Promise.resolve()
    },
    onAfterPrint: () => {
      // console.log('Print completed')
      showSuccess('Invoice printed successfully!')
      setPrintSale(null)
    },
    onPrintError: (errorLocation, error) => {
      console.error('Print error:', errorLocation, error)
      showError('Failed to print invoice')
      setPrintSale(null)
    },
    pageStyle: `
      @page {
        size: 12cm 25cm;
        margin-top: 8cm;
        margin-bottom: 3cm;
        margin-left: 0.5cm;
        margin-right: 0.5cm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
      }
    `
  })

  // Handle print button click
  const handlePrintInvoice = sale => {
    // console.log('Print invoice for sale:', sale._id)
    setPrintSale(sale)

    // Trigger print after state update
    setTimeout(() => {
      if (componentRef.current) {
        handlePrint()
      }
    }, 100)
  }

  const columns = [
    {
      accessorKey: 'sale_date',
      header: 'Date',
      cell: ({ row }) => row.original.sale_date || 'N/A'
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => row.original.customerId?.basic_info?.name || 'N/A'
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.customerId?.contact_info?.phone || 'N/A'
    },

    {
      accessorKey: 'lot_names',
      header: 'Lot Names',
      cell: ({ row }) => {
        const items = row.original.items
        const lotNames = []

        if (items) {
          // Convert items to array if it's not already
          const itemsArray = Array.isArray(items) ? items : [items]

          itemsArray.forEach(item => {
            if (item.selected_lots) {
              // Convert selected_lots to array if it's not already
              const lotsArray = Array.isArray(item.selected_lots) ? item.selected_lots : [item.selected_lots]

              lotsArray.forEach(lot => {
                if (lot.lotId?.lot_name) {
                  lotNames.push(lot.lotId.lot_name)
                }
              })
            }
          })
        }

        return (
          <div className='flex flex-col gap-1'>
            {lotNames.length > 0
              ? lotNames.map((name, idx) => (
                  <div key={idx} className='text-sm'>
                    {name}
                  </div>
                ))
              : 'N/A'}
          </div>
        )
      }
    },

    {
      accessorKey: 'payment_details.payable_amount',
      header: 'Total',
      cell: ({ row }) => `৳${(row.original.payment_details?.payable_amount || 0).toLocaleString()}`
    },

    {
      accessorKey: 'payment_details.received_amount',
      header: 'Paid',
      cell: ({ row }) => `৳${(row.original.payment_details?.received_amount || 0).toLocaleString()}`
    },

    {
      accessorKey: 'payment_details.due_amount',
      header: 'Due',
      cell: ({ row }) => `৳${(row.original.payment_details?.due_amount || 0).toLocaleString()}`
    },

    {
      accessorKey: 'payment_details.payment_type',
      header: 'Payment Type',
      cell: ({ row }) => {
        const receivedAmount = row.original.payment_details?.received_amount || 0
        const paymentType = row.original.payment_details?.payment_type

        return receivedAmount === 0 ? '' : paymentType || 'N/A'
      }
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <IconButton onClick={() => handleViewDetails(row.original)} color='primary'>
            <i className='tabler-eye text-textPrimary' />
          </IconButton>

          <IconButton onClick={() => handlePrintInvoice(row.original)} color='success' title='Print Invoice'>
            <i className='tabler-printer text-textPrimary' />
          </IconButton>
        </div>
      ),
      enableSorting: false
    }
  ]

  const table = useReactTable({
    data: salesData || [],
    columns,
    pageCount: paginationData?.totalPages || 0,
    state: {
      rowSelection,
      pagination: {
        pageIndex: (paginationData?.currentPage || 1) - 1,
        pageSize: paginationData?.limit || 10
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  })

  return (
    <>
      <Card>
        <h1 className='text-2xl xl:text-3xl font-semibold mt-3 ml-4'>Sales List</h1>
        <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
          <CustomTextField
            value={searchTerm || ''}
            onChange={e => handleSearch(e.target.value)}
            placeholder='Search Sale'
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
              {loading ? (
                <TableSkeleton columns={columns.length} />
              ) : salesData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center'>
                    No sales data available
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

        <TablePaginationComponent table={table} paginationData={paginationData} onPageChange={onPageChange} />
      </Card>

      {/* Sale Details Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
          <Box component='span' sx={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>
            Sale Details
          </Box>
          <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {selectedSale && (
            <Box>
              {/* Customer and Payment Info Side by Side */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
                {/* Customer Information Card */}
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <CardContent>
                    <Typography variant='h5' sx={{ mb: 2, fontWeight: 600, color: '#667eea' }}>
                      Customer Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Name
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {selectedSale.customerId?.basic_info?.name || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Phone
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {selectedSale.customerId?.contact_info?.phone || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Email
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {selectedSale.customerId?.contact_info?.email || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Location
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {selectedSale.customerId?.contact_info?.location || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Sale Date
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {selectedSale.sale_date || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Payment Details Card */}
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <CardContent>
                    <Typography variant='h5' sx={{ mb: 2, fontWeight: 600, color: '#5a4a78' }}>
                      Payment Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Total Amount
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: '#667eea' }}>
                          ৳{(selectedSale.payment_details?.payable_amount || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Paid Amount
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: '#4caf50' }}>
                          ৳{(selectedSale.payment_details?.received_amount || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Due Amount
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: '#f44336' }}>
                          ৳{(selectedSale.payment_details?.due_amount || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Payment Type
                        </Typography>
                        <Chip
                          label={selectedSale.payment_details?.payment_type || 'N/A'}
                          sx={{
                            mt: 0.5,
                            backgroundColor: '#667eea',
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            Crate Type 1 Total Amount
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                            ৳{(selectedSale.payment_details?.total_crate_type1_price || 0).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            Crate Type 2 Total Amount
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                            ৳{(selectedSale.payment_details?.total_crate_type2_price || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            VAT
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                            ৳{(selectedSale.payment_details?.vat || 0).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            Change
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                            ৳{(selectedSale.payment_details?.change_amount || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      {selectedSale.payment_details?.note && (
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            Note
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 500 }}>
                            {selectedSale.payment_details.note}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Products and Lots */}
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <CardContent>
                  <Typography variant='h5' sx={{ mb: 3, fontWeight: 600, color: '#667eea' }}>
                    Products & Lots
                  </Typography>

                  {selectedSale.items && selectedSale.items.length > 0 ? (
                    selectedSale.items.map((item, itemIndex) => (
                      <Box key={itemIndex} sx={{ mb: 3 }}>
                        {/* Product Header */}
                        <Box
                          sx={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            p: 2,
                            borderRadius: 2,
                            mb: 2
                          }}
                        >
                          <Typography variant='h6' sx={{ fontWeight: 600 }}>
                            {item.productId?.productName || 'Unknown Product'}
                          </Typography>
                          <Typography variant='body2' sx={{ opacity: 0.9 }}>
                            Category: {item.productId?.categoryId?.categoryName || 'N/A'} | Base Price: ৳
                            {item.productId?.basePrice || 0}
                          </Typography>
                        </Box>

                        {/* Lots Table */}
                        {item.selected_lots && item.selected_lots.length > 0 && (
                          <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Lot Name
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    KG
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Box Quantity
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Piece Quantity
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Unit Price
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Selling Price
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Discount
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Crates (T1/T2)
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Commission
                                  </th>
                                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                    Profit
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.selected_lots.map((lot, lotIndex) => (
                                  <tr key={lotIndex} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{lot.lotId?.lot_name || 'N/A'}</td>
                                    <td style={{ padding: '12px' }}>{lot.kg || 0}</td>
                                    <td style={{ padding: '12px' }}>{lot.box_quantity || 0}</td>
                                    <td style={{ padding: '12px' }}>{lot.piece_quantity || 0}</td>
                                    <td style={{ padding: '12px' }}>৳{(lot.unit_price || 0).toLocaleString()}</td>
                                    <td style={{ padding: '12px', fontWeight: 600, color: '#667eea' }}>
                                      ৳{(lot.selling_price || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>৳{(lot.discount_amount || 0).toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>
                                      {lot.crate_type1 || 0} / {lot.crate_type2 || 0}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                      ৳{(lot.customer_commission_amount || 0).toLocaleString()} (
                                      {lot.customer_commission_rate || 0}%)
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: 600, color: '#4caf50' }}>
                                      ৳{(lot.lot_profit || 0).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </Box>
                        )}

                        {itemIndex < selectedSale.items.length - 1 && <Divider sx={{ my: 3 }} />}
                      </Box>
                    ))
                  ) : (
                    <Typography>No items found</Typography>
                  )}

                  {/* Summary */}
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Total Custom Commission
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: '#667eea' }}>
                          ৳{(selectedSale.total_custom_commission || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Total Lots Commission
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: '#667eea' }}>
                          ৳{(selectedSale.total_lots_commission || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          Total Profit
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: '#4caf50' }}>
                          ৳{(selectedSale.total_profit || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {printSale && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={componentRef}>
            <SalesListInvoice saleData={printSale} />
          </div>
        </div>
      )}
    </>
  )
}

export default SalesListTable
