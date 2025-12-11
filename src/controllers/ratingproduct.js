/* PRODUCTS BY RATING - SIMPLIFIED VERSION FOR TESTING */
const getRatingProduct = async (req, res, next) => {
  const { ratingBy, ratingMin, ratingMax } = req.query;

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
        name: 'Sony WH-1000XM4',
        brand: 'Sony',
        category: 'electronics',
        price: 349,
        rating: 4.8,
      },
      {
        id: 4,
        name: 'Samsung Galaxy S23',
        brand: 'Samsung',
        category: 'electronics',
        price: 899,
        rating: 4.7,
      },
      {
        id: 5,
        name: 'AirPods Pro',
        brand: 'Apple',
        category: 'electronics',
        price: 249,
        rating: 4.7,
      },
      {
        id: 6,
        name: 'Dell XPS 13',
        brand: 'Dell',
        category: 'computers',
        price: 1199,
        rating: 4.6,
      },
      {
        id: 7,
        name: 'Surface Pro 9',
        brand: 'Microsoft',
        category: 'computers',
        price: 999,
        rating: 4.5,
      },
      {
        id: 8,
        name: 'iPad Air',
        brand: 'Apple',
        category: 'electronics',
        price: 599,
        rating: 4.4,
      },
    ];

    let filteredProducts = [...mockProducts];

    // Filtrar por range de rating se fornecido
    if (ratingMin || ratingMax) {
      const minRating = parseFloat(ratingMin) || 0;
      const maxRating = parseFloat(ratingMax) || 5;
      filteredProducts = mockProducts.filter(
        product => product.rating >= minRating && product.rating <= maxRating
      );
    }

    // Ordenar por rating
    if (ratingBy === 'max-min') {
      filteredProducts.sort((a, b) => b.rating - a.rating);
    } else if (ratingBy === 'min-max') {
      filteredProducts.sort((a, b) => a.rating - b.rating);
    }

    res.status(200).json({
      success: true,
      message: 'Products filtered by rating successfully',
      data: filteredProducts,
      count: filteredProducts.length,
      filters: { ratingBy, ratingMin, ratingMax },
      endpoint: '/api/products/rating/',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/api/products/rating/',
    });
  }
};
module.exports = {
  getRatingProduct,
};
