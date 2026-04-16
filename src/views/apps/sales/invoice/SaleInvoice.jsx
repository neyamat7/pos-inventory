'use client'

import { convertToBanglaNumber } from '@/utils/convert-to-bangla'

const SaleInvoice = ({ saleData, customerData }) => {
  // DATA CALCULATIONS
  const allProductSummary =
    saleData?.items?.map(item => {
      const totalKg = item.selected_lots.reduce((sum, lot) => sum + (lot.kg || 0), 0)
      const totalDiscountKg = item.selected_lots.reduce(
        (sum, lot) => sum + (Number(lot.discount_Kg) || Number(lot.discount_kg) || 0),
        0
      )
      const netKg = totalKg - totalDiscountKg
      const totalBox = item.selected_lots.reduce((sum, lot) => sum + (lot.box_quantity || 0), 0)
      const totalPiece = item.selected_lots.reduce((sum, lot) => sum + (lot.piece_quantity || 0), 0)
      const totalDiscountAmount = item.selected_lots.reduce((sum, lot) => sum + (lot.discount_amount || 0), 0)
      const totalCrate1 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type1 || 0), 0)
      const totalCrate2 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type2 || 0), 0)
      const commissionAmount = item.selected_lots.reduce((sum, lot) => sum + (lot.customer_commission_amount || 0), 0)
      const firstLot = item.selected_lots[0] || {}
      const unitPrice = firstLot.unit_price || 0
      const isCrated = firstLot.isCrated || false

      return {
        product_name:
          item.productId?.productNameBn ||
          item.product_name_bn ||
          item.productId?.productName ||
          item.product_name ||
          'N/A',
        isCrated,
        netKg,
        totalBox,
        totalPiece,
        unit_price: unitPrice,
        finalProductBase: isCrated
          ? netKg * unitPrice
          : Math.max(0, (netKg || totalBox || totalPiece) * unitPrice - totalDiscountAmount),
        commissionAmount,
        totalCrate1,
        totalCrate2
      }
    }) || []

  const otherSummary = allProductSummary.filter(p => !p.isCrated)
  const hasOtherProducts = otherSummary.length > 0
  const otherProductsTotal = otherSummary.reduce((sum, p) => sum + p.finalProductBase, 0)

  const paymentDetails = saleData?.payment_details || {}

  const overallCrate1Count = allProductSummary.reduce((sum, p) => sum + p.totalCrate1, 0)
  const overallCrate2Count = allProductSummary.reduce((sum, p) => sum + p.totalCrate2, 0)
  const crate1Rate = overallCrate1Count > 0 ? (paymentDetails.total_crate_type1_price || 0) / overallCrate1Count : 0
  const crate2Rate = overallCrate2Count > 0 ? (paymentDetails.total_crate_type2_price || 0) / overallCrate2Count : 0

  const previousDue = paymentDetails.previous_due ?? (customerData?.account_info?.due || 0)
  const previousBalance = paymentDetails.previous_balance ?? (customerData?.account_info?.balance || 0)
  const currentBill = paymentDetails.payable_amount || 0
  const totalDue = previousDue + currentBill
  const netPayable = Math.max(0, totalDue - previousBalance)

  // MATH ROW (PERFECT EQUALITY ALIGNMENT - COMPACTED)
  const RightAlignedMathRow = ({ left, middle = '=', right, bold = false }) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 20px 95px',
        gap: '0px',
        fontWeight: bold ? 'bold' : 'normal',
        textAlign: 'left'
      }}
    >
      <div style={{ textAlign: 'right', paddingRight: '5px' }}>{left}</div>
      <div style={{ textAlign: 'center' }}>{middle}</div>
      <div style={{ textAlign: 'right', paddingRight: '5px' }}>{right}</div>
    </div>
  )

  return (
    <div
      className='invoice-content'
      style={{
        fontFamily: "'Hind Siliguri', 'SolaimanLipi', sans-serif",
        fontSize: '15px',
        lineHeight: '1.4',
        color: '#000',
        backgroundColor: '#fff',
        padding: '5px'
      }}
    >
      {/* 1. Header (Date and Customer) */}
      <div style={{ textAlign: 'center', marginBottom: '3px' }}>
        <div>
          তারিখ:{' '}
          {convertToBanglaNumber(
            (saleData?.sale_date || new Date().toISOString()).split('T')[0].split('-').reverse().join('/')
          )}
        </div>
        <div style={{ marginTop: '1px' }}>
          ক্রেতা: {saleData?.customer_name || 'N/A'}{' '}
          {saleData?.customer_location ? `(${saleData.customer_location})` : ''}
        </div>
      </div>

      {/* 2. Crated Lot Detail Design - MOVED TO THE RIGHT */}
      <div style={{ marginBottom: '5px', textAlign: 'right', paddingRight: '10px' }}>
        {saleData?.items?.map((item, iIdx) => (
          <div key={iIdx}>
            {(item.selected_lots || [])
              .filter(l => l.isCrated)
              .map((lot, lIdx) => {
                const discountKg = Number(lot.discount_Kg || lot.discount_kg) || 0
                const netKg = Number(lot.kg) - discountKg
                const subtotal = netKg * Number(lot.unit_price)
                const commission = Number(lot.customer_commission_amount) || 0
                const pricePlusComm = subtotal + commission
                const crate1Total = Number(lot.crate_type1) * crate1Rate
                const crate2Total = Number(lot.crate_type2) * crate2Rate
                const lotFinalTotal = pricePlusComm + crate1Total + crate2Total

                const productNameBn =
                  item.product_name_bn ||
                  item.productId?.productNameBn ||
                  item.product_name ||
                  item.productId?.productName ||
                  ''

                const lotName = lot.lot_name || lot.lotId?.lot_name || ''

                return (
                  <div key={lIdx} style={{ display: 'inline-block', textAlign: 'left', marginBottom: '5px' }}>
                    {/* Header: Product Name above Lot Name */}
                    {/* <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      <div style={{ fontWeight: '800', fontSize: '19px' }}>{productNameBn}</div>
                      {lotName && (
                        <div style={{ fontWeight: 'normal', fontSize: '14px', marginTop: '2px' }}>{lotName}</div>
                      )}
                    </div> */}

                    {/* VERTICAL MEASUREMENTS (exactly as requested) */}
                    {lot.kg_measurements?.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          paddingRight: '65px',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ textAlign: 'right', minWidth: '40px' }}>
                          {lot.kg_measurements.map((m, idx) => (
                            <div key={idx} style={{ fontSize: '14px', lineHeight: '1.2' }}>
                              {convertToBanglaNumber(m)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FIRST LINE: Compact alignment */}
                    <div style={{ textAlign: 'center', paddingRight: '40px', marginBottom: '2px' }}>
                      {(lot.crate_type1 > 0 && lot.crate_type2 > 0) ? 'AB' : (lot.crate_type2 > 0 ? 'B' : 'A')}{' '}
                      {convertToBanglaNumber(Number(lot.crate_type1 || 0) + Number(lot.crate_type2 || 0))} ={' '}
                      {convertToBanglaNumber(lot.kg)} - {convertToBanglaNumber(discountKg)}
                    </div>

                    {/* Border 1: Narrowed for compact look */}
                    <div
                      style={{
                        borderBottom: '1px solid #000',
                        width: '110px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginBottom: '2px'
                      }}
                    ></div>

                    {/* MATH LINES */}
                    <RightAlignedMathRow
                      left={
                        <>
                          {convertToBanglaNumber(netKg)} * {convertToBanglaNumber(lot.unit_price)}
                        </>
                      }
                      right={convertToBanglaNumber(subtotal.toFixed(0))}
                    />

                    <RightAlignedMathRow left='কমিশন' right={convertToBanglaNumber(commission.toFixed(0))} />

                    {/* Border 2: Narrowed */}
                    <div
                      style={{
                        borderBottom: '1px solid #000',
                        width: '210px',
                        marginLeft: 'auto',
                        marginTop: '2px',
                        marginBottom: '2px'
                      }}
                    ></div>

                    {/* Subtotal with Comm */}
                    <RightAlignedMathRow
                      left=''
                      middle=''
                      right={convertToBanglaNumber(pricePlusComm.toFixed(0))}
                      bold
                    />

                    {/* Crate Math */}
                    {lot.crate_type1 > 0 && (
                      <RightAlignedMathRow
                        left={
                          <>
                            A {convertToBanglaNumber(lot.crate_type1)} * {convertToBanglaNumber(crate1Rate.toFixed(0))}
                          </>
                        }
                        right={convertToBanglaNumber(crate1Total.toFixed(0))}
                      />
                    )}
                    {lot.crate_type2 > 0 && (
                      <RightAlignedMathRow
                        left={
                          <>
                            B {convertToBanglaNumber(lot.crate_type2)} * {convertToBanglaNumber(crate2Rate.toFixed(0))}
                          </>
                        }
                        right={convertToBanglaNumber(crate2Total.toFixed(0))}
                      />
                    )}

                    {/* Border 3: Narrowed */}
                    <div
                      style={{
                        borderBottom: '1.5px solid #000',
                        width: '230px',
                        marginLeft: 'auto',
                        marginTop: '2px',
                        marginBottom: '2px'
                      }}
                    ></div>

                    {/* Lot Final Total */}
                    <RightAlignedMathRow
                      left=''
                      right={<div style={{ fontSize: '18px' }}>{convertToBanglaNumber(lotFinalTotal.toFixed(0))}</div>}
                      bold
                    />
                  </div>
                )
              })}
          </div>
        ))}
      </div>

      {/* 3. OTHER PRODUCTS */}
      {hasOtherProducts && (
        <div style={{ marginBottom: '3px', borderTop: '1px solid #ccc', paddingTop: '3px' }}>
          {otherSummary.map((product, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', padding: '0 10px' }}
            >
              <span>{product.product_name}</span>
              <span>
                {convertToBanglaNumber(product.netKg || product.totalBox || product.totalPiece)} *{' '}
                {convertToBanglaNumber(product.unit_price)} ={' '}
                {convertToBanglaNumber(product.finalProductBase.toFixed(0))}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Global Total Sale (Show only if there are other products) */}
      {hasOtherProducts && (
        <div
          style={{
            borderTop: '1.5px solid #000',
            padding: '6px 10px 0 10px',
            marginTop: '5px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '13px', fontWeight: 'bold' }}>
            <div style={{ fontSize: '15px' }}>মোট বিক্রয়:</div>
            <div style={{ fontSize: '20px', textAlign: 'right', minWidth: '80px' }}>
              {convertToBanglaNumber(currentBill.toFixed(0))}
            </div>
          </div>
        </div>
      )}

      {/* 4. FINANCIAL SUMMARY */}
      <div style={{ textAlign: 'center', marginTop: '5px' }}></div>

      {/* Financial Details */}
      <div style={{ width: '90%', margin: '0 auto', fontSize: '14px' }}>
        {previousDue > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>পূর্বের বকেয়া:</span>
            <span>{convertToBanglaNumber(previousDue.toFixed(0))}</span>
          </div>
        )}

        {previousBalance >= 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#006400', marginBottom: '3px' }}>
            <span>পূর্বের জমা:</span>
            <span>{convertToBanglaNumber(previousBalance.toFixed(0))}</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            borderTop: '1px solid #ddd',
            marginTop: '8px',
            paddingTop: '5px'
          }}
        >
          <span>মোট:</span>
          <span>{convertToBanglaNumber(netPayable.toFixed(0))}</span>
        </div>

        {/* 5. PAYMENTS & BALANCE (CONDITIONAL) */}
        {paymentDetails.received_amount > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
              <span>জমা:</span>
              <span>{convertToBanglaNumber(paymentDetails.received_amount.toFixed(0))}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                borderTop: '1px solid #000',
                marginTop: '5px',
                color: '#d32f2f',
                paddingTop: '2px',
                fontSize: '16px'
              }}
            >
              <span>অবশিষ্ট বকেয়া:</span>
              <span>
                {convertToBanglaNumber(
                  Math.max(
                    0,
                    netPayable -
                      (paymentDetails.received_amount || 0) -
                      (paymentDetails.received_amount_from_balance || 0)
                  ).toFixed(0)
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Footer
      <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '10px', color: '#888' }}>
        প্রিন্টের সময়: {convertToBanglaNumber(new Date().toLocaleTimeString('bn-BD'))}
      </div> */}
    </div>
  )
}

export default SaleInvoice
