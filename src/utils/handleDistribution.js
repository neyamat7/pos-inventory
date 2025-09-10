const calculateExpenseValue = (amount, type, totalItems) => {
  console.log('type of amount:', typeof amount)
  console.log('type of type:', typeof type)
  console.log('type of totalItems:', typeof totalItems)

  if (type === 'divided') {
    return Number(amount) / totalItems
  }

  return Number(amount)
}

export const handleDistributionExpense = (data, cartProducts, setCartProducts) => {
  console.log('Form data:', data)

  // calculate expense values
  const transportationValue = calculateExpenseValue(
    data.transportationAmount,
    data.transportationType,
    cartProducts.length
  )

  console.log('type of vanvara', typeof data.van_varaAmount)
  console.log('type of trading post', typeof data.trading_postAmount)

  const moshjidValue = calculateExpenseValue(data.moshjidAmount, data.moshjidType, cartProducts.length)

  const vanVaraValue = calculateExpenseValue(data.vanVaraAmount, data.vanVaraType, cartProducts.length)

  const tradingPostValue = calculateExpenseValue(data.tradingPostAmount, data.tradingPostType, cartProducts.length)

  const labourValue = calculateExpenseValue(data.labourAmount, data.labourType, cartProducts.length)

  // ✅ update cartProducts with distributed expenses
  setCartProducts(prevCart =>
    prevCart.map(item => ({
      ...item,
      transportation: transportationValue,
      moshjid: moshjidValue,
      van_vara: vanVaraValue,
      trading_post: tradingPostValue,
      labour: labourValue,
      expenses: transportationValue + moshjidValue + vanVaraValue + tradingPostValue + labourValue
    }))
  )
}
