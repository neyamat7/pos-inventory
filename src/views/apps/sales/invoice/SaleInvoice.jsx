'use client'

import { convertToBanglaNumber } from '@/utils/convert-to-bangla'

const SaleInvoice = ({ saleData, customerData }) => {
  // Group lots by product and calculate product totals
  const allProductSummary =
    saleData?.items?.map(item => {
      const totalKg = item.selected_lots.reduce((sum, lot) => sum + (lot.kg || 0), 0)
      const totalDiscountKg = item.selected_lots.reduce((sum, lot) => sum + (lot.discount_Kg || 0), 0)
      const netKg = totalKg - totalDiscountKg

      const totalBox = item.selected_lots.reduce((sum, lot) => sum + (lot.box_quantity || 0), 0)
      const totalPiece = item.selected_lots.reduce((sum, lot) => sum + (lot.piece_quantity || 0), 0)
      const totalDiscountAmount = item.selected_lots.reduce((sum, lot) => sum + (lot.discount_amount || 0), 0)
      const totalCrate1 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type1 || 0), 0)
      const totalCrate2 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type2 || 0), 0)

      const commissionAmount = item.selected_lots.reduce((sum, lot) => sum + (lot.customer_commission_amount || 0), 0)

      // Base money = (netKg * unit_price) OR (qty * unit_price)
      const firstLot = item.selected_lots[0] || {}
      const unitPrice = firstLot.unit_price || 0

      // Categorize
      const isCrated = firstLot.isCrated || false
      const isBoxed = firstLot.isBoxed || false
      const isPieced = firstLot.isPieced || false
      const isBagged = firstLot.isBagged || false

      let baseTotal = 0

      if (isBoxed) {
        baseTotal = totalBox * unitPrice
      } else if (isPieced) {
        baseTotal = totalPiece * unitPrice
      } else {
        baseTotal = netKg * unitPrice
      }

      // Note: for non-crated products, discount is usually subtracted from baseTotal
      // For crate products, discount is already in netKg
      const finalProductBase = isCrated ? baseTotal : Math.max(0, baseTotal - totalDiscountAmount)

      return {
        product_name:
          item.productId?.productNameBn ||
          item.product_name_bn ||
          item.productId?.productName ||
          item.product_name ||
          'N/A',
        isCrated,
        isBoxed,
        isPieced,
        isBagged,
        totalKg,
        totalDiscountKg,
        netKg,
        totalBox,
        totalPiece,
        unit_price: unitPrice,
        customer_commission_rate: firstLot.customer_commission_rate || 0,
        commissionAmount,
        totalDiscountAmount,
        totalCrate1,
        totalCrate2,
        finalProductBase // This is total before crates and commission addition
      }
    }) || []

  // Split into two summaries
  const cratedSummary = allProductSummary.filter(p => p.isCrated)
  const otherSummary = allProductSummary.filter(p => !p.isCrated)

  const paymentDetails = saleData?.payment_details || {}

  // Calculate Crate unit prices from total (to attribute to individual items if needed)
  const overallCrate1Count = allProductSummary.reduce((sum, p) => sum + p.totalCrate1, 0)
  const overallCrate2Count = allProductSummary.reduce((sum, p) => sum + p.totalCrate2, 0)

  const crate1Rate = overallCrate1Count > 0 ? (paymentDetails.total_crate_type1_price || 0) / overallCrate1Count : 0
  const crate2Rate = overallCrate2Count > 0 ? (paymentDetails.total_crate_type2_price || 0) / overallCrate2Count : 0

  // Calculation for Payment Summary
  const previousDue = paymentDetails.previous_due ?? (customerData?.account_info?.due || 0)
  const previousBalance = paymentDetails.previous_balance ?? (customerData?.account_info?.balance || 0)
  const currentBill = paymentDetails.payable_amount || 0
  const totalDue = previousDue + currentBill
  const netPayable = Math.max(0, totalDue - previousBalance)

  const totalProductPrice = allProductSummary.reduce(
    (sum, item) => sum + item.finalProductBase + item.commissionAmount,
    0
  )
  const totalCratePrice = (paymentDetails.total_crate_type1_price || 0) + (paymentDetails.total_crate_type2_price || 0)

  // Total for the whole sale invoice table
  const tableTotal = totalProductPrice + totalCratePrice

  return (
    <div
      className='invoice-content'
      style={{
        fontFamily: "'Hind Siliguri', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
        fontSize: '11px',
        lineHeight: '1.2',
        color: '#000',
        backgroundColor: '#fff',
        padding: '5px'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '4px', borderBottom: '0.5px solid #000' }}>
        তারিখ:{' '}
        {convertToBanglaNumber(
          (saleData?.sale_date || new Date().toISOString()).split('T')[0].split('-').reverse().join('/')
        )}
      </div>

      {/* Customer Info */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontSize: '13px', marginBottom: '1px' }}>ক্রেতা: {saleData?.customer_name || 'N/A'}</div>
        <div style={{ fontSize: '13px', marginBottom: '2px' }}>ঠিকানা: {saleData?.customer_location || 'N/A'}</div>
      </div>

      {/* 1. CRATED PRODUCTS LIST (New List Style) */}
      {cratedSummary.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '13px', borderBottom: '1px solid #000' }}>
            ক্যারেট পণ্য বিবরণ (List):
          </div>
          {cratedSummary.map((product, idx) => {
            const crateValue = product.totalCrate1 * crate1Rate + product.totalCrate2 * crate2Rate
            const lineTotal = product.finalProductBase + product.commissionAmount + crateValue

            return (
              <div
                key={idx}
                style={{
                  border: '0.5px solid #000',
                  padding: '6px',
                  marginBottom: '8px',
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    borderBottom: '0.5px dotted #000',
                    paddingBottom: '2px',
                    marginBottom: '4px'
                  }}
                >
                  {product.product_name}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
                  <div>
                    <strong>মোট ওজন:</strong> {convertToBanglaNumber(product.totalKg)} কেজি
                  </div>
                  <div>
                    <strong>বাদ ওজন:</strong> {convertToBanglaNumber(product.totalDiscountKg)} কেজি
                  </div>
                  <div>
                    <strong>নিট ওজন:</strong> {convertToBanglaNumber(product.netKg)} কেজি
                  </div>
                  <div>
                    <strong>দর:</strong> ৳{convertToBanglaNumber(product.unit_price)}
                  </div>
                  <div>
                    <strong>কমিশন:</strong>{' '}
                    {product.customer_commission_rate > 0
                      ? `${convertToBanglaNumber(product.customer_commission_rate)}%`
                      : '-'}
                  </div>
                  <div>
                    <strong>কমিশন টাকা:</strong> ৳{convertToBanglaNumber(product.commissionAmount.toFixed(0))}
                  </div>
                  <div>
                    <strong>ক্যারেট:</strong> {convertToBanglaNumber(product.totalCrate1 + product.totalCrate2)} (
                    {convertToBanglaNumber(product.totalCrate1)}/{convertToBanglaNumber(product.totalCrate2)})
                  </div>
                  <div>
                    <strong>ক্যারট মূল্য:</strong> ৳{convertToBanglaNumber(crateValue.toFixed(0))}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '6px',
                    paddingTop: '4px',
                    borderTop: '1px solid #000',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  মোট: ৳{convertToBanglaNumber(lineTotal.toFixed(0))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 2. OTHER PRODUCTS TABLE (Standard) */}
      {otherSummary.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px', borderBottom: '0.5px solid #ccc' }}>
            অন্যান্য পণ্য বিবরণ:
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>পণ্য</th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>পরিমাণ</th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>দর</th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>কমিশন</th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>ডিসকাউন্ট</th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>মোট</th>
              </tr>
            </thead>
            <tbody>
              {otherSummary.map((product, idx) => {
                const lineTotal = product.finalProductBase + product.commissionAmount

                return (
                  <tr key={idx}>
                    <td style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left' }}>
                      {product.product_name}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>
                      {product.isBoxed
                        ? `${convertToBanglaNumber(product.totalBox)} বক্স`
                        : product.isPieced
                          ? `${convertToBanglaNumber(product.totalPiece)} পিস`
                          : `${convertToBanglaNumber(product.totalKg)} কেজি`}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>
                      {convertToBanglaNumber(product.unit_price)}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>
                      {product.commissionAmount > 0 ? convertToBanglaNumber(product.commissionAmount.toFixed(0)) : '-'}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center' }}>
                      {product.totalDiscountAmount > 0 ? convertToBanglaNumber(product.totalDiscountAmount) : '-'}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>
                      {convertToBanglaNumber(lineTotal.toFixed(0))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Summary - ALWAYS SHOW if there are ANY OTHER (non-crated) products OR if it's a 100% normal sale */}
      {(cratedSummary.length === 0 || otherSummary.length > 0) && (
        <div style={{ border: '0.5px solid #000', padding: '4px', fontSize: '13px' }}>
          <div
            style={{ marginBottom: '4px', textAlign: 'center', fontWeight: 'bold', borderBottom: '0.5px solid #ccc' }}
          >
            পরিশোধ বিবরণ
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>পূর্বের বকেয়া:</span>
            <span>{convertToBanglaNumber(previousDue)}</span>
          </div>

          {/* New detailed breakdown of current bill if mixed items exist */}
          {cratedSummary.length > 0 && otherSummary.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1px',
                  fontSize: '12px',
                  color: '#444',
                  paddingLeft: '8px'
                }}
              >
                <span>ক্যারেট পণ্যের বিল:</span>
                <span>
                  {convertToBanglaNumber(
                    cratedSummary
                      .reduce(
                        (sum, p) =>
                          sum +
                          p.finalProductBase +
                          p.commissionAmount +
                          (p.totalCrate1 * crate1Rate + p.totalCrate2 * crate2Rate),
                        0
                      )
                      .toFixed(0)
                  )}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1px',
                  fontSize: '12px',
                  color: '#444',
                  paddingLeft: '8px'
                }}
              >
                <span>অন্যান্য পণ্যের বিল:</span>
                <span>
                  {convertToBanglaNumber(
                    otherSummary.reduce((sum, p) => sum + p.finalProductBase + p.commissionAmount, 0).toFixed(0)
                  )}
                </span>
              </div>
            </>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1px',
              fontWeight: cratedSummary.length > 0 && otherSummary.length > 0 ? 'bold' : 'normal'
            }}
          >
            <span>বর্তমান বিল:</span>
            <span>{convertToBanglaNumber(currentBill)}</span>
          </div>

          {paymentDetails.vat > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '8px', color: '#666' }}>
              <span>(ভ্যাট)</span>
              <span>{convertToBanglaNumber(paymentDetails.vat)}</span>
            </div>
          )}

          {previousBalance >= 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'blue' }}>
              <span>পূর্বের জমা:</span>
              <span>{convertToBanglaNumber(previousBalance)}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '3px',
              borderTop: '0.5px solid #000',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            <span>সর্বমোট পরিশোধযোগ্য:</span>
            <span>{convertToBanglaNumber(netPayable.toFixed(0))}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>প্রদত্ত টাকা:</span>
            <span>{convertToBanglaNumber(paymentDetails.received_amount || 0)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2px',
              borderTop: '0.5px dotted #000',
              paddingTop: '2px',
              fontWeight: 'bold',
              color: 'red'
            }}
          >
            <span>বাকি:</span>
            <span>
              {convertToBanglaNumber(Math.max(0, netPayable - (paymentDetails.received_amount || 0)).toFixed(0))}
            </span>
          </div>

          {paymentDetails.note && (
            <div style={{ marginTop: '4px', fontSize: '9px', borderTop: '0.5px dotted #ccc', fontStyle: 'italic' }}>
              নোট: {paymentDetails.note}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: '8px',
          paddingTop: '2px',
          borderTop: '0.5px dashed #000',
          fontSize: '9px',
          textAlign: 'center'
        }}
      >
        <div>প্রিন্টের সময়: {convertToBanglaNumber(new Date().toLocaleTimeString('bn-BD'))}</div>
      </div>
    </div>
  )
}

export default SaleInvoice
