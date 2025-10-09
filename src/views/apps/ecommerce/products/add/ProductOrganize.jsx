'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'

// RHF
import { useFormContext, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const CATEGORIES = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'grains', label: 'Grains' },
  { value: 'snacks', label: 'Snacks' } // (fixed “Snakes” -> “Snacks”)
]

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'scheduled', label: 'Scheduled' }
]

const ProductOrganize = ({ mode = 'create' }) => {
  const isEdit = mode === 'edit'
  const { control } = useFormContext()

  return (
    <Card>
      <CardHeader title='Organize' />
      <CardContent>
        <div className='flex flex-col gap-6'>
          <div className='flex items-end gap-4'>
            <Controller
              name='category'
              control={control}
              render={({ field }) => (
                <CustomTextField select fullWidth label='Category' {...field} value={field.value ?? ''}>
                  {CATEGORIES.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            {/* <CustomIconButton variant='tonal' color='primary' className='min-is-fit'>
              <i className='tabler-plus' />
            </CustomIconButton> */}
          </div>

          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <CustomTextField select fullWidth label='Status' {...field} value={field.value ?? ''}>
                {STATUSES.map(s => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductOrganize
