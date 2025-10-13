'use client'

import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid2'

import { getEcommerceData } from '@/app/server/actions'
import ProductFormProvider from '../add/ProductFormProvider'
import ProductAddHeader from '../add/ProductAddHeader'
import ProductInformation from '../add/ProductInformation'
import ProductImage from '../add/ProductImage'
import ProductVariants from '../add/ProductVariants'
import ProductPricing from '../add/ProductPricing'
import ProductOrganize from '../add/ProductOrganize'
import { showAlert } from '@/utils/showAlert'

export default function EditProduct({ id, productData }) {
  const product = productData.find(p => String(p.id) === String(id))
  const router = useRouter()

  console.log('product in edit page', product)

  if (!product) return <div>Product not found.</div>

  const handleUpdateProduct = values => {
    const idx = productData.findIndex(p => String(p.id) === String(id))

    console.log('value', values)

    if (idx !== -1) productData[idx] = { ...productData[idx], ...values }
    console.log('updated product', productData[idx])
    router.push('/apps/products/list')
    showAlert('Product data has been updated successfully.', 'success')
  }

  return (
    <ProductFormProvider
      mode={product ? 'edit' : 'create'}
      defaultValues={product || {}}
      onSubmit={handleUpdateProduct}
      resetOnSubmit={false}
      key={product.id || 'create'}
    >
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <ProductAddHeader mode='edit' />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ProductInformation mode='edit' />
        </Grid> 
         
      </Grid>
    </ProductFormProvider>
  )
}
