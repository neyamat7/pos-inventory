export const filteredProductsData = (productsData, searchTerm = '', selectedCategory = []) => {
  return productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory.length === 0 ||
      selectedCategory.some(category => category.toLowerCase() === product.category.toLowerCase())

    return matchesSearch && matchesCategory
  })
}
