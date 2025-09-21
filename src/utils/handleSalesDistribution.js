const calculateExpenseValue = (amount, type, totalItems) => {
  if (type === 'divided') {
    return Number((Number(amount) / totalItems).toFixed(2))
  }

  return Number(Number(amount).toFixed(2))
}

export const handleSalesDistributionExpense = (data, cartProducts, setCartProducts, customers) => {
  // console.log('Form data:', data)

  // calculate expense values
  const transportationValue = calculateExpenseValue(
    data.transportationAmount,
    data.transportationType,
    cartProducts.length
  )

  const moshjidValue = calculateExpenseValue(data.moshjidAmount, data.moshjidType, cartProducts.length)

  const vanVaraValue = calculateExpenseValue(data.vanVaraAmount, data.vanVaraType, cartProducts.length)

  const tradingPostValue = calculateExpenseValue(data.tradingPostAmount, data.tradingPostType, cartProducts.length)

  const labourValue = calculateExpenseValue(data.labourAmount, data.labourType, cartProducts.length)

  // ✅ update cartProducts with distributed expenses
  setCartProducts(prevCart =>
    prevCart.map(item => {
      const expenses = transportationValue + moshjidValue + vanVaraValue + tradingPostValue + labourValue

      // --- crate price from supplier data ---
      const customer = customers?.find(s => s.sl === item.customer_id)

      console.log('customer', customer)

      const crateKey = item.crateType

      console.log('item pos', item)

      console.log('crateKey pos', crateKey)

      const crateUnitPrice = crateKey && customer?.crate?.[crateKey]?.price ? Number(customer.crate[crateKey].price) : 0

      console.log('crateUnitPrice', crateUnitPrice)

      const crateQty = Number(item.crate) || 0
      const cratePrice = Number((crateUnitPrice * crateQty).toFixed(2))

      // --- base product total before commission ---
      const productBase = Number(item.cost) * Number(item.crate) + expenses

      const isCommissioned =
        (item.product_name || '').toLowerCase().includes('mango') ||
        (item.product_name || '').toLowerCase().includes('pineapple')

      const commissionRate = isCommissioned ? item.commission_rate / 100 || 0.1 : 0
      const commissionAmount = Number((productBase * commissionRate).toFixed(2))

      console.log('producbase', productBase)
      console.log('commissionAmount', commissionAmount)

      // Apply commission (10%) to productBase ONLY, then add cratePrice without commission
      const productAfterCommission = isCommissioned
        ? Number((productBase * (1 + commissionRate)).toFixed(2))
        : productBase

      console.log('productAfterCommission', productAfterCommission)

      const total = Number((productAfterCommission + cratePrice).toFixed(2))

      return {
        ...item,
        transportation: transportationValue,
        moshjid: moshjidValue,
        van_vara: vanVaraValue,
        trading_post: tradingPostValue,
        labour: labourValue,
        expenses: Number(expenses.toFixed(2)),
        commission: commissionAmount,
        cratePrice,
        total: total
      }
    })
  )
}
