'use client'

const LotSaleInvoice = ({ lotSaleData }) => {
  if (!lotSaleData) return null

  // Calculate totals
  const totalKg = lotSaleData.sales?.reduce((sum, sale) => sum + (sale.kg || 0), 0) || 0
  const totalPrice = lotSaleData.sales?.reduce((sum, sale) => sum + (sale.total_price || 0), 0) || 0
  const totalCrate = lotSaleData.sales?.reduce((sum, sale) => sum + (sale.total_crate || 0), 0) || 0
  const avgPrice = totalKg > 0 ? (totalPrice / totalKg).toFixed(2) : 0

  return (
    <div
      style={{
        fontFamily: "'Hind Siliguri', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
        fontSize: '10px',
        lineHeight: '1.3',
        color: '#000',
        backgroundColor: '#fff',
        width: '11cm',
        margin: '0 auto',
        padding: '0 0.3cm'
      }}
    >
      {/* Header - Left aligned */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', marginBottom: '2px' }}>লট বিক্রয় বিবরণ</div>
        <div style={{ fontSize: '9px', marginBottom: '1px' }}>Lot: {lotSaleData.lot_name || 'N/A'}</div>
        <div style={{ fontSize: '9px', marginBottom: '1px' }}>সাপ্লাইয়ার: {lotSaleData.supplier_name || 'N/A'}</div>
        <div style={{ fontSize: '9px' }}>তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Left Column - Sales Table */}
        <div style={{ flex: 3 }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '8px'
            }}
          >
            <thead>
              <tr>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>কেজি</th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>দর</th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>
                  মোট মূল্য
                </th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>
                  ডিসকাউন্ট
                </th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>
                  ক্যারেট
                </th>
              </tr>
            </thead>
            <tbody>
              {lotSaleData.sales && lotSaleData.sales.length > 0 ? (
                lotSaleData.sales.map((sale, index) => (
                  <tr key={index}>
                    <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>{sale.kg || 0}</td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>
                      {sale.unit_price || 0}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>
                      {sale.total_price || 0}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>
                      {sale.discount_Kg || 0}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>
                      {sale.total_crate || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan='5'
                    style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px', textAlign: 'center' }}
                  >
                    কোনো বিক্রয় তথ্য নেই
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Column - Summary and Expenses */}
        <div style={{ flex: 2 }}>
          {/* Summary Box */}
          <div
            style={{
              border: '0.5px solid #000',
              padding: '4px',
              marginBottom: '6px',
              fontSize: '9px'
            }}
          >
            <div style={{ marginBottom: '3px', fontSize: '10px' }}>সারাংশ</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>মোট কেজি:</span>
              <span>{totalKg}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>মোট মূল্য:</span>
              <span>{totalPrice}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>মোট ক্যারেট:</span>
              <span>{totalCrate}</span>
            </div>

            {totalKg > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>গড় দর:</span>
                <span>{avgPrice}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2px',
                paddingTop: '2px',
                borderTop: '0.5px solid #000'
              }}
            >
              <span>মোট লেনদেন:</span>
              <span>{lotSaleData.sales?.length || 0}</span>
            </div>
          </div>

          {/* Expenses Box */}
          {lotSaleData.lot_expenses && (
            <div
              style={{
                border: '0.5px solid #000',
                padding: '4px',
                fontSize: '9px'
              }}
            >
              <div style={{ marginBottom: '3px', fontSize: '10px' }}>খরচ</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span>পরিবহন:</span>
                <span>{lotSaleData.lot_expenses.transportation || 0}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span>লেবার:</span>
                <span>{lotSaleData.lot_expenses.labour || 0}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span>অন্যান্য:</span>
                <span>{lotSaleData.lot_expenses.other_expenses || 0}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span>ভ্যান ভাড়া:</span>
                <span>{lotSaleData.lot_expenses.van_vara || 0}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span>গদিঘর:</span>
                <span>{lotSaleData.lot_expenses.trading_post || 0}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span>মসজিদ:</span>
                <span>{lotSaleData.lot_expenses.moshjid || 0}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                <span>অতিরিক্ত ডিসকাউন্ট:</span>
                <span>{lotSaleData.lot_expenses.extra_discount || 0}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '2px',
                  paddingTop: '2px',
                  borderTop: '0.5px solid #000'
                }}
              >
                <span>মোট খরচ:</span>
                <span>{lotSaleData.lot_expenses.total_expenses || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '8px',
          paddingTop: '2px',
          borderTop: '0.5px dashed #000',
          fontSize: '8px',
          textAlign: 'center'
        }}
      >
        <div>প্রিন্টের সময়: {new Date().toLocaleTimeString('bn-BD')}</div>
      </div>
    </div>
  )
}

export default LotSaleInvoice
