'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import OptionMenu from '@/@core/components/option-menu'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { showAlert } from '@/utils/showAlert'
import TableSkeleton from '@/components/TableSkeleton'

import EditAccounts from './EditAccounts'
import AddAccounts from './AddAccounts'

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

const AccountList = ({ accountsData = [], paginationData, onPageChange, onPageSizeChange, onSearch, loading = false }) => {
  const [editOpenRow, setEditOpenRow] = useState(null)
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(accountsData)
  const [searchValue, setSearchValue] = useState('')

  // Update data when accountsData prop changes
  useEffect(() => {
    setData(accountsData)
  }, [accountsData])

  // console.log('accounts data', accountsData)

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      {
        accessorKey: 'name',
        header: 'Account Name',
        cell: ({ row }) => <Typography>{row.original.name || '-'}</Typography>
      },
      {
        accessorKey: 'account_type',
        header: 'Type',
        cell: ({ row }) => <Typography>{row.original.account_type || '-'}</Typography>
      },
      {
        accessorKey: 'account_name',
        header: 'Account Holder Name',
        cell: ({ row }) => <Typography>{row.original.account_name || '-'}</Typography>
      },
      {
        accessorKey: 'account_number',
        header: 'Account Number',
        cell: ({ row }) => <Typography>{row.original.account_number || '-'}</Typography>
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        cell: ({ row }) => <Typography>৳{(row.original.balance || 0).toLocaleString()}</Typography>
      },
      {
        accessorKey: 'account_details',
        header: 'Details',
        cell: ({ row }) => <Typography>{row.original.account_details || '-'}</Typography>
      },
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
                icon: 'tabler-pencil',
                menuItemProps: {
                  onClick: () => {
                    setEditOpenRow(row.original)
                  },
                  className: 'flex items-center'
                }
              }
            ]}
          />
        ),
        enableSorting: false
      }
    ],
    []
  )

  const table = useReactTable({
    data: data,
    columns,
    state: {
      rowSelection
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // Server-side pagination configuration
    manualPagination: true,
    pageCount: paginationData?.totalPages || 1
  })

  const handlePageSizeChange = newSize => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    }
  }

  return (
    <>
      <Card>
        <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
          <DebouncedInput
            value={searchValue}
            onChange={value => {
              setSearchValue(value)
              if (onSearch) {
                onSearch(String(value))
              }
            }}
            placeholder='Search by account name or number...'
            className='max-sm:is-full'
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={paginationData?.limit || 10}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              className='is-full sm:is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
              <MenuItem value='100'>100</MenuItem>
            </CustomTextField>

            <Button
              variant='contained'
              color='primary'
              className='max-sm:is-full'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setCustomerUserOpen(!customerUserOpen)}
            >
              Add Account
            </Button>
          </div>
        </CardContent>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='whitespace-nowrap border-r text-base'>
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

            {loading ? (
              <tbody>
                <TableSkeleton columns={table.getVisibleFlatColumns().length} />
              </tbody>
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td className='whitespace-nowrap border-r' key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Server-side pagination */}
        <TablePaginationComponent table={table} paginationData={paginationData} onPageChange={onPageChange} />
      </Card>

      <AddAccounts
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        setData={setData}
        accountsData={data}
      />

      {editOpenRow && (
        <EditAccounts
          open={!!editOpenRow}
          handleClose={() => setEditOpenRow(null)}
          rowData={editOpenRow}
          setData={setData}
        />
      )}
    </>
  )
}

export default AccountList
