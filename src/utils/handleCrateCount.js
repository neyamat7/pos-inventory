export const handleBoxCount = (setCartProducts, productId, personId, increment = true) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      if (item.product_id === productId && (item.supplier_id === personId || item.customer_id === personId)) {
        const newCrate = increment ? item.crate + 1 : Math.max(0, item.crate - 1)

        return { ...item, crate: newCrate }
      }

      return item
    })
  )
}

export const handleCrateCount = (setCartProducts, productId, personId, type, value) => {
  setCartProducts(prevCart =>
    prevCart.map(item => {
      if (item.cart_item_id === productId && (item.supplier_id === personId || item.customer_id === personId)) {
        return {
          ...item,
          [`crate_${type}`]: value < 0 ? 0 : value
        }
      }

      return item
    })
  )
}
