/* ORDER PRODUCTS BY PRICE - SIMPLIFIED VERSION FOR TESTING */
const orderProductsPrice = async (req, res, next) => {
  const { orderby, priceMin, priceMax } = req.query;

  try {
    // Mock data para teste
    const mockProducts = [
      {
        id: 1,
        name: 'iPhone 14 Pro',
        brand: 'Apple',
        category: 'electronics',
        price: 999,
        rating: 4.9,
      },
      {
        id: 2,
        name: 'MacBook Air M2',
        brand: 'Apple',
        category: 'computers',
        price: 1299,
        rating: 4.8,
      },
      {
        id: 3,
        name: 'Dell XPS 13',
        brand: 'Dell',
        category: 'computers',
        price: 1199,
        rating: 4.6,
      },
      {
        id: 4,
        name: 'Surface Pro 9',
        brand: 'Microsoft',
        category: 'computers',
        price: 999,
        rating: 4.5,
      },
      {
        id: 5,
        name: 'Samsung Galaxy S23',
        brand: 'Samsung',
        category: 'electronics',
        price: 899,
        rating: 4.7,
      },
      {
        id: 6,
        name: 'iPad Air',
        brand: 'Apple',
        category: 'electronics',
        price: 599,
        rating: 4.4,
      },
      {
        id: 7,
        name: 'Sony WH-1000XM4',
        brand: 'Sony',
        category: 'electronics',
        price: 349,
        rating: 4.8,
      },
      {
        id: 8,
        name: 'AirPods Pro',
        brand: 'Apple',
        category: 'electronics',
        price: 249,
        rating: 4.7,
      },
    ];

    let filteredProducts = [...mockProducts];

    // Filtrar por range de preço se fornecido
    if (priceMin || priceMax) {
      const minPrice = parseFloat(priceMin) || 0;
      const maxPrice = parseFloat(priceMax) || Infinity;
      filteredProducts = mockProducts.filter(
        product => product.price >= minPrice && product.price <= maxPrice
      );
    }

    // Ordenar por preço
    if (orderby === 'max-min') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (orderby === 'min-max') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (!orderby) {
      return res.status(400).json({
        success: false,
        message: 'Please specify orderby parameter (max-min or min-max)',
        availableParams: ['max-min', 'min-max'],
        endpoint: '/api/products/price/',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Products ordered by price successfully',
      data: filteredProducts,
      count: filteredProducts.length,
      filters: { orderby, priceMin, priceMax },
      endpoint: '/api/products/price/',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/api/products/price/',
    });
  }
};
module.exports = {
  orderProductsPrice,
};
