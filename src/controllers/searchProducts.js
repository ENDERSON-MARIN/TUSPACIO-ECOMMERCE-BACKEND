/* SEARCH PRODUCTS - SIMPLIFIED VERSION FOR TESTING */
const getSearchProducts = async (req, res, next) => {
  const { categorie, product_type, name } = req.query;

  try {
    // Mock data para teste
    const mockProducts = [
      {
        id: 1,
        name: 'iPhone 14 Pro',
        brand: 'Apple',
        category: 'electronics',
        product_type: 'smartphone',
        price: 999,
        rating: 4.8,
      },
      {
        id: 2,
        name: 'Samsung Galaxy S23',
        brand: 'Samsung',
        category: 'electronics',
        product_type: 'smartphone',
        price: 899,
        rating: 4.7,
      },
      {
        id: 3,
        name: 'MacBook Air M2',
        brand: 'Apple',
        category: 'computers',
        product_type: 'laptop',
        price: 1299,
        rating: 4.9,
      },
      {
        id: 4,
        name: 'Dell XPS 13',
        brand: 'Dell',
        category: 'computers',
        product_type: 'laptop',
        price: 1199,
        rating: 4.6,
      },
      {
        id: 5,
        name: 'Sony WH-1000XM4',
        brand: 'Sony',
        category: 'electronics',
        product_type: 'headphones',
        price: 349,
        rating: 4.8,
      },
      {
        id: 6,
        name: 'AirPods Pro',
        brand: 'Apple',
        category: 'electronics',
        product_type: 'headphones',
        price: 249,
        rating: 4.7,
      },
      {
        id: 7,
        name: 'iPad Air',
        brand: 'Apple',
        category: 'electronics',
        product_type: 'tablet',
        price: 599,
        rating: 4.8,
      },
      {
        id: 8,
        name: 'Surface Pro 9',
        brand: 'Microsoft',
        category: 'computers',
        product_type: 'tablet',
        price: 999,
        rating: 4.5,
      },
    ];

    let filteredProducts = mockProducts;

    if (name) {
      filteredProducts = mockProducts.filter(product =>
        product.name.toLowerCase().includes(name.toLowerCase())
      );
    } else if (product_type) {
      filteredProducts = mockProducts.filter(product =>
        product.product_type?.includes(product_type)
      );
    } else if (categorie) {
      filteredProducts = mockProducts.filter(
        product => product.category === categorie
      );
    } else {
      return res.status(400).json({
        success: false,
        message:
          'You must enter a valid search parameter (name, product_type, or categorie)',
        availableParams: ['name', 'product_type', 'categorie'],
        endpoint: '/api/products/search/',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Products search completed successfully',
      data: filteredProducts,
      count: filteredProducts.length,
      filters: { name, product_type, categorie },
      endpoint: '/api/products/search/',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/api/products/search/',
    });
  }
};
module.exports = {
  getSearchProducts,
};
