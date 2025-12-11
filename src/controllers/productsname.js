/* GET ALL PRODUCTS NAMES - SIMPLIFIED VERSION FOR TESTING */
const getProductName = async (req, res, next) => {
  try {
    // Mock data para teste - substitua pela consulta ao banco quando necessário
    const mockProductNames = [
      'iPhone 14 Pro',
      'Samsung Galaxy S23',
      'MacBook Air M2',
      'Dell XPS 13',
      'Sony WH-1000XM4',
      'AirPods Pro',
      'iPad Air',
      'Surface Pro 9',
    ];

    res.status(200).json({
      success: true,
      message: 'Product names retrieved successfully',
      data: mockProductNames,
      count: mockProductNames.length,
      endpoint: '/api/products/name',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/api/products/name',
    });
  }
};

module.exports = {
  getProductName,
};
