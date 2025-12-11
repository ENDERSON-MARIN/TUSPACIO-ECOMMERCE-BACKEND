/* GET ALL PRODUCTS BRANDS - SIMPLIFIED VERSION FOR TESTING */
const getProductsBrand = async (req, res, next) => {
  const { brand, categorie } = req.query;

  try {
    // Mock data para teste - substitua pela consulta ao banco quando necessário
    const mockBrands = [
      'Apple',
      'Samsung',
      'Dell',
      'Sony',
      'Microsoft',
      'HP',
      'Lenovo',
      'Asus',
    ];

    // Filtrar por categoria se fornecida
    let filteredBrands = mockBrands;
    if (categorie) {
      // Simular filtro por categoria
      const categoryBrands = {
        electronics: ['Apple', 'Samsung', 'Sony'],
        computers: ['Dell', 'HP', 'Lenovo', 'Asus'],
        mobile: ['Apple', 'Samsung'],
      };
      filteredBrands = categoryBrands[categorie.toLowerCase()] || mockBrands;
    }

    res.status(200).json({
      success: true,
      message: 'Product brands retrieved successfully',
      data: filteredBrands,
      count: filteredBrands.length,
      filters: { brand, categorie },
      endpoint: '/api/products/brand/',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/api/products/brand/',
    });
  }
};

module.exports = {
  getProductsBrand,
};
