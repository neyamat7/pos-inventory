'use client'

import { useMemo } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

const BASE_DEFAULTS = {
  productName: '',
  productNameBn: '',
  basePrice: 0,
  productImage: '',
  description: '',
  categoryId: '',
  commissionRate: 0,
  allowCommission: false,
  isCrated: false,
  isBoxed: false,
  is_discountable: false,
  sell_by_piece: false
}

export default function ProductFormProvider({
  children,
  onSubmit,
  mode = 'create',
  defaultValues = {},
  resetOnSubmit = false
}) {
  const mergedDefaults = useMemo(() => {
    return {
      ...BASE_DEFAULTS,
      ...defaultValues
    }
  }, [defaultValues])

  const methods = useForm({
    defaultValues: mergedDefaults,
    mode: 'onSubmit'
  })

  const { handleSubmit, reset } = methods

  const onValid = async (values, e) => {
    try {
      await onSubmit?.(values, e)
    } finally {
      if (resetOnSubmit) reset(mergedDefaults)
    }
  }

  const ctx = useMemo(() => ({ ...methods, formMode: mode }), [methods, mode])

  return (
    <FormProvider {...ctx}>
      <form onSubmit={handleSubmit(onValid)} noValidate>
        {children}
      </form>
    </FormProvider>
  )
}
