/* ORDER COMBINE - SIMPLIFIED VERSION FOR TESTING */
const orderCombine = async (req, res, next) => {
  const { alpha, category, price, brand, rating } = req.query;

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

    let result = [...mockProducts];

    // Aplicar filtros
    if (category) {
      result = result.filter(product => product.category === category);
    }

    if (brand) {
      result = result.filter(product => product.brand === brand);
    }

    // Aplicar ordenações
    if (alpha) {
      if (alpha === 'asc') {
        result.sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
      } else if (alpha === 'desc') {
        result.sort((a, b) =>
          b.name.toLowerCase().localeCompare(a.name.toLowerCase())
        );
      }
    }

    if (price) {
      if (price === 'asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (price === 'desc') {
        result.sort((a, b) => b.price - a.price);
      }
    }

    if (rating) {
      if (rating === 'asc') {
        result.sort((a, b) => a.rating - b.rating);
      } else if (rating === 'desc') {
        result.sort((a, b) => b.rating - a.rating);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Products filtered and ordered successfully',
      data: result,
      count: result.length,
      filters: { alpha, category, price, brand, rating },
      endpoint: '/api/products/orderCombine/',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/api/products/orderCombine/',
    });
  }
};

module.exports = {
  orderCombine,
};
