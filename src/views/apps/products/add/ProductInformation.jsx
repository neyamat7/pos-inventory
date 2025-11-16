'use client'

import { useEffect, useState } from 'react'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

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
import { uploadImage } from '@/actions/imageActions'
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

        // You can add a toast notification here
        showError(`Image upload failed: ${uploadResult.error}`)
      }
    } catch (error) {
      console.error('Image upload error:', error)
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

          {/* PRODUCT IMAGE UPLOAD SECTION */}

          {!isEdit && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant='outlined'>
                <CardHeader title='Product Image' sx={{ pb: 2 }} />
                <CardContent className='space-y-4'>
                  {/*  FILE UPLOAD INPUT   */}
                  <div className='flex flex-col gap-2'>
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
                    {/* Uploading status indicator */}
                    {imageUploading && (
                      <Typography variant='body2' color='text.secondary'>
                        Uploading image...
                      </Typography>
                    )}
                  </div>

                  {/* ========== IMAGE PREVIEW ========== */}
                  {imagePreview && (
                    <div className='flex flex-col items-center gap-2'>
                      <Typography variant='body2' color='text.secondary'>
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
                </CardContent>
              </Card>
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
