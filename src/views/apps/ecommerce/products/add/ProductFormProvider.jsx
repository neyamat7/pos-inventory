'use client'

import { useEffect, useMemo } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

const BASE_DEFAULTS = {
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
}

export default function ProductFormProvider({
  children,
  onSubmit,
  mode = 'create', // 'create' | 'edit'
  defaultValues = {}, // pass product when editing
  resetOnSubmit = false
}) {
  const mergedDefaults = useMemo(() => ({ ...BASE_DEFAULTS, ...defaultValues }), [defaultValues])

  const methods = useForm({
    defaultValues: mergedDefaults,
    mode: 'onSubmit'
  })

  const { handleSubmit, reset } = methods

  // Re-seed the form when defaultValues change (e.g., navigating between IDs)
  useEffect(() => {
    reset(mergedDefaults)
  }, [mergedDefaults, reset])

  const onValid = async (values, e) => {
    try {
      await onSubmit?.(values, e)
    } finally {
      if (resetOnSubmit) reset(mergedDefaults)
    }
  }

  const ctx = useMemo(() => ({ ...methods, formMode: mode }), [methods, mode])

  // const handleSubmit = async (values, e) => {
  //   try {
  //     await onSubmit?.(values, e)
  //   } finally {
  //     if (resetOnSubmit) methods.reset()
  //   }
  // }

  return (
    <FormProvider {...ctx}>
      <form onSubmit={handleSubmit(onValid)} noValidate>
        {children}
      </form>
    </FormProvider>
  )
}
