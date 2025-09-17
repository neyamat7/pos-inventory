'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// RHF
import { useFormContext, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const ProductPricing = () => {
  const { control } = useFormContext()

  return (
    <Card>
      <CardHeader title='Pricing' />
      <CardContent>
        <Controller
          name='price'
          control={control}
          rules={{
            required: 'Base price is required',
            min: { value: 0, message: 'Must be ≥ 0' }
          }}
          render={({ field, fieldState }) => (
            <CustomTextField
              fullWidth
              label='Base Price'
              placeholder='Enter Base Price'
              type='number'
              inputProps={{ step: '0.01', min: 0 }}
              className='mbe-6'
              {...field}
              value={field.value ?? ''}
              onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name='commision_rate'
          control={control}
          defaultValue=''
          rules={{
            min: { value: 0, message: 'Must be ≥ 0' },
            max: { value: 100, message: 'Must be ≤ 100' }
          }}
          render={({ field, fieldState }) => (
            <CustomTextField
              fullWidth
              label='Commission Rate(%)'
              placeholder='10'
              type='number'
              inputProps={{ step: '0.01', min: 0, max: 100 }}
              className='mbe-6'
              {...field}
              value={field.value ?? ''}
              onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        {/*
        // If you later want these, wire them the same way with Controller:
        <Controller
          name='pricing.chargeTax'
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel control={<Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />} label='Charge tax on this product' />
          )}
        />
        */}
      </CardContent>
    </Card>
  )
}

export default ProductPricing
