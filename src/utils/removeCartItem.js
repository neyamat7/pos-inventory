export const removeCartItem = (setCartProducts, productId, personId) => {
  setCartProducts(prevCart =>
    prevCart.filter(item => !(item.product_id === productId && item.customer_id === personId))
  )
}
