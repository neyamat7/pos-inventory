'use client'

import { useEffect } from 'react'

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

const CATEGORIES = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grains', label: 'Grains' }
]

const ALLOW_COMMISSION = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
]

const ProductInformation = (mode = 'create') => {
  const { control, setValue, getValues, formMode } = useFormContext()

  const isEdit = mode === 'edit'

  const preview = useWatch({ control, name: 'imagePreview' })

  const allowCommission = useWatch({ control, name: 'isCommissionable', defaultValue: 'no' })

  // console.log('preview', preview)

  useEffect(() => {
    const existingImage = getValues('images')

    if (existingImage && typeof existingImage === 'string') {
      // Only set preview if not already set (avoids overwrite when uploading new file)
      setValue('imagePreview', existingImage, { shouldDirty: false })
    }
  }, [isEdit, getValues, setValue])

  return (
    <Card>
      <CardHeader title='Product Information' />
      <CardContent>
        <Grid container spacing={6} className='mbe-6'>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='name'
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <CustomTextField
                  fullWidth
                  label='Product Name'
                  placeholder='Mango'
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='sku'
              control={control}
              render={({ field }) => (
                <CustomTextField fullWidth label='SKU' placeholder='FXSK123U' {...field} disabled={isEdit} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='price'
              control={control}
              rules={{
                required: 'Base price is required',
                min: { value: 0, message: 'Must be ≥ 0' },
                setValueAs: v => (v === '' ? '' : Number(v))
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
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  value={field.value ?? ''}
                  inputMode='decimal'
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='isCommissionable'
              control={control}
              defaultValue='no'
              rules={{ required: 'This field is required' }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Allow Commission?'
                  {...field}
                  value={field.value ? 'yes' : 'no'}
                >
                  {ALLOW_COMMISSION.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='commision_rate'
              control={control}
              defaultValue=''
              rules={{
                min: { value: 0, message: 'Must be ≥ 0' },
                max: { value: 100, message: 'Must be ≤ 100' },
                setValueAs: v => (v === '' ? '' : Number(v))
              }}
              render={({ field, fieldState }) => (
                <CustomTextField
                  fullWidth
                  label='Commission Rate(%)'
                  placeholder='10'
                  type='number'
                  inputProps={{ step: '0.01', min: 0, max: 100 }}
                  className='mbe-6 disabled:cursor-not-allowed disabled:opacity-70'
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  inputMode='decimal'
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={allowCommission === 'no'}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name='category'
              defaultValue='fruits'
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
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Controller
                name='isCrated'
                control={control}
                defaultValue='no'
                render={({ field }) => (
                  <CustomTextField select fullWidth label='Is Crated?' {...field} value={field.value ? 'yes' : 'no'}>
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' }
                    ].map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
          </Grid>

          {/* Image Upload & Description */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name='image'
              control={control}
              render={({ field }) => {
                const handleImageChange = e => {
                  const file = e.target.files?.[0]

                  if (file) {
                    const previewUrl = URL.createObjectURL(file)

                    field.onChange(file)
                    setValue('imagePreview', previewUrl)
                  }
                }

                return (
                  <Card variant='outlined' sx={{ textAlign: 'center', p: 3 }}>
                    <CardHeader title='Product Image' sx={{ textAlign: 'left', pb: 1 }} />
                    <CardContent>
                      <label htmlFor='image-upload'>
                        <input id='image-upload' type='file' accept='image/*' hidden onChange={handleImageChange} />
                        <div
                          style={{
                            border: '2px dashed var(--mui-palette-divider)',
                            borderRadius: '8px',
                            padding: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'border-color 0.3s ease'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--mui-palette-primary-main)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--mui-palette-divider)')}
                        >
                          {preview ? (
                            <img
                              src={preview}
                              alt='Preview'
                              style={{
                                width: '100%',
                                maxWidth: '100px',
                                maxHeight: '100px',
                                borderRadius: '8px',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <>
                              <i className='tabler-camera' style={{ fontSize: '2rem', color: 'gray' }} />
                              <span style={{ marginTop: '8px', color: 'gray' }}>Click to upload image</span>
                            </>
                          )}
                        </div>
                      </label>
                    </CardContent>
                  </Card>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <div className='flex flex-col gap-4'>
              <Controller
                name='description'
                control={control}
                rules={{ required: 'Description is required' }}
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
                  />
                )}
              />
              <Button variant='contained' type='submit' className='self-end'>
                {isEdit ? 'Save Changes' : 'Publish Product'}
              </Button>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProductInformation
