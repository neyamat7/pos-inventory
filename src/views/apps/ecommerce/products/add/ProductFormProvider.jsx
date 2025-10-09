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
  image: '',
  status: ''
}

const normalizeImages = val => {
  if (!val) return []

  if (Array.isArray(val)) {
    return val
      .map(v => {
        if (typeof v === 'string') return v
        if (v && typeof v === 'object') return v.url || v.src || v.href || ''

        return ''
      })
      .filter(Boolean)
  }

  if (typeof val === 'string') return [val]
  if (typeof val === 'object') return [val.url || val.src || val.href].filter(Boolean)

  return []
}

export default function ProductFormProvider({
  children,
  onSubmit,
  mode = 'create',
  defaultValues = {},
  resetOnSubmit = false
}) {
  const mergedDefaults = useMemo(() => {
    const img = defaultValues.images ?? defaultValues.image ?? defaultValues.image_url ?? defaultValues.media

    return {
      ...BASE_DEFAULTS,
      ...defaultValues,
      image: normalizeImages(img)
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
