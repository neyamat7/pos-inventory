export const handleBoxCount = (setCartProducts, productId, personId, increment = true) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      if (item.product_id === productId && (item.supplier_id === personId || item.customer_id === personId)) {
        const newBox = increment ? item.box + 1 : Math.max(0, item.box - 1)

        const expenses = item.expenses || 0 // keep current expenses
        const baseTotal = item.cost * newBox + expenses

        const total =
          item.product_name.toLowerCase().includes('mango') || item.product_name.toLowerCase().includes('pineapple')
            ? (baseTotal * 0.9).toFixed(2)
            : baseTotal.toFixed(2)

        return { ...item, box: newBox, total }
      }

      return item
    })
  )
}
