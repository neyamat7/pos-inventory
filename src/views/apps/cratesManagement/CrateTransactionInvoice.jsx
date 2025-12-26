'use client'

const CrateTransactionInvoice = ({ transactionData }) => {
  // Determine if it's a customer or supplier transaction
  const isCustomer = !!transactionData?.customerId
  const isSupplier = !!transactionData?.supplierId
  
  // Get the relevant party info
  const partyInfo = isCustomer 
    ? transactionData?.customerId 
    : isSupplier 
      ? transactionData?.supplierId 
      : null

  if (!partyInfo) return null

  const name = partyInfo?.basic_info?.name || 'N/A'
  const phone = partyInfo?.contact_info?.phone || 'N/A'
  const location = partyInfo?.contact_info?.location || 'N/A'

  // Get crate information from transaction
  const crateType1Qty = transactionData?.crate_type_1_qty || 0
  const crateType1Price = transactionData?.crate_type_1_price || 0
  const crateType2Qty = transactionData?.crate_type_2_qty || 0
  const crateType2Price = transactionData?.crate_type_2_price || 0

  // Calculate totals
  const type1Total = crateType1Qty * crateType1Price
  const type2Total = crateType2Qty * crateType2Price
  const grandTotal = type1Total + type2Total

  // Get due information
  let dueType1 = 0
  let dueType2 = 0

  if (isCustomer) {
    // For customer, crate_info shows their due (what they owe us)
    dueType1 = partyInfo?.crate_info?.type_1 || 0
    dueType2 = partyInfo?.crate_info?.type_2 || 0
  } else if (isSupplier) {
    // For supplier, needToGiveCrate shows our due to them
    dueType1 = partyInfo?.crate_info?.needToGiveCrate1 || 0
    dueType2 = partyInfo?.crate_info?.needToGiveCrate2 || 0
  }

  const transactionDate = transactionData?.date 
    ? new Date(transactionData.date).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB')

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
        <div style={{ fontSize: '11px', marginBottom: '2px' }}>
          {isCustomer ? 'ক্রেট পুনঃস্টক চালান' : 'ক্রেট লেনদেন চালান'}
        </div>
        <div style={{ fontSize: '8px', marginBottom: '1px' }}>
          তারিখ: {transactionDate}
        </div>
      </div>

      {/* Party Info */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{ fontSize: '9px', marginBottom: '1px' }}>
          {isCustomer ? 'ক্রেতা' : 'সরবরাহকারী'}: {name}
        </div>
        <div style={{ fontSize: '8px', marginBottom: '1px' }}>ফোন: {phone}</div>
        <div style={{ fontSize: '8px', marginBottom: '2px' }}>ঠিকানা: {location}</div>
      </div>

      {/* Crate Information Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '8px'
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>
              ক্রেট টাইপ
            </th>
            <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>
              পরিমাণ
            </th>
            {isCustomer && (
              <>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>
                  মূল্য
                </th>
                <th style={{ border: '0.5px solid #000', padding: '2px', textAlign: 'center', fontSize: '8px' }}>
                  মোট
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {crateType1Qty > 0 && (
            <tr>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                টাইপ ১
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                {crateType1Qty}
              </td>
              {isCustomer && (
                <>
                  <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                    ৳{crateType1Price}
                  </td>
                  <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                    ৳{type1Total}
                  </td>
                </>
              )}
            </tr>
          )}
          {crateType2Qty > 0 && (
            <tr>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                টাইপ ২
              </td>
              <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                {crateType2Qty}
              </td>
              {isCustomer && (
                <>
                  <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                    ৳{crateType2Price}
                  </td>
                  <td style={{ border: '0.5px solid #000', padding: '2px', fontSize: '8px', textAlign: 'center' }}>
                    ৳{type2Total}
                  </td>
                </>
              )}
            </tr>
          )}
        </tbody>
      </table>

      {/* Total Amount - Only for Customer */}
      {isCustomer && grandTotal > 0 && (
        <div
          style={{
            border: '0.5px solid #000',
            padding: '4px',
            fontSize: '9px',
            marginBottom: '8px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold'
            }}
          >
            <span>মোট টাকা:</span>
            <span>৳{grandTotal}</span>
          </div>
        </div>
      )}

      {/* Due Information */}
      {(dueType1 > 0 || dueType2 > 0) && (
        <div
          style={{
            border: '0.5px solid #000',
            padding: '4px',
            fontSize: '9px',
            marginBottom: '8px'
          }}
        >
          <div style={{ marginBottom: '4px', fontSize: '9px', textAlign: 'center', fontWeight: 'bold' }}>
            {isCustomer ? 'ক্রেতার বাকি ক্রেট' : 'সরবরাহকারীকে দিতে হবে'}
          </div>
          
          {dueType1 > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
              <span>টাইপ ১:</span>
              <span>{dueType1} টি</span>
            </div>
          )}
          
          {dueType2 > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>টাইপ ২:</span>
              <span>{dueType2} টি</span>
            </div>
          )}
        </div>
      )}

      {/* Note if available */}
      {transactionData?.note && (
        <div
          style={{
            border: '0.5px solid #000',
            padding: '4px',
            fontSize: '8px',
            marginBottom: '8px'
          }}
        >
          <div style={{ marginBottom: '2px', fontWeight: 'bold' }}>নোট:</div>
          <div>{transactionData.note}</div>
        </div>
      )}

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

export default CrateTransactionInvoice
