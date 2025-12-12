/* ORDER PRODUCTS BY NAME - SIMPLIFIED VERSION FOR TESTING */
const orderProductsName = async (req, res, next) => {
  const { alpha } = req.query;

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

    const sortedProducts = [...mockProducts];

    if (alpha === 'asc') {
      sortedProducts.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    } else if (alpha === 'desc') {
      sortedProducts.sort((a, b) =>
        b.name.toLowerCase().localeCompare(a.name.toLowerCase())
      );
    } else if (!alpha) {
      return res.status(400).json({
        success: false,
        message: 'Please specify alpha parameter (asc or desc)',
        availableParams: ['asc', 'desc'],
        endpoint: '/api/products/orderName/',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Products ordered by name successfully',
      data: sortedProducts,
      count: sortedProducts.length,
      filters: { alpha },
      endpoint: '/api/products/orderName/',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/api/products/orderName/',
    });
  }
};

module.exports = {
  orderProductsName,
};
