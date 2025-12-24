'use client'

const LotSaleInvoice = ({ lotSaleData }) => {
  if (!lotSaleData) return null

  console.log('lotSaleData', lotSaleData)

  // Determine which columns to show based on data
  const hasDiscount = lotSaleData.sales?.some(sale => (sale.discount_Kg || 0) > 0) || false
  const hasCrate = lotSaleData.sales?.some(sale => (sale.total_crate || 0) > 0 || (sale.crate_type1 || 0) > 0 || (sale.crate_type2 || 0) > 0) || false
  const hasBox = lotSaleData.sales?.some(sale => sale.isBoxed && (sale.box_quantity || 0) > 0) || false
  const hasPiece = lotSaleData.sales?.some(sale => sale.isPieced && (sale.piece_quantity || 0) > 0) || false
  const hasKg = lotSaleData.sales?.some(sale => (sale.kg || 0) > 0) || false

  // Calculate totals
  const totalKg = lotSaleData.sales?.reduce((sum, sale) => sum + (sale.kg || 0), 0) || 0
  const totalPrice = lotSaleData.sales?.reduce((sum, sale) => sum + (sale.total_price || 0), 0) || 0
  const totalCrate = lotSaleData.sales?.reduce((sum, sale) => sum + (sale.total_crate || 0), 0) || 0
  const totalBox = lotSaleData.sales?.reduce((sum, sale) => sum + (sale.box_quantity || 0), 0) || 0
  const totalPiece = lotSaleData.sales?.reduce((sum, sale) => sum + (sale.piece_quantity || 0), 0) || 0
  const avgPrice = totalKg > 0 ? (totalPrice / totalKg).toFixed(2) : 0

  // Filter expenses to show only non-zero values
  const expenses = lotSaleData.lot_expenses
  const expenseItems = expenses ? [
    { label: 'পরিবহন', value: expenses.transportation, key: 'transportation' },
    { label: 'লেবার', value: expenses.labour, key: 'labour' },
    { label: 'অন্যান্য', value: expenses.other_expenses, key: 'other_expenses' },
    { label: 'ভ্যান ভাড়া', value: expenses.van_vara, key: 'van_vara' },
    { label: 'গদিঘর', value: expenses.trading_post, key: 'trading_post' },
    { label: 'মসজিদ', value: expenses.moshjid, key: 'moshjid' },
    { label: 'অতিরিক্ত ডিসকাউন্ট', value: expenses.extra_discount, key: 'extra_discount' }
  ].filter(item => (item.value || 0) > 0) : []

  // Calculate column count for empty state
  const columnCount = 2 + (hasKg ? 1 : 0) + (hasBox ? 1 : 0) + (hasPiece ? 1 : 0) + (hasDiscount ? 1 : 0) + (hasCrate ? 1 : 0)

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
        <div style={{ fontSize: '9px', marginBottom: '1px' }}>সাপ্লাইয়ার: {lotSaleData.supplier_name || 'N/A'}</div>
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
                {hasKg && <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>কেজি</th>}
                {hasBox && <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>বক্স</th>}
                {hasPiece && <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>পিস</th>}
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>দর</th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>
                  মোট মূল্য
                </th>
                {hasDiscount && <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>
                  ডিসকাউন্ট
                </th>}
                {hasCrate && <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'left', fontSize: '9px' }}>
                  ক্যারেট
                </th>}
              </tr>
            </thead>
            <tbody>
              {lotSaleData.sales && lotSaleData.sales.length > 0 ? (
                lotSaleData.sales.map((sale, index) => (
                  <tr key={index}>
                    {hasKg && <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>{sale.kg || 0}</td>}
                    {hasBox && <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>{sale.box_quantity || 0}</td>}
                    {hasPiece && <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>{sale.piece_quantity || 0}</td>}
                    <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>
                      {sale.unit_price || 0}
                    </td>
                    <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>
                      {sale.total_price || 0}
                    </td>
                    {hasDiscount && <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>
                      {sale.discount_Kg || 0}
                    </td>}
                    {hasCrate && <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '9px' }}>
                      {sale.total_crate || 0}
                    </td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columnCount}
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

            {hasKg && totalKg > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>মোট কেজি:</span>
                <span>{totalKg}</span>
              </div>
            )}

            {hasBox && totalBox > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>মোট বক্স:</span>
                <span>{totalBox}</span>
              </div>
            )}

            {hasPiece && totalPiece > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>মোট পিস:</span>
                <span>{totalPiece}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>মোট মূল্য:</span>
              <span>{totalPrice}</span>
            </div>

            {hasCrate && totalCrate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>মোট ক্যারেট:</span>
                <span>{totalCrate}</span>
              </div>
            )}

            {totalKg > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>গড় দর:</span>
                <span>{avgPrice}</span>
              </div>
            )}
          </div>

          {/* Expenses Box */}
          {lotSaleData.lot_expenses && expenseItems.length > 0 && (
            <div
              style={{
                border: '0.5px solid #000',
                padding: '4px',
                fontSize: '9px'
              }}
            >
              <div style={{ marginBottom: '3px', fontSize: '10px' }}>খরচ</div>

              {expenseItems.map((item, index) => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                  <span>{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}

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
