// customerColumns.js
import { useRouter } from 'next/navigation'

import Button from '@mui/material/Button'

// Customer table columns configuration
export const customerColumns = [
  {
    accessorKey: 'basic_info.name',
    header: 'Customer Name',
    cell: info => (
      <div>
        <div className='font-medium text-gray-900'>{info.getValue()}</div>
        <div className='text-xs text-gray-500'>{info.row.original.basic_info.role}</div>
      </div>
    )
  },
  {
    accessorKey: 'crate_info.type_1',
    header: 'Crate Type 1',
    cell: info => (
      <div className='text-center'>
        <div className='font-semibold text-blue-600'>{info.getValue() || 0}</div>
      </div>
    )
  },
  {
    accessorKey: 'crate_info.type_1_price',
    header: 'Type 1 Price',
    cell: info => <div className='text-center font-semibold'>৳{info.getValue() || 0}</div>
  },
  {
    accessorKey: 'crate_info.type_2',
    header: 'Crate Type 2',
    cell: info => (
      <div className='text-center'>
        <div className='font-semibold text-purple-600'>{info.getValue() || 0}</div>
      </div>
    )
  },
  {
    accessorKey: 'crate_info.type_2_price',
    header: 'Type 2 Price',
    cell: info => <div className='text-center font-semibold'>৳{info.getValue() || 0}</div>
  },
  {
    id: 'action',
    header: 'Action',
    cell: info => {
      // Using a component function to handle the router
      const ActionButton = () => {
        const router = useRouter()

        const handleCrateTransaction = () => {
          // Navigate to customer details page with customer ID
          router.push(`/apps/customers/details/${info.row.original._id}`)
        }

        return (
          <Button
            variant='contained'
            onClick={handleCrateTransaction}
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
            startIcon={<i className='tabler-external-link' style={{ fontSize: '16px' }} />}
          >
            Crate Transaction
          </Button>
        )
      }

      return <ActionButton />
    },
    enableSorting: false
  }
]
