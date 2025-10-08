// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import Swal from 'sweetalert2'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import OptionMenu from '@core/components/option-menu'
import AddReturnProductModal from './AddReturnProductModal'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Fuzzy Search
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// Debounced Input
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
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Helper
const columnHelper = createColumnHelper()

const ReturnPurchaseTable = ({ purchaseReturnData = [] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([...purchaseReturnData])
  const [globalFilter, setGlobalFilter] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState(null)

  // Hooks
  const { lang: locale } = useParams()

  // Delete with SweetAlert
  const handleDelete = id => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This product return will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        setData(prev => prev.filter(item => item.id !== id))
        Swal.fire('Deleted!', 'The return record has been deleted.', 'success')
      }
    })
  }

  // Save from modal
  const handleSave = formData => {
    if (editData) {
      // update existing
      setData(prev => prev.map(item => (item.id === editData.id ? { ...item, ...formData, id: editData.id } : item)))
    } else {
      // add new
      setData(prev => [...prev, { ...formData, id: Date.now() }])
    }

    setOpenModal(false)
    setEditData(null)
  }

  // Columns
  const columns = [
    { accessorKey: 'id', header: 'SL' },
    { accessorKey: 'productName', header: 'Product Name' },
    { accessorKey: 'sku', header: 'SKU' },
    { accessorKey: 'quantityPurchased', header: 'Qty Purchased' },
    { accessorKey: 'quantityReturned', header: 'Qty Returned' },
    { accessorKey: 'unitPrice', header: 'Unit Price' },
    { accessorKey: 'returnAmount', header: 'Return Amount' },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'returnDate', header: 'Date' },
    { accessorKey: 'supplier', header: 'Supplier' },

    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <OptionMenu
          iconButtonProps={{ size: 'medium' }}
          iconClassName='text-textSecondary'
          options={[
            {
              text: 'Edit',
              icon: 'tabler-edit',
              menuItemProps: {
                onClick: () => {
                  setEditData(row.original)
                  setOpenModal(true)
                },
                className: 'flex items-center'
              }
            },
            {
              text: 'Delete',
              icon: 'tabler-trash',
              menuItemProps: {
                onClick: () => handleDelete(row.original.id),
                className: 'flex items-center text-red-500'
              }
            }
          ]}
        />
      ),
      enableSorting: false
    }
  ]

  // Table Setup
  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      <CardContent className='flex justify-between max-sm:flex-col sm:items-center gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Return Product'
          className='sm:is-auto'
        />

        <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='is-[70px] max-sm:is-full'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>

          <Button
            variant='contained'
            onClick={() => {
              setEditData(null)
              setOpenModal(true)
            }}
          >
            Add Return
          </Button>
        </div>
      </CardContent>

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
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

          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          )}
        </table>
      </div>

      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />

      {/* Modal for Add/Edit Return */}
      <AddReturnProductModal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setEditData(null)
        }}
        onSave={handleSave}
        initialData={editData}
      />
    </Card>
  )
}

export default ReturnPurchaseTable
