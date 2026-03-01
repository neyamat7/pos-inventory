'use client'

import { convertToBanglaNumber } from '@/utils/convert-to-bangla'

const SupplierSummaryReport = ({ summary, supplierName, dateRange }) => {
  if (!summary) return null

  const {
    totalCratesSold,
    totalBoxesSold,
    totalPiecesSold,
    totalKgSold,
    totalSoldAmount,
    supplierDue,
    productBreakdown
  } = summary

  const formatDate = date => {
    if (!date) return ''

    return new Date(date).toLocaleDateString('bn-BD')
  }

  const formatPrice = amount => {
    return convertToBanglaNumber((amount || 0).toLocaleString())
  }

  const formatQty = qty => {
    return convertToBanglaNumber(qty)
  }

  return (
    <div
      style={{
        fontFamily: "'Hind Siliguri', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
        fontSize: '11px',
        lineHeight: '1.4',
        color: '#000',
        backgroundColor: '#fff',
        width: '11cm',
        margin: '0 auto',
        padding: '0 0.3cm'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '12px', textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: '5px' }}>
        {/* <div style={{ fontSize: '14px', fontWeight: 'bold' }}>সাপ্লায়ার বিক্রয় সারাংশ রিপোর্ট</div> */}
        <div style={{ fontSize: '11px' }}>সাপ্লায়ার: {supplierName || 'N/A'}</div>
        {dateRange?.from && dateRange?.to && (
          <div style={{ fontSize: '10px' }}>
            সময়কাল: {formatDate(dateRange.from)} হতে {formatDate(dateRange.to)}
          </div>
        )}
      </div>

      {/* Grand Totals Summary Card Context */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', borderBottom: '0.5px solid #000', marginBottom: '5px', fontSize: '12px' }}>
          সার্বিক বিবরণ
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span>মোট ক্যারেট:</span>
            <span style={{ fontWeight: 'bold' }}>{formatQty(totalCratesSold || 0)}</span>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span>মোট বক্স:</span>
            <span style={{ fontWeight: 'bold' }}>{formatQty(totalBoxesSold || 0)}</span>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span>মোট পিস:</span>
            <span style={{ fontWeight: 'bold' }}>{formatQty(totalPiecesSold || 0)}</span>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <span>মোট কেজি:</span>
            <span style={{ fontWeight: 'bold' }}>{formatQty(totalKgSold || 0)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '0.5px dashed #000',
              paddingTop: '2px',
              gridColumn: 'span 2'
            }}
          >
            <span>সর্বমোট বিক্রি:</span>
            <span style={{ fontWeight: 'bold' }}>৳{formatPrice(totalSoldAmount)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: (supplierDue || 0) > 0 ? '#d32f2f' : '#000',
              gridColumn: 'span 2'
            }}
          >
            <span>সাপ্লায়ার পাওনা (বাকি):</span>
            <span style={{ fontWeight: 'bold' }}>৳{formatPrice(supplierDue)}</span>
          </div>
        </div>
      </div>

      {/* Product Breakdown Table */}
      {productBreakdown && productBreakdown.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', borderBottom: '0.5px solid #000', marginBottom: '5px', fontSize: '12px' }}>
            পণ্য ভিত্তিক বিবরণ
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '0.5px solid #000', padding: '4px', textAlign: 'left', fontSize: '10px' }}>
                  পণ্যের নাম
                </th>
                <th style={{ border: '0.5px solid #000', padding: '4px', textAlign: 'center', fontSize: '10px' }}>
                  পরিমাণ
                </th>
                <th style={{ border: '0.5px solid #000', padding: '4px', textAlign: 'right', fontSize: '10px' }}>
                  মূল্য (৳)
                </th>
              </tr>
            </thead>
            <tbody>
              {productBreakdown.map((item, index) => {
                const qtyParts = []

                if (item.totalCrates > 0) qtyParts.push(`${convertToBanglaNumber(item.totalCrates)} ক্যারেট`)
                if (item.totalBoxes > 0) qtyParts.push(`${convertToBanglaNumber(item.totalBoxes)} বক্স`)
                if (item.totalPieces > 0) qtyParts.push(`${convertToBanglaNumber(item.totalPieces)} পিস`)
                if (item.totalKg > 0) qtyParts.push(`${convertToBanglaNumber(item.totalKg)} কেজি`)

                return (
                  <tr key={index}>
                    <td style={{ border: '0.5px solid #000', padding: '4px' }}>
                      {item.productNameBn || item.productName}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '4px', textAlign: 'center', fontSize: '9px' }}>
                      {qtyParts.join(', ') || '০'}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '4px', textAlign: 'right' }}>
                      {formatPrice(item.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: '20px',
          paddingTop: '5px',
          borderTop: '0.5px dashed #000',
          fontSize: '9px',
          textAlign: 'center'
        }}
      >
        <div>রিপোর্ট তৈরির সময়: {new Date().toLocaleString('bn-BD')}</div>
        {/* <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
          <span style={{ borderTop: '0.5px solid #000', padding: '2px 10px' }}>প্রস্তুতকারক</span>
          <span style={{ borderTop: '0.5px solid #000', padding: '2px 10px' }}>সাপ্লায়ার স্বাক্ষর</span>
        </div> */}
      </div>
    </div>
  )
}

export default SupplierSummaryReport
