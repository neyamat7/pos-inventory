import { NextResponse } from 'next/server'

import { db } from '@/fake-db/apps/ecommerce'

export async function GET() {
  return NextResponse.json(db.supplierData)
}
