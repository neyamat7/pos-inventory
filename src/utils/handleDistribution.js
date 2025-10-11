const calculateExpenseValue = (amount, type, totalItems) => {
  if (type === 'divided') {
    return Number((Number(amount) / totalItems).toFixed(2))
  }

  return Number(Number(amount).toFixed(2))
}

export const handleDistributionExpense = (data = {}, cartProducts, setCartProducts, suppliersData = []) => {
  const isDataEmpty = !data || Object.keys(data).length === 0

  setCartProducts(prevCart =>
    prevCart.map(item => {
      // calculate distributed expense values
      const transportationValue = isDataEmpty
        ? item.transportation || 0
        : calculateExpenseValue(data.transportationAmount, data.transportationType, cartProducts.length) || 0

      const moshjidValue = isDataEmpty
        ? item.moshjid || 0
        : calculateExpenseValue(data.moshjidAmount, data.moshjidType, cartProducts.length) || 0

      const vanVaraValue = isDataEmpty
        ? item.van_vara || 0
        : calculateExpenseValue(data.vanVaraAmount, data.vanVaraType, cartProducts.length) || 0

      const tradingPostValue = isDataEmpty
        ? item.trading_post || 0
        : calculateExpenseValue(data.tradingPostAmount, data.tradingPostType, cartProducts.length) || 0

      const labourValue = isDataEmpty
        ? item.labour || 0
        : calculateExpenseValue(data.labourAmount, data.labourType, cartProducts.length) || 0

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
      // const total = Number((productBase + cratePrice).toFixed(2))
      const total = Number(productBase.toFixed(2))

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
