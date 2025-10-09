'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ProductAddHeader from '@views/apps/ecommerce/products/add/ProductAddHeader'
import ProductInformation from '@views/apps/ecommerce/products/add/ProductInformation'
import ProductImage from '@views/apps/ecommerce/products/add/ProductImage'
import ProductVariants from '@views/apps/ecommerce/products/add/ProductVariants'
import ProductInventory from '@views/apps/ecommerce/products/add/ProductInventory'
import ProductPricing from '@views/apps/ecommerce/products/add/ProductPricing'
import ProductOrganize from '@views/apps/ecommerce/products/add/ProductOrganize'
import ProductFormProvider from '@/views/apps/ecommerce/products/add/ProductFormProvider'
import { products } from '@/fake-db/apps/products'

const eCommerceProductsAdd = () => {
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

        {/* <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <ProductInformation mode='create' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ProductImage mode='create' />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ProductVariants mode='create' />
            </Grid>
          </Grid>
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <ProductPricing mode='create' />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ProductOrganize mode='create' />
            </Grid>
          </Grid>
        </Grid> */}
      </Grid>
    </ProductFormProvider>
  )
}

export default eCommerceProductsAdd
