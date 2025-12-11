/* GET DETAIL PRODUCT - SIMPLIFIED VERSION FOR TESTING */
const getDetailProduct = async (req, res, next) => {
  const id = req.params.id;

  try {
    // Mock data para teste
    const mockProducts = {
      1: {
        id: 1,
        name: 'iPhone 14 Pro',
        brand: 'Apple',
        category: 'electronics',
        price: 999,
        rating: 4.9,
        description:
          'The most advanced iPhone yet with Pro camera system and A16 Bionic chip.',
        image_link: 'https://example.com/iphone14pro.jpg',
        stock: 50,
        status: true,
        categories: [{ name: 'electronics' }],
        oferts: [
          {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: true,
            image: 'https://example.com/offer.jpg',
            description: 'Special discount',
            discountPercent: 10,
          },
        ],
      },
      2: {
        id: 2,
        name: 'MacBook Air M2',
        brand: 'Apple',
        category: 'computers',
        price: 1299,
        rating: 4.8,
        description:
          'Supercharged by M2 chip. Incredibly thin and light design.',
        image_link: 'https://example.com/macbookair.jpg',
        stock: 30,
        status: true,
        categories: [{ name: 'computers' }],
        oferts: [],
      },
    };

    const mockReviews = {
      1: [
        {
          title: 'Excellent phone!',
          text: 'Amazing camera quality and performance.',
          score: 5,
          user_id: 1,
        },
        {
          title: 'Great but expensive',
          text: 'Love the features but price is high.',
          score: 4,
          user_id: 2,
        },
      ],
      2: [
        {
          title: 'Perfect laptop',
          text: 'Fast, lightweight and great battery life.',
          score: 5,
          user_id: 3,
        },
      ],
    };

    const product = mockProducts[id];
    const reviews = mockReviews[id] || [];

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        endpoint: '/api/product/:id',
      });
    }

    // Calcular preço com desconto se houver oferta
    const priceOfert =
      product.oferts.length > 0
        ? product.price -
          (product.price * product.oferts[0].discountPercent) / 100
        : product.price;

    const dbInfo = { ...product, priceOfert };

    res.status(200).json({
      success: true,
      message: 'Product details retrieved successfully',
      data: { dbInfo, reviews },
      endpoint: '/api/product/:id',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      endpoint: '/api/product/:id',
    });
  }
};

module.exports = { getDetailProduct };
