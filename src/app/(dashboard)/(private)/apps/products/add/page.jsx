'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import { products } from '@/fake-db/apps/products'
import ProductFormProvider from '@/views/apps/products/add/ProductFormProvider'
import ProductAddHeader from '@/views/apps/products/add/ProductAddHeader'
import ProductInformation from '@/views/apps/products/add/ProductInformation'

const addProductPage = () => {
  const handleAddProduct = async values => {
    // const form = new FormData()

    // form.append('name', values.name ?? '')
    // form.append('sku', values.sku ?? '')

    // form.append('barcode', values.barcode ?? '')
    // form.append('description', values.description ?? '')

    // form.append('price', JSON.stringify(values.price ?? {}))
    // form.append('organize', JSON.stringify(values.organize ?? {}))

    // form.append('variants', JSON.stringify(values.variants ?? []))
    // ;(values.images ?? []).forEach(f => form.append('images', f))

    console.log(values)

    products.push(values)
    console.log('products', products)
  }

  return (
    <ProductFormProvider mode='create' onSubmit={handleAddProduct} resetOnSubmit>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <ProductAddHeader mode='create' />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ProductInformation mode='create' />
        </Grid>
      </Grid>
    </ProductFormProvider>
  )
}

export default addProductPage
