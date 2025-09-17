const calculateExpenseValue = (amount, type, totalItems) => {
  if (type === 'divided') {
    return Number((Number(amount) / totalItems).toFixed(2))
  }

  return Number(Number(amount).toFixed(2))
}

export const handleDistributionExpense = (data, cartProducts, setCartProducts, suppliersData = []) => {
  // calculate distributed expense values
  const transportationValue = calculateExpenseValue(
    data.transportationAmount,
    data.transportationType,
    cartProducts.length
  )

  const moshjidValue = calculateExpenseValue(data.moshjidAmount, data.moshjidType, cartProducts.length)
  const vanVaraValue = calculateExpenseValue(data.vanVaraAmount, data.vanVaraType, cartProducts.length)
  const tradingPostValue = calculateExpenseValue(data.tradingPostAmount, data.tradingPostType, cartProducts.length)
  const labourValue = calculateExpenseValue(data.labourAmount, data.labourType, cartProducts.length)

  setCartProducts(prevCart =>
    prevCart.map(item => {
      const expenses = transportationValue + moshjidValue + vanVaraValue + tradingPostValue + labourValue

      // --- crate price from supplier data ---
      const supplier = suppliersData?.find(s => s.sl === item.supplier_id)

      const crateKey = item.crateType

      console.log('item', item)

      console.log('crateKey', crateKey)

      const crateUnitPrice = crateKey && supplier?.crate?.[crateKey]?.price ? Number(supplier.crate[crateKey].price) : 0

      console.log('crateUnitPrice', crateUnitPrice)
      const crateQty = Number(item.crate) || 0
      const cratePrice = Number((crateUnitPrice * crateQty).toFixed(2))

      // --- base product total before commission ---
      const productBase = Number(item.cost) * Number(item.crate) + expenses

      const isCommissioned =
        (item.product_name || '').toLowerCase().includes('mango') ||
        (item.product_name || '').toLowerCase().includes('pineapple')

      const commissionRate = isCommissioned ? 0.1 : 0
      const commissionAmount = Number((productBase * commissionRate).toFixed(2))

      console.log('commissionAmount', commissionAmount)

      console.log('producbase', productBase)

      // Apply commission (10%) to productBase ONLY, then add cratePrice without commission
      const productAfterCommission = isCommissioned
        ? Number((productBase * (1 - commissionRate)).toFixed(2))
        : productBase

      console.log('productAfterCommission', productAfterCommission)

      const total = Number((productAfterCommission + cratePrice).toFixed(2))

      console.log('total', total)
      console.log('crateprice', cratePrice)

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
        total
      }
    })
  )
}
