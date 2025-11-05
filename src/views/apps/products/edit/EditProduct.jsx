'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

import Swal from 'sweetalert2'

import ProductFormProvider from '../add/ProductFormProvider'
import ProductAddHeader from '../add/ProductAddHeader'
import ProductInformation from '../add/ProductInformation'
import { getProductById, updateProduct } from '@/actions/productActions'

export default function EditProduct({ id, productData: initialProductData }) {
  const [product, setProduct] = useState(initialProductData)
  const [loading, setLoading] = useState(!initialProductData)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  // Fetch product if not provided via props
  useEffect(() => {
    const fetchProduct = async () => {
      if (!initialProductData) {
        setLoading(true)

        try {
          const result = await getProductById(id)

          if (result.success) {
            setProduct(result.data)
          } else {
            setError(result.error || 'Failed to fetch product')
          }
        } catch (err) {
          setError('An unexpected error occurred')
          console.error('Fetch product error:', err)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProduct()
  }, [id, initialProductData])

  const handleUpdateProduct = async values => {
    setUpdating(true)

    try {
      // Transform form data to match API schema
      const productPayload = {
        productName: values.productName.trim(),
        basePrice: Number(values.basePrice),
        productImage: values.productImage?.trim() || '',
        description: values.description?.trim() || '',
        categoryId: values.categoryId || null,
        commissionRate: Number(values.commissionRate),
        allowCommission: values.allowCommission,
        isCrated: values.isCrated,
        isBoxed: values.isBoxed
      }

      const result = await updateProduct(id, productPayload)

      if (result.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Product updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          router.push('/apps/products/list')
        })
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.error || 'Failed to update product',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      console.error('Update product error:', err)
    } finally {
      setUpdating(false)
    }
  }

  // Transform product data for form default values
  const getFormDefaultValues = () => {
    if (!product) return {}

    return {
      productName: product.productName || '',
      basePrice: product.basePrice || 0,
      productImage: product.productImage || '',
      description: product.description || '',
      categoryId: product.categoryId?._id || product.categoryId || '',
      commissionRate: product.commissionRate || 0,
      allowCommission: product.allowCommission || false,
      isCrated: product.isCrated || false,
      isBoxed: product.isBoxed || false
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!product) {
    return (
      <Alert severity='warning' sx={{ m: 2 }}>
        Product not found
      </Alert>
    )
  }

  return (
    <ProductFormProvider
      mode='edit'
      defaultValues={getFormDefaultValues()}
      onSubmit={handleUpdateProduct}
      resetOnSubmit={false}
    >
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <ProductAddHeader mode='edit' loading={updating} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ProductInformation mode='edit' loading={updating} />
        </Grid>
      </Grid>
    </ProductFormProvider>
  )
}
