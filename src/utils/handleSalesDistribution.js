const calculateExpenseValue = (amount, type, totalItems) => {
  if (type === 'divided') {
    return Number((Number(amount) / totalItems).toFixed(2))
  }

  return Number(Number(amount).toFixed(2))
}

export const handleSalesDistributionExpense = (data, cartProducts, setCartProducts) => {
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

      const total = (
        item.product_name.toLowerCase().includes('mango') || item.product_name.toLowerCase().includes('pineapple')
          ? (item.cost * item.box + expenses) * 1.1
          : item.cost * item.box + expenses
      ).toFixed(2)

      return {
        ...item,
        transportation: transportationValue,
        moshjid: moshjidValue,
        van_vara: vanVaraValue,
        trading_post: tradingPostValue,
        labour: labourValue,
        expenses: expenses,
        total: total
      }
    })
  )
}
