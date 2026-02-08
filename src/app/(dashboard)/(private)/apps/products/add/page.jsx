'use client'

import { useState } from 'react'

// MUI Imports
import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'

// Component Imports
import Swal from 'sweetalert2'

import ProductAddHeader from '@/views/apps/products/add/ProductAddHeader'
import ProductFormProvider from '@/views/apps/products/add/ProductFormProvider'
import ProductInformation from '@/views/apps/products/add/ProductInformation'

// Action Imports
import { createProduct } from '@/actions/productActions'
import { showSuccess } from '@/utils/toastUtils'

// Component Imports
const AddProductPage = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAddProduct = async values => {
    setLoading(true)

    try {
      // Transform form data to match API schema
      const productPayload = {
        productName: values.productName.trim(),
        productNameBn: values.productNameBn?.trim() || '',
        basePrice: Number(values.basePrice),
        productImage: values.productImage?.trim() || '',
        description: values.description?.trim() || '',
        categoryId: values.categoryId || null,
        commissionRate: Number(values.commissionRate),
        allowCommission: values.allowCommission,
        isCrated: values.isCrated,
        isBoxed: values.isBoxed,
        is_discountable: values.is_discountable,
        sell_by_piece: values.sell_by_piece
      }

      const result = await createProduct(productPayload)

      if (result.success) {
        showSuccess('Product created successfully!')

        router.push('/apps/products/list')

        // You can redirect or reset form here
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.error || 'Failed to create product',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred',
        icon: 'error',
        confirmButtonText: 'OK'
      })
      console.error('Create product error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProductFormProvider mode='create' onSubmit={handleAddProduct} resetOnSubmit>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <ProductAddHeader mode='create' loading={loading} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ProductInformation mode='create' loading={loading} />
        </Grid>
      </Grid>
    </ProductFormProvider>
  )
}

export default AddProductPage
