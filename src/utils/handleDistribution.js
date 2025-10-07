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

      // --- get supplier info ---
      const supplier = suppliersData?.find(s => s.sl === item.supplier_id)

      // --- calculate crate prices for both types ---
      const supplierCrate = supplier?.crate || {}
      const typeOnePrice = supplierCrate.type_one?.price || 0
      const typeTwoPrice = supplierCrate.type_two?.price || 0

      const typeOneQty = item.crate?.type_one || 0
      const typeTwoQty = item.crate?.type_two || 0

      const cratePrice = Number((typeOneQty * typeOnePrice + typeTwoQty * typeTwoPrice).toFixed(2))

      // --- base product total before crate ---
      const productBase = Number(item.cost || 0) * (typeOneQty + typeTwoQty) + expenses

      // --- total calculation ---
      const total = Number((productBase + cratePrice).toFixed(2))

      return {
        ...item,
        transportation: transportationValue,
        moshjid: moshjidValue,
        van_vara: vanVaraValue,
        trading_post: tradingPostValue,
        labour: labourValue,
        expenses: Number(expenses.toFixed(2)),
        cratePrice,
        total
      }
    })
  )
}
