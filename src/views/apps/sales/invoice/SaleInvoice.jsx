'use client'

const SaleInvoice = ({ saleData }) => {
  // Group lots by product and calculate product totals
  const productSummary =
    saleData?.items?.map(item => {
      const productTotal = item.selected_lots.reduce((sum, lot) => sum + (lot.total_price || 0), 0)
      const totalKg = item.selected_lots.reduce((sum, lot) => sum + (lot.kg || 0), 0)
      const totalBox = item.selected_lots.reduce((sum, lot) => sum + (lot.box_quantity || 0), 0)
      const totalDiscount = item.selected_lots.reduce((sum, lot) => sum + (lot.discount_amount || 0), 0)
      const totalCrate1 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type1 || 0), 0)
      const totalCrate2 = item.selected_lots.reduce((sum, lot) => sum + (lot.crate_type2 || 0), 0)

      return {
        product_name: item.selected_lots[0]?.product_name || 'N/A',
        isBoxed: item.selected_lots[0]?.isBoxed || false,
        totalKg,
        totalBox,
        unit_price: item.selected_lots[0]?.unit_price || 0,
        totalDiscount,
        productTotal,
        totalCrate1,
        totalCrate2,
        lots: item.selected_lots
      }
    }) || []

  const paymentDetails = saleData?.payment_details || {}

  return (
    <div
      style={{
        fontFamily: "'Hind Siliguri', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
        fontSize: '9px',
        lineHeight: '1.2',
        color: '#000',
        backgroundColor: '#fff',
        width: '11cm',
        margin: '0 auto',
        padding: '0 0.3cm'
      }}
    >
      {/* Header - Centered */}
      <div style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '4px', borderBottom: '0.5px solid #000' }}>
        <div style={{ fontSize: '11px', marginBottom: '2px' }}>বিক্রয় চালান</div>
        <div style={{ fontSize: '8px', marginBottom: '1px' }}>
          তারিখ: {saleData?.sale_date || new Date().toISOString().split('T')[0]}
        </div>
      </div>

      {/* Customer Info */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontSize: '9px', marginBottom: '1px' }}>ক্রেতা: {saleData?.customer_name || 'N/A'}</div>
        <div style={{ fontSize: '8px', marginBottom: '2px' }}>ঠিকানা: {saleData?.customer_address || 'N/A'}</div>
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
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>পণ্য</th>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>পরিমাণ</th>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>দর</th>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>
              ডিস্কাউন্ট
            </th>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>ক্রেট</th>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>মোট</th>
          </tr>
        </thead>
        <tbody>
          {productSummary.map((product, index) => (
            <tr key={index}>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'left' }}>
                {product.product_name}
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                {product.isBoxed ? `${product.totalBox} box` : `${product.totalKg} kg`}
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                {product.unit_price || 0}
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                {product.totalDiscount > 0 ? product.totalDiscount : '-'}
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                {product.totalCrate1 > 0 || product.totalCrate2 > 0
                  ? `${product.totalCrate1}/${product.totalCrate2}`
                  : '-'}
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                {product.productTotal || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Summary */}
      <div
        style={{
          border: '0.5px solid #000',
          padding: '4px',
          fontSize: '9px'
        }}
      >
        <div style={{ marginBottom: '4px', fontSize: '9px', textAlign: 'center' }}>পরিশোধ বিবরণ</div>

        {paymentDetails.extra_crate_type1_price > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>ক্রেট (ধরন ১):</span>
            <span>{paymentDetails.extra_crate_type1_price || 0}</span>
          </div>
        )}

        {paymentDetails.extra_crate_type2_price > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>ক্রেট (ধরন ২):</span>
            <span>{paymentDetails.extra_crate_type2_price || 0}</span>
          </div>
        )}

        {paymentDetails.vat > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>ভ্যাট:</span>
            <span>{paymentDetails.vat || 0}</span>
          </div>
        )}

        {paymentDetails.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>মোট ডিস্কাউন্ট:</span>
            <span>{paymentDetails.discount || 0}</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '3px',
            paddingTop: '2px',
            borderTop: '0.5px solid #000'
          }}
        >
          <span>পরিশোধযোগ্য টাকা:</span>
          <span>{paymentDetails.payable_amount || 0}</span>
        </div>

        {/* Additional Payment Info if available */}
        {paymentDetails.paid_amount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>প্রদত্ত টাকা:</span>
            <span>{paymentDetails.paid_amount || 0}</span>
          </div>
        )}

        {paymentDetails.due > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>বাকি:</span>
            <span>{paymentDetails.due || 0}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '8px',
          paddingTop: '2px',
          borderTop: '0.5px dashed #000',
          fontSize: '7px',
          textAlign: 'center'
        }}
      >
        <div>প্রিন্টের সময়: {new Date().toLocaleTimeString('bn-BD')}</div>
      </div>
    </div>
  )
}

export default SaleInvoice
