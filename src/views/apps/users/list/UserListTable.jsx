'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'

// import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

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

// Component Imports
import Swal from 'sweetalert2'

import TableFilters from './TableFilters'
import AddUserDrawer from './AddUserDrawer'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import ViewUserModal from './ViewUserModal'
import EditUserModal from './EditUserModal'

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Vars
const userRoleObj = {
  admin: { icon: 'tabler-crown', color: 'error' },
  author: { icon: 'tabler-device-desktop', color: 'warning' },
  editor: { icon: 'tabler-edit', color: 'info' },
  maintainer: { icon: 'tabler-chart-pie', color: 'success' },
  subscriber: { icon: 'tabler-user', color: 'primary' }
}

const userStatusObj = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper()

const UserListTable = ({ tableData }) => {
  // States
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[tableData])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [userModal, setUserModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState({})

  // Hooks
  // const { lang: locale } = useParams()

  const handleSaveUser = updated => {
    setData(prev => prev.map(u => (u.id === updated.id ? updated : u)))
    setEditModal(false)
  }

  const handleEditUser = user => {
    setUserModal(false)
    setEditModal(true)
    setSelectedUser(user)
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('name', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <img src={row.original.image} alt={row.original.name} className='w-10 h-10 rounded-full object-cover' />
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original.role}
          </Typography>
        )
      }),
      columnHelper.accessor('contact', {
        header: 'Contact',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.contact}</Typography>
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.email}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton
              onClick={() => {
                Swal.fire({
                  title: 'Are you sure?',
                  text: `You are about to delete "${row.original.name}". This action cannot be undone.`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Yes, delete it!'
                }).then(result => {
                  if (result.isConfirmed) {
                    setData(prev => prev?.filter(product => product.id !== row.original.id))
                    Swal.fire('Deleted!', `"${row.original.name}" has been removed successfully.`, 'success')
                  }
                })
              }}
            >
              <i className='tabler-trash text-textSecondary' />
            </IconButton>

            <IconButton
              onClick={() => {
                setUserModal(true)
                setSelectedUser(row.original)
              }}
            >
              <i className='tabler-eye text-textSecondary' />
            </IconButton>

            <IconButton onClick={() => handleEditUser(row.original)}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
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

  const getAvatar = params => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} size={34} />
    } else {
      return <CustomAvatar size={34}>{getInitials(fullName)}</CustomAvatar>
    }
  }

  return (
    <>
      <Card>
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters setData={setFilteredData} tableData={data} />
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>

          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search User'
              className='max-sm:is-full'
            />

            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddUserOpen(!addUserOpen)}
              className='max-sm:is-full'
            >
              Add New User
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='whitespace-nowrap border-r'>
                      {header.isPlaceholder ? null : (
                        <>
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
                        </>
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
                  .map(row => {
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
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>

      <AddUserDrawer
        open={addUserOpen}
        handleClose={() => setAddUserOpen(!addUserOpen)}
        userData={data}
        setData={setData}
      />

      <ViewUserModal
        open={userModal}
        user={selectedUser}
        onClose={() => setUserModal(false)}
        onEdit={() => handleEditUser(selectedUser)}
      />

      <EditUserModal open={editModal} user={selectedUser} onClose={() => setEditModal(false)} onSave={handleSaveUser} />
    </>
  )
}

export default UserListTable
