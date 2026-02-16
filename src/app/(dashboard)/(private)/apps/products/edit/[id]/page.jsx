import { getProductById } from '@/actions/productActions';
import EditProduct from '@/views/apps/products/edit/EditProduct';

export default async function UpdateProductPage(props) {
  const params = await props.params;
  const result = await getProductById(params.id)

  // console.log('result in edit page', result)

  if (!result.success) {
    console.error('Failed to fetch product:', result.error)
  }

  return <EditProduct id={params.id} productData={result.data} />
}
