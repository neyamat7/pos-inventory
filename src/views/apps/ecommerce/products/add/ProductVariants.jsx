'use client'

// MUI Imports
import { useEffect } from 'react'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// Components Imports
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'

import CustomIconButton from '@core/components/mui/IconButton'
import CustomTextField from '@core/components/mui/TextField'

// RHF

const OPTION_CHOICES = ['Size', 'Color', 'Weight', 'Smell']

const ProductVariants = () => {
  const { control, setValue, getValues } = useFormContext()

  // Manage the variants array via RHF
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants'
  })

  // Ensure at least one row on first mount (mirrors your original "count = 1")
  useEffect(() => {
    const current = getValues('variants')

    if (!current || current.length === 0) {
      append({ option: 'Size', value: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddVariant = () => {
    append({ option: 'Size', value: '' })
  }

  const handleRemoveVariant = index => {
    remove(index)
  }

  return (
    <Card>
      <CardHeader title='Product Variants' />
      <CardContent>
        <Grid container spacing={6}>
          {fields.map((field, index) => (
            <Grid key={field.id} size={{ xs: 12 }} className='repeater-item'>
              <Grid container spacing={6}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name={`variants.${index}.option`}
                    control={control}
                    defaultValue={field.option ?? 'Size'}
                    render={({ field: ctrl }) => (
                      <CustomTextField select fullWidth label='Options' {...ctrl}>
                        {OPTION_CHOICES.map(opt => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 8 }} alignSelf='end'>
                  <div className='flex items-center gap-6'>
                    <Controller
                      name={`variants.${index}.value`}
                      control={control}
                      defaultValue={field.value ?? ''}
                      render={({ field: ctrl, fieldState }) => (
                        <CustomTextField
                          fullWidth
                          placeholder='Enter Variant Value'
                          {...ctrl}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />

                    <CustomIconButton
                      onClick={() => handleRemoveVariant(index)}
                      className='min-is-fit'
                      aria-label='Remove variant'
                    >
                      <i className='tabler-x' />
                    </CustomIconButton>
                  </div>
                </Grid>
              </Grid>
            </Grid>
          ))}

          <Grid size={{ xs: 12 }}>
            <Button variant='contained' onClick={handleAddVariant} startIcon={<i className='tabler-plus' />}>
              Add Another Option
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProductVariants
