export const handleBoxCount = (setCartProducts, productId, personId, increment = true) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      if (item.product_id === productId && (item.supplier_id === personId || item.customer_id === personId)) {
        const newCrate = increment ? item.crate + 1 : Math.max(0, item.crate - 1)

        // const expenses = item.expenses || 0 // keep current expenses
        // const baseTotal = item.cost * newCrate + expenses

        // const total =
        //   item.product_name.toLowerCase().includes('mango') || item.product_name.toLowerCase().includes('pineapple')
        //     ? (baseTotal * 0.9).toFixed(2)
        //     : baseTotal.toFixed(2)

        return { ...item, crate: newCrate }
      }

      return item
    })
  )
}
