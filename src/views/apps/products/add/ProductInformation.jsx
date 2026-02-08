'use client'

import { useEffect, useState } from 'react'

import Typography from '@mui/material/Typography'

import MenuItem from '@mui/material/MenuItem'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid2'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Button } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import { getAllCategories } from '@/actions/categoryActions'
import { uploadImage } from '@/actions/imageActions'
import '@/libs/styles/tiptapEditor.css'
import { showError } from '@/utils/toastUtils'

const ProductInformation = ({ mode = 'create', loading = false }) => {
  const { control, setValue, formMode } = useFormContext()
  const [imageUploading, setImageUploading] = useState(false)

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

        // console.log('result of category', result)

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

  // IMAGE UPLOAD HANDLER
  const handleImageUpload = async event => {
    const file = event.target.files[0]

    if (!file) return

    const localPreview = URL.createObjectURL(file)

    setImagePreview(localPreview)

    setImageUploading(true)

    try {
      const formData = new FormData()

      formData.append('image', file)

      // Call the upload image action
      const uploadResult = await uploadImage(formData)

      if (uploadResult.success) {
        // Extract image URL from response - adjust based on your API response structure
        const imagePath = uploadResult.data?.filepath || uploadResult.data.imageUrl

        // Set the image URL in the form field
        setValue('productImage', imagePath)
      } else {
        console.error('Image upload failed:', uploadResult.error)

        // Clear the preview on failure
        setImagePreview('')

        // You can add a toast notification here
        showError(`Image upload failed: ${uploadResult.error}`)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      
      // Clear the preview on error
      setImagePreview('')
      
      showError('Error uploading image. Please try again.')
    } finally {
      setImageUploading(false)
    }
  }

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

          {/* Product Name (Bangla) */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='productNameBn'
              control={control}
              render={({ field, fieldState }) => (
                <CustomTextField
                  fullWidth
                  label='Product Name (Bangla)'
                  placeholder='ফ্রেশ আম'
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

          {/* Is Boxed */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='isBoxed'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Is Boxed?'
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

          {/* Is Discountable */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='is_discountable'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Is Discountable?'
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

          {/* Sell by Piece */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='sell_by_piece'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Sell by Piece?'
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

          {/* PRODUCT IMAGE UPLOAD SECTION */}
          {!isEdit && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-4'>
                  <label className='text-sm font-medium text-textPrimary whitespace-nowrap'>
                    Product Image
                  </label>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    disabled={loading || imageUploading}
                    className='block w-full text-sm text-textSecondary
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-white
                      hover:file:bg-primaryDark disabled:opacity-50'
                  />
                </div>
                {imageUploading && (
                  <Typography variant='caption' color='text.secondary'>
                    Uploading image...
                  </Typography>
                )}
                {imagePreview && (
                  <div className='mt-2'>
                    <Typography variant='caption' color='text.secondary' className='mb-1 block'>
                      Preview:
                    </Typography>
                    <img
                      src={imagePreview}
                      alt='Product preview'
                      className='rounded-lg max-w-48 max-h-48 object-cover shadow-md border'
                      onError={e => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </Grid>
          )}

          {/* Description */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                    minRows={4}
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
