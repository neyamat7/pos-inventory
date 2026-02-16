'use client'

import { convertToBanglaNumber } from '@/utils/convert-to-bangla'

const SaleInvoice = ({ saleData, customerData }) => {

  console.log('customerData in invoice pdf generation page', JSON.stringify(customerData))

  console.log('saleData in invoice pdf generation page', JSON.stringify(saleData))

  // Group lots by product and calculate product totals
  const productSummary =
    saleData?.items?.map(item => {
      const totalKg = item.selected_lots.reduce((sum, lot) => sum + (lot.kg || 0), 0)
      const totalBox = item.selected_lots.reduce((sum, lot) => sum + (lot.box_quantity || 0), 0)
      const totalPiece = item.selected_lots.reduce((sum, lot) => sum + (lot.piece_quantity || 0), 0)
      const totalDiscount = item.selected_lots.reduce((sum, lot) => sum + (lot.discount_amount || 0), 0)
      const totalCrate1 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type1 || 0), 0)
      const totalCrate2 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type2 || 0), 0)
      const productTotal = item.selected_lots.reduce(
        (sum, lot) => sum + ((lot.selling_price || 0) + (lot.customer_commission_amount || 0)), 
        0
      )




      // Get flags from first lot
      const firstLot = item.selected_lots[0] || {}
      const isBoxed = firstLot.isBoxed || false
      const isPieced = firstLot.isPieced || false
      const isCrated = firstLot.isCrated || false

      return {
        product_name: item.productId?.productNameBn || item.product_name_bn || item.productId?.productName || item.product_name || 'N/A',
        isBoxed,
        isPieced,
        isCrated,
        totalKg,
        totalBox,
        totalPiece,
        unit_price: firstLot.unit_price || 0,
        customer_commission_rate: firstLot.customer_commission_rate || 0,
        totalDiscount,
        productTotal,
        totalCrate1,
        totalCrate2,
        lots: item.selected_lots
      }
    }) || []

  const paymentDetails = saleData?.payment_details || {}

  // Check if any product has discount, crates, or commission
  const hasAnyDiscount = productSummary.some(p => p.totalDiscount >= 1)
  const hasAnyCrate = productSummary.some(p => p.isCrated)
  const hasAnyCommission = productSummary.some(p => p.customer_commission_rate > 0)

  // Calculation for Payment Summary
  const previousDue = customerData?.account_info?.due || 0
  const currentBill = paymentDetails.payable_amount || 0
  const totalDue = previousDue + currentBill
  const previousBalance = customerData?.account_info?.balance || 0
  // Net payable logic: Total Due - Previous Balance
  const netPayable = Math.max(0, totalDue - previousBalance)

  const totalProductPrice = productSummary.reduce((sum, item) => sum + (Number(item.productTotal) || 0), 0)
  const totalCrate1Price = Number(paymentDetails.total_crate_type1_price) || 0
  const totalCrate2Price = Number(paymentDetails.total_crate_type2_price) || 0
  
  // Total table sum (Products + Crates)
  const tableTotal = totalProductPrice + totalCrate1Price + totalCrate2Price

  // Calculate colSpan for Total Price row (Product + Qty + Rate + [Commission] + [Discount] + [Crate])
  const colSpanCount = 3 + (hasAnyCommission ? 1 : 0) + (hasAnyDiscount ? 1 : 0) + (hasAnyCrate ? 1 : 0)

  // console.log('productSummary', JSON.stringify(productSummary))

  return (
    <div
      className='invoice-content'
      style={{
        fontFamily: "'Hind Siliguri', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
        fontSize: '9px',
        lineHeight: '1.2',
        color: '#000',
        backgroundColor: '#fff'
      }}
    >
      {/* Header - Centered */}
      <div style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '4px', borderBottom: '0.5px solid #000' }}>
          তারিখ: {convertToBanglaNumber(
            (saleData?.sale_date || new Date().toISOString())
              .split('T')[0]
              .split('-')
              .reverse()
              .join('/')
          )}
      </div>

      {/* Customer Info */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontSize: '11px', marginBottom: '1px' }}>ক্রেতা: {saleData?.customer_name || 'N/A'}</div>
        <div style={{ fontSize: '11px', marginBottom: '2px' }}>ঠিকানা: {saleData?.customer_location || 'N/A'}</div>
      </div>

      {/* Products Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '8px'
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '11px' }}>পণ্য</th>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '11px' }}>পরিমাণ</th>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '11px' }}>দর</th>
            {hasAnyCommission && (
              <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '11px' }}>
                কমিশন
              </th>
            )}
            {hasAnyDiscount && (
              <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '11px' }}>
                ডিসকাউন্ট
              </th>
            )}
            {hasAnyCrate && (
              <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '11px' }}>
                ক্যারেট
              </th>
            )}
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '11px' }}>মোট</th>
          </tr>
        </thead>
        <tbody>
          {productSummary.map((product, index) => (
            <tr key={index}>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '11px', textAlign: 'left' }}>
                {product.product_name}
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '11px', textAlign: 'center' }}>
                {product.isBoxed 
                  ? `${convertToBanglaNumber(product.totalBox)} বক্স` 
                  : product.isPieced 
                    ? `${convertToBanglaNumber(product.totalPiece)} পিস` 
                    : `${convertToBanglaNumber(product.totalKg)} কেজি`}
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '11px', textAlign: 'center' }}>
                {convertToBanglaNumber(product.unit_price || 0)}
              </td>
              {hasAnyCommission && (
                <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '11px', textAlign: 'center' }}>
                  {product.customer_commission_rate > 0 ? `${convertToBanglaNumber(product.customer_commission_rate)}%` : '-'}
                </td>
              )}
              {hasAnyDiscount && (
                <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '11px', textAlign: 'center' }}>
                  {product.totalDiscount >= 1 ? convertToBanglaNumber(product.totalDiscount) : '-'}
                </td>
              )}
              {hasAnyCrate && (
                <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '11px', textAlign: 'center' }}>
                  {product.isCrated && (product.totalCrate1 > 0 || product.totalCrate2 > 0)
                    ? `${convertToBanglaNumber(product.totalCrate1)}/${convertToBanglaNumber(product.totalCrate2)}`
                    : '-'}
                </td>
              )}
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '11px', textAlign: 'center' }}>
                {convertToBanglaNumber(product.productTotal || 0)}
              </td>
            </tr>
          ))}
          
          {/* Crate Type 1 Price Row */}
          {totalCrate1Price > 0 && (
            <tr>
              <td 
                colSpan={colSpanCount} 
                style={{ 
                  border: '0.5px solid #000', 
                  padding: '2px', 
                  fontSize: '11px', 
                  textAlign: 'right',  
                }}
              >
                ক্যারেট (টাইপ ১):
              </td>
              <td 
                style={{ 
                  border: '0.5px solid #000', 
                  padding: '2px', 
                  fontSize: '11px', 
                  textAlign: 'center',  
                }}
              >
                {convertToBanglaNumber(totalCrate1Price)}
              </td>
            </tr>
          )}

          {/* Crate Type 2 Price Row */}
          {totalCrate2Price > 0 && (
            <tr>
              <td 
                colSpan={colSpanCount} 
                style={{ 
                  border: '0.5px solid #000', 
                  padding: '2px', 
                  fontSize: '11px', 
                  textAlign: 'right',  
                }}
              >
                ক্যারেট (টাইপ ২):
              </td>
              <td 
                style={{ 
                  border: '0.5px solid #000', 
                  padding: '2px', 
                  fontSize: '11px', 
                  textAlign: 'center',  
                }}
              >
                {convertToBanglaNumber(totalCrate2Price)}
              </td>
            </tr>
          )}

          {/* Total Price Row */}
          <tr>
            <td 
              colSpan={colSpanCount} 
              style={{ 
                border: '0.5px solid #000', 
                padding: '2px', 
                fontSize: '11px', 
                textAlign: 'right', 
                fontWeight: 'bold' 
              }}
            >
              মোট মূল্য:
            </td>
            <td 
              style={{ 
                border: '0.5px solid #000', 
                padding: '2px', 
                fontSize: '11px', 
                textAlign: 'center', 
                fontWeight: 'bold' 
              }}
            >
              {convertToBanglaNumber(tableTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Payment Summary */}
      <div
        style={{
          border: '0.5px solid #000',
          padding: '4px',
          fontSize: '11px'
        }}
      >
        <div style={{ marginBottom: '4px', fontSize: '11px', textAlign: 'center' }}>পরিশোধ বিবরণ</div>

        {/* 1. Previous Due */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
          <span>পূর্বের বকেয়া:</span>
          <span>{convertToBanglaNumber(previousDue)}</span>
        </div>

        {/* 2. Current Bill (includes Crate & VAT) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
          <span>বর্তমান বিল:</span>
          <span>{convertToBanglaNumber(currentBill)}</span>
        </div>

        {/* Breakdown of Current Bill (Optional, but helpful context) */}
        {paymentDetails.vat > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px', fontSize: '9px', color: '#555', paddingLeft: '8px' }}>
            <span>(ভ্যাট সহ)</span>
            <span>{convertToBanglaNumber(paymentDetails.vat)}</span>
          </div>
        )}

        {/* 3. Total Due */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '1px', 
          borderTop: '0.5px dotted #000',
          paddingTop: '2px'
        }}>
          <span>সর্বমোট বকেয়া:</span>
          <span>{convertToBanglaNumber(totalDue)}</span>
        </div>

        {/* 4. Previous Balance (Hide if < 1) */}
        {previousBalance >= 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>পূর্বের জমা:</span>
            <span>{convertToBanglaNumber(previousBalance)}</span>
          </div>
        )}

        {/* 5. Total Payable */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '3px',
            paddingTop: '2px',
            borderTop: '0.5px solid #000',
            fontWeight: 'bold'
          }}
        >
          <span>সর্বমোট পরিশোধযোগ্য:</span>
          <span>{convertToBanglaNumber(netPayable)}</span>
        </div>

        {/* Paid Amount */}
        {paymentDetails.received_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>প্রদত্ত টাকা:</span>
            <span>{convertToBanglaNumber(paymentDetails.received_amount || 0)}</span>
          </div>
        )}

        {/* Note if any */}
        {paymentDetails.note && (
           <div style={{ marginTop: '4px', fontSize: '10px', borderTop: '0.5px dotted #ccc', paddingTop: '2px' }}>
             নোট: {paymentDetails.note}
           </div>
        )}
      </div>

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
