import { convertToBanglaNumber } from '@/utils/convert-to-bangla'

const DueListPrint = ({ data = [], type = 'customer' }) => {
  const isCustomer = type === 'customer'
  
  // Calculate total
  const totalDue = data.reduce((sum, item) => {
    // For customer: account_info.due (receivable)
    // For supplier: account_info.due (payable)
    const val = Number(item.account_info?.due || item.due || 0)
    
    return sum + val
  }, 0)

  return (
    <div
      className='invoice-content'
      style={{
        fontFamily: "'Hind Siliguri', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
        fontSize: '11px',
        color: '#000',
        backgroundColor: '#fff',
        padding: '0 5px'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px dashed #000', paddingBottom: '5px' }}>
        <h2 style={{ fontSize: '14px', margin: '0 0 5px 0', fontWeight: 'bold' }}>
          {isCustomer ? 'কাস্টমার বকেয়া তালিকা' : 'সাপ্লায়ার পাওনা তালিকা'}
        </h2>
        <div style={{ fontSize: '10px' }}>
          তারিখ: {convertToBanglaNumber(new Date().toLocaleDateString('bn-BD'))}
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '4px 2px', fontSize: '11px' }}>নাম</th>
            <th style={{ textAlign: 'center', padding: '4px 2px', fontSize: '11px' }}>ফোন</th>
            <th style={{ textAlign: 'left', padding: '4px 2px', fontSize: '11px' }}>ঠিকানা</th>
            <th style={{ textAlign: 'right', padding: '4px 2px', fontSize: '11px' }}>
              {isCustomer ? 'বকেয়া' : 'পাওনা'}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'left', padding: '4px 2px', fontSize: '11px' }}>
                {item.basic_info?.name || item.name}
              </td>
              <td style={{ textAlign: 'center', padding: '4px 2px', fontSize: '11px' }}>
                {convertToBanglaNumber(item.contact_info?.phone || item.phone || '')}
              </td>
              <td style={{ textAlign: 'left', padding: '4px 2px', fontSize: '11px' }}>
                {item.contact_info?.location || item.address || item.location || ''}
              </td>
              <td style={{ textAlign: 'right', padding: '4px 2px', fontSize: '11px' }}>
                {convertToBanglaNumber(item.account_info?.due || item.due || 0)}
              </td>
            </tr>
          ))}
        </tbody>
        {/* Total Row */}
        <tfoot>
          <tr>
            <td colSpan={3} style={{ textAlign: 'right', padding: '6px 2px', borderTop: '1px solid #000', fontWeight: 'bold', fontSize: '12px' }}>
              মোট:
            </td>
            <td style={{ textAlign: 'right', padding: '6px 2px', borderTop: '1px solid #000', fontWeight: 'bold', fontSize: '12px' }}>
              {convertToBanglaNumber(totalDue)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default DueListPrint
