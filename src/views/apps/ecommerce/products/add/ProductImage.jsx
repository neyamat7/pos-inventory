'use client'

// React Imports
import { useCallback, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

// Component Imports
import { useFormContext } from 'react-hook-form'

import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'

// RHF

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'

// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  },
  '& .buttons': {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2)
  }
}))

const ProductImage = ({ mode = 'create' }) => {
  const isEdit = mode === 'edit'

  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext()

  // Ensure the field is registered so it submits even if not touched.
  useEffect(() => {
    register('images')
  }, [register])

  // Add URL handler (lets you paste an image URL, useful in edit)
  const handleAddUrl = useCallback(() => {
    const url = prompt('Paste image URL')

    if (!url) return
    const next = [...(watch('images') || []), url]

    setValue('images', next, { shouldDirty: true, shouldValidate: true })
  }, [setValue, watch])

  // Read images array from form state
  const images = watch('images') || []

  // Dropzone: push new files into RHF state
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop: acceptedFiles => {
      const next = [...images, ...acceptedFiles]

      setValue('images', next, { shouldDirty: true, shouldValidate: true })
    }
  })

  // Generate preview URLs for File objects (revoke on unmount/change)
  const previews = useMemo(
    () =>
      images.map(item => {
        if (typeof item === 'string')
          return { key: item, url: item, isBlob: false, name: item.split('/').pop() || 'image' }

        // File/Blob
        const url = URL.createObjectURL(item)

        return {
          key: `${item.name}-${item.size}-${item.lastModified}`,
          url,
          isBlob: true,
          name: item.name,
          size: item.size
        }
      }),
    [images]
  )

  useEffect(() => {
    return () => {
      // revoke all blob urls on unmount
      previews.forEach(p => {
        if (p.isBlob) URL.revokeObjectURL(p.url)
      })
    }
  }, [previews])

  const handleRemoveAt = index => {
    const next = images.filter((_, i) => i !== index)

    setValue('images', next, { shouldDirty: true, shouldValidate: true })
  }

  const handleRemoveAll = () => {
    setValue('images', [], { shouldDirty: true, shouldValidate: true })
  }

  const fileList = previews.map((p, index) => {
    // compute size if available (only for File-based entries)
    const file = images[index]
    const size = typeof file === 'object' && file?.size ? file.size : undefined

    const sizeLabel =
      typeof size === 'number'
        ? Math.round(size / 100) / 10 > 1000
          ? `${(Math.round(size / 100) / 10000).toFixed(1)} mb`
          : `${(Math.round(size / 100) / 10).toFixed(1)} kb`
        : ''

    return (
      <ListItem key={p.key} className='pis-4 plb-3'>
        <div className='file-details flex items-center gap-3'>
          <div className='file-preview'>
            {p.url ? (
              <img
                width={38}
                height={38}
                alt={p.name}
                src={p.url}
                onLoad={() => {
                  if (p.isBlob) URL.revokeObjectURL(p.url)
                }}
              />
            ) : (
              <i className='tabler-file-description' />
            )}
          </div>
          <div>
            <Typography className='file-name font-medium' color='text.primary'>
              {p.name}
            </Typography>
            {sizeLabel ? (
              <Typography className='file-size' variant='body2'>
                {sizeLabel}
              </Typography>
            ) : null}
          </div>
        </div>
        <IconButton onClick={() => handleRemoveAt(index)}>
          <i className='tabler-x text-xl' />
        </IconButton>
      </ListItem>
    )
  })

  return (
    <Dropzone>
      <Card>
        <CardHeader
          title='Product Image'
          action={
            <Typography component={Link} color='primary.main' className='font-medium'>
              Add media from URL
            </Typography>
          }
          sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }}
        />
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            {/* Hidden input: browse fallback */}
            <input {...getInputProps()} />
            <div className='flex items-center flex-col gap-2 text-center'>
              <CustomAvatar variant='rounded' skin='light' color='secondary'>
                <i className='tabler-upload' />
              </CustomAvatar>
              <Typography variant='h4'>Drag and Drop Your Image Here.</Typography>
              <Typography color='text.disabled'>or</Typography>
              <Button variant='tonal' size='small'>
                Browse Image
              </Button>
            </div>
          </div>

          {/* Validation error (if you add rules in parent resolver) */}
          {errors?.images ? (
            <Typography color='error.main' variant='body2' sx={{ mt: 2 }}>
              {errors.images.message}
            </Typography>
          ) : null}

          {images.length ? (
            <>
              <List>{fileList}</List>
              <div className='buttons'>
                <Button color='error' variant='tonal' onClick={handleRemoveAll}>
                  Remove All
                </Button>
                {/* This button is UI only — actual upload should happen on form submit or in your onSubmit handler */}
                <Button variant='contained'>Upload Files</Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default ProductImage
