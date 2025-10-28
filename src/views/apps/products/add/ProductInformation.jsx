'use client'

import { useEffect, useState } from 'react'

import MenuItem from '@mui/material/MenuItem'

import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import { useFormContext, Controller, useWatch } from 'react-hook-form'

import { Button } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import '@/libs/styles/tiptapEditor.css'
import { getAllCategories } from '@/actions/categoryActions'

const ProductInformation = ({ mode = 'create', loading = false }) => {
  const { control, setValue, formMode } = useFormContext()

  const isEdit = formMode === 'edit'

  const productImage = useWatch({ control, name: 'productImage' })
  const allowCommission = useWatch({ control, name: 'allowCommission' })

  const [imagePreview, setImagePreview] = useState('')
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true)

      try {
        const result = await getAllCategories({ page: 1, limit: 50 })

        console.log('result of category', result)

        if (result?.categories.length > 0) {
          setCategories(result.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Update preview when productImage changes
  useEffect(() => {
    if (productImage) {
      setImagePreview(productImage)
    }
  }, [productImage])

  return (
    <Card>
      <CardHeader title='Product Information' />
      <CardContent>
        <Grid container spacing={6} className='mbe-6'>
          {/* Product Name */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='productName'
              control={control}
              rules={{ required: 'Product name is required' }}
              render={({ field, fieldState }) => (
                <CustomTextField
                  fullWidth
                  label='Product Name'
                  placeholder='Fresh Mango'
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          {/* Base Price */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='basePrice'
              control={control}
              rules={{
                required: 'Base price is required',
                min: { value: 0, message: 'Must be ≥ 0' }
              }}
              render={({ field, fieldState }) => (
                <CustomTextField
                  fullWidth
                  label='Base Price'
                  placeholder='150'
                  type='number'
                  inputProps={{ step: '0.01', min: 0 }}
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  value={field.value ?? ''}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          {/* Allow Commission */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='allowCommission'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Allow Commission?'
                  {...field}
                  value={field.value ? 'yes' : 'no'}
                  onChange={e => field.onChange(e.target.value === 'yes')}
                  disabled={loading}
                >
                  <MenuItem value='yes'>Yes</MenuItem>
                  <MenuItem value='no'>No</MenuItem>
                </CustomTextField>
              )}
            />
          </Grid>

          {/* Commission Rate */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='commissionRate'
              control={control}
              rules={{
                min: { value: 0, message: 'Must be ≥ 0' },
                max: { value: 100, message: 'Must be ≤ 100' }
              }}
              render={({ field, fieldState }) => (
                <CustomTextField
                  fullWidth
                  label='Commission Rate (%)'
                  placeholder='10'
                  type='number'
                  inputProps={{ step: '0.01', min: 0, max: 100 }}
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  value={field.value ?? ''}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={loading || !allowCommission}
                />
              )}
            />
          </Grid>

          {/* Category */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='categoryId'
              control={control}
              render={({ field }) => (
                <CustomTextField select fullWidth label='Category' {...field} disabled={loading || categoriesLoading}>
                  {categoriesLoading ? (
                    <MenuItem value='' disabled>
                      Loading categories...
                    </MenuItem>
                  ) : categories.length > 0 ? (
                    categories.map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.categoryName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value='' disabled>
                      No categories available
                    </MenuItem>
                  )}
                </CustomTextField>
              )}
            />
          </Grid>

          {/* Is Crated */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='isCrated'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Is Crated?'
                  {...field}
                  value={field.value ? 'yes' : 'no'}
                  onChange={e => field.onChange(e.target.value === 'yes')}
                  disabled={loading}
                >
                  <MenuItem value='yes'>Yes</MenuItem>
                  <MenuItem value='no'>No</MenuItem>
                </CustomTextField>
              )}
            />
          </Grid>

          {/* Product Image URL */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant='outlined' sx={{ p: 3 }}>
              <CardHeader title='Product Image' sx={{ pb: 2 }} />
              <CardContent className='space-y-4'>
                <Controller
                  name='productImage'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      label='Product Image URL'
                      placeholder='https://example.com/image.jpg'
                      {...field}
                      disabled={loading}
                    />
                  )}
                />

                {/* Image Preview */}
                {imagePreview && (
                  <div className='flex justify-center'>
                    <img
                      src={imagePreview}
                      alt='Product preview'
                      className='rounded-lg max-w-48 max-h-48 object-cover shadow-md'
                      onError={e => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12, md: 6 }}>
            <div className='flex flex-col gap-4'>
              <Controller
                name='description'
                control={control}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    fullWidth
                    label='Description'
                    placeholder='Enter product description...'
                    multiline
                    minRows={6}
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={loading}
                  />
                )}
              />
              <Button variant='contained' type='submit' className='self-end' disabled={loading}>
                {loading ? 'Creating...' : isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProductInformation
