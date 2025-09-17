'use client'

import { FormProvider, useForm } from 'react-hook-form'

export default function ProductFormProvider({ children, onSubmit }) {
  const methods = useForm({
    defaultValues: {
      id: '',
      sku: '',
      barcode: '',
      name: '',
      description: '',
      variants: [],
      price: 0,
      commision_rate: 0,
      category: '',
      images: [],
      status: ''
    },
    mode: 'onSubmit'
  })

  const handleSubmit = (values, e) => onSubmit?.(values, methods, e)

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>{children}</form>
    </FormProvider>
  )
}
