'use client'

import Grid from '@mui/material/Grid2'

import { getEcommerceData } from '@/app/server/actions'
import ProductFormProvider from '../add/ProductFormProvider'
import ProductAddHeader from '../add/ProductAddHeader'
import ProductInformation from '../add/ProductInformation'
import ProductImage from '../add/ProductImage'
import ProductVariants from '../add/ProductVariants'
import ProductPricing from '../add/ProductPricing'
import ProductOrganize from '../add/ProductOrganize'

export default function EditProduct({ id, productData }) {
  const product = productData.find(p => String(p.id) === String(id))

  console.log('product in edit page', product)

  if (!product) return <div>Product not found.</div>

  const handleUpdateProduct = values => {
    const idx = productData.findIndex(p => String(p.id) === String(id))

    if (idx !== -1) productData[idx] = { ...productData[idx], ...values }
    console.log('updated product', productData[idx])
  }

  return (
    <ProductFormProvider
      mode='edit'
      defaultValues={product}
      onSubmit={handleUpdateProduct}
      resetOnSubmit={false}
      key={id}
    >
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <ProductAddHeader mode='edit' />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <ProductInformation mode='edit' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ProductImage mode='edit' />
            </Grid>
            <Grid size={{ xs: 12 }}>{/* <ProductVariants /> */}</Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>{/* <ProductPricing /> */}</Grid>
            <Grid size={{ xs: 12 }}>{/* <ProductOrganize /> */}</Grid>
          </Grid>
        </Grid>
      </Grid>
    </ProductFormProvider>
  )
}
