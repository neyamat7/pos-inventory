'use client'

const SalesListInvoice = ({ saleData }) => {
  // Extract customer data
  const customerData = saleData?.customerId || {}
  const paymentDetails = saleData?.payment_details || {}

  // Calculate totals from items and selected_lots
  const calculateTotals = () => {
    if (!saleData?.items) return { subtotal: 0, totalDiscount: 0, totalCommission: 0 }

    let subtotal = 0
    let totalDiscount = 0
    let totalCommission = 0

    saleData.items.forEach(item => {
      if (item.selected_lots) {
        item.selected_lots.forEach(lot => {
          subtotal += lot.total_price || 0
          totalDiscount += lot.discount_amount || 0
          totalCommission += (lot.customer_commission_amount || 0) + (lot.lot_commission_amount || 0)
        })
      }
    })

    return { subtotal, totalDiscount, totalCommission }
  }

  const { subtotal, totalDiscount, totalCommission } = calculateTotals()

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
      {/* Customer Info */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontSize: '8px', marginBottom: '1px' }}>
          তারিখ: {saleData?.sale_date || new Date().toISOString().split('T')[0]}
        </div>
        <div style={{ fontSize: '9px', marginBottom: '1px' }}>ক্রেতা: {customerData?.basic_info?.name || 'N/A'}</div>
        <div style={{ fontSize: '8px', marginBottom: '1px' }}>ফোন: {customerData?.contact_info?.phone || 'N/A'}</div>
        <div style={{ fontSize: '8px', marginBottom: '2px' }}>
          ঠিকানা: {customerData?.contact_info?.location || 'N/A'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '8px' }}>
          <span>ব্যালেন্স: {customerData?.account_info?.balance || 0}</span>
          <span>বাকি: {customerData?.account_info?.due || 0}</span>
        </div>
      </div>

      {/* Products and Lots */}
      <div>
        {saleData?.items && saleData.items.length > 0 ? (
          saleData.items.map((item, itemIndex) => (
            <div key={itemIndex} style={{ marginBottom: '4px' }}>
              {/* Product Header */}
              <div
                style={{
                  fontSize: '9px',
                  marginBottom: '2px',
                  padding: '1px 2px',
                  borderBottom: '0.2px solid #000'
                }}
              >
                {item.productId?.productName || 'Unknown Product'} - {item.productId?.categoryId?.categoryName || 'N/A'}
              </div>

              {/* Lots Table */}
              {item.selected_lots && item.selected_lots.length > 0 && (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '4px',
                    fontSize: '8px'
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'left' }}>লট</th>
                      <th style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>পরিমাণ</th>
                      <th style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>ডিস্কাউন্ট</th>
                      <th style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>দর</th>
                      <th style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>ক্রেট</th>
                      <th style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>মোট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.selected_lots.map((lot, lotIndex) => (
                      <tr key={lotIndex}>
                        <td style={{ border: '0.2px solid #000', padding: '1px' }}>{lot.lotId?.lot_name || 'N/A'}</td>
                        <td style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>
                          {lot.isBoxed ? `${lot.box_quantity} box` : `${lot.kg} kg`}
                        </td>
                        <td style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>
                          {lot.discount_amount || 0}
                        </td>
                        <td style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>
                          {lot.selling_price || 0}
                        </td>
                        <td style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>
                          {lot.crate_type1 || 0}/{lot.crate_type2 || 0}
                        </td>
                        <td style={{ border: '0.2px solid #000', padding: '1px', textAlign: 'center' }}>
                          {lot.total_price || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', fontSize: '8px', margin: '10px 0' }}>কোন পণ্য পাওয়া যায়নি</div>
        )}
      </div>

      {/* Payment Summary */}
      <div
        style={{
          border: '0.5px solid #000',
          padding: '4px',
          fontSize: '9px',
          marginTop: '6px'
        }}
      >
        <div style={{ marginBottom: '4px', fontSize: '9px', textAlign: 'center' }}>পরিশোধ বিবরণ</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
          <span>সাবটোটাল:</span>
          <span>{subtotal || 0}</span>
        </div>

        {paymentDetails.extra_crate_type1_price > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>অতিরিক্ত ক্রেট (ধরন ১):</span>
            <span>{paymentDetails.extra_crate_type1_price || 0}</span>
          </div>
        )}

        {paymentDetails.extra_crate_type2_price > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>অতিরিক্ত ক্রেট (ধরন ২):</span>
            <span>{paymentDetails.extra_crate_type2_price || 0}</span>
          </div>
        )}

        {totalDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>মোট ডিস্কাউন্ট:</span>
            <span>{totalDiscount || 0}</span>
          </div>
        )}

        {paymentDetails.vat > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>ভ্যাট:</span>
            <span>{paymentDetails.vat || 0}</span>
          </div>
        )}

        {totalCommission > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
            <span>মোট কমিশন:</span>
            <span>{totalCommission || 0}</span>
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
          <span>মোট পরিশোধযোগ্য:</span>
          <span>{paymentDetails.payable_amount || 0}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
          <span>প্রদত্ত টাকা:</span>
          <span>{paymentDetails.received_amount || 0}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
          <span>বাকি টাকা:</span>
          <span>{paymentDetails.due_amount || 0}</span>
        </div>

        {saleData?.total_profit && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>মোট লাভ:</span>
            <span>{saleData.total_profit || 0}</span>
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
          <span>পরিশোধ পদ্ধতি:</span>
          <span>{paymentDetails?.payment_type || 'নগদ'}</span>
        </div>

        {paymentDetails.note && (
          <div style={{ marginTop: '2px', fontSize: '8px' }}>
            <span>নোট: </span>
            <span>{paymentDetails.note}</span>
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

export default SalesListInvoice
