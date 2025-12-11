#!/usr/bin/env node

/**
 * Script de teste automatizado para a API
 * Usa os dados do json-server para testar todas as rotas
 */

const axios = require('axios');

// Configurações
const API_BASE_URL = 'http://localhost:3000/api';
const JSON_SERVER_URL = 'http://localhost:3004';

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  const statusColor =
    status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`[${status}] ${testName}`, statusColor);
  if (details) {
    log(`  ${details}`, 'blue');
  }
}

async function testEndpoint(method, url, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url,
      timeout: 5000,
    };

    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }

    const response = await axios(config);

    if (response.status === expectedStatus) {
      return { success: true, data: response.data, status: response.status };
    } else {
      return {
        success: false,
        error: `Expected ${expectedStatus}, got ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response
        ? `${error.response.status}: ${error.response.statusText}`
        : error.message,
    };
  }
}

async function getTestProducts() {
  try {
    const response = await axios.get(`${JSON_SERVER_URL}/products`);
    return response.data.slice(0, 5); // Pegar apenas os primeiros 5 produtos
  } catch (error) {
    log('Erro ao buscar produtos de teste do json-server', 'red');
    return [];
  }
}

async function runTests() {
  log('🚀 Iniciando testes da API...', 'bold');
  log('=====================================', 'blue');

  // Verificar se json-server está rodando
  log('\n📋 Verificando json-server...', 'yellow');
  const jsonServerTest = await testEndpoint(
    'GET',
    `${JSON_SERVER_URL}/products`
  );
  if (!jsonServerTest.success) {
    log('❌ JSON Server não está rodando. Execute: npm run json', 'red');
    return;
  }
  logTest(
    'JSON Server',
    'PASS',
    `${jsonServerTest.data.length} produtos disponíveis`
  );

  // Buscar produtos de teste
  const testProducts = await getTestProducts();
  const testProductId = testProducts.length > 0 ? testProducts[0].id : 740;

  log('\n🛍️ TESTANDO ROTAS DE PRODUTOS', 'bold');
  log('=====================================', 'blue');

  // GET /products
  const getAllProducts = await testEndpoint('GET', `${API_BASE_URL}/products`);
  logTest(
    'GET /products',
    getAllProducts.success ? 'PASS' : 'FAIL',
    getAllProducts.success
      ? `${getAllProducts.data?.length || 0} produtos retornados`
      : getAllProducts.error
  );

  // GET /products/dashboard
  const getDashboard = await testEndpoint(
    'GET',
    `${API_BASE_URL}/products/dashboard`
  );
  logTest(
    'GET /products/dashboard',
    getDashboard.success ? 'PASS' : 'FAIL',
    getDashboard.error
  );

  // GET /products/productType
  const getProductType = await testEndpoint(
    'GET',
    `${API_BASE_URL}/products/productType`
  );
  logTest(
    'GET /products/productType',
    getProductType.success ? 'PASS' : 'FAIL',
    getProductType.error
  );

  // GET /product/:id
  const getProductById = await testEndpoint(
    'GET',
    `${API_BASE_URL}/product/${testProductId}`
  );
  logTest(
    `GET /product/${testProductId}`,
    getProductById.success ? 'PASS' : 'FAIL',
    getProductById.error
  );

  // POST /products (criar produto)
  const newProduct = {
    brand: 'test-brand',
    name: 'Produto Teste API',
    price: '25.99',
    price_sign: '$',
    currency: 'USD',
    description: 'Produto criado durante teste automatizado',
    category: 'test',
    product_type: 'test_product',
  };
  const createProduct = await testEndpoint(
    'POST',
    `${API_BASE_URL}/products`,
    newProduct,
    201
  );
  logTest(
    'POST /products',
    createProduct.success ? 'PASS' : 'FAIL',
    createProduct.error
  );

  log('\n🔍 TESTANDO ROTAS DE BUSCA', 'bold');
  log('=====================================', 'blue');

  // GET /products/name
  const searchByName = await testEndpoint(
    'GET',
    `${API_BASE_URL}/products/name?name=dior`
  );
  logTest(
    'GET /products/name',
    searchByName.success ? 'PASS' : 'FAIL',
    searchByName.error
  );

  // GET /products/search
  const searchProducts = await testEndpoint(
    'GET',
    `${API_BASE_URL}/products/search/?q=nail`
  );
  logTest(
    'GET /products/search',
    searchProducts.success ? 'PASS' : 'FAIL',
    searchProducts.error
  );

  // GET /products/brand
  const searchByBrand = await testEndpoint(
    'GET',
    `${API_BASE_URL}/products/brand/?brand=dior`
  );
  logTest(
    'GET /products/brand',
    searchByBrand.success ? 'PASS' : 'FAIL',
    searchByBrand.error
  );

  // GET /products/rating
  const searchByRating = await testEndpoint(
    'GET',
    `${API_BASE_URL}/products/rating/?rating=3.5`
  );
  logTest(
    'GET /products/rating',
    searchByRating.success ? 'PASS' : 'FAIL',
    searchByRating.error
  );

  // GET /products/price (ordenação)
  const orderByPrice = await testEndpoint(
    'GET',
    `${API_BASE_URL}/products/price/?order=asc`
  );
  logTest(
    'GET /products/price',
    orderByPrice.success ? 'PASS' : 'FAIL',
    orderByPrice.error
  );

  log('\n📦 TESTANDO ROTAS DE CATEGORIAS', 'bold');
  log('=====================================', 'blue');

  // GET /categories
  const getCategories = await testEndpoint('GET', `${API_BASE_URL}/categories`);
  logTest(
    'GET /categories',
    getCategories.success ? 'PASS' : 'FAIL',
    getCategories.error
  );

  // GET /categorie/:id
  const getCategoryById = await testEndpoint(
    'GET',
    `${API_BASE_URL}/categorie/1`
  );
  logTest(
    'GET /categorie/1',
    getCategoryById.success ? 'PASS' : 'FAIL',
    getCategoryById.error
  );

  log('\n🛒 TESTANDO ROTAS DE PEDIDOS', 'bold');
  log('=====================================', 'blue');

  // GET /orders
  const getOrders = await testEndpoint('GET', `${API_BASE_URL}/orders`);
  logTest('GET /orders', getOrders.success ? 'PASS' : 'FAIL', getOrders.error);

  log('\n👥 TESTANDO ROTAS DE USUÁRIOS', 'bold');
  log('=====================================', 'blue');

  // GET /users
  const getUsers = await testEndpoint('GET', `${API_BASE_URL}/users`);
  logTest('GET /users', getUsers.success ? 'PASS' : 'FAIL', getUsers.error);

  log('\n🏷️ TESTANDO ROTAS DE ROLES', 'bold');
  log('=====================================', 'blue');

  // GET /rol
  const getRoles = await testEndpoint('GET', `${API_BASE_URL}/rol`);
  logTest('GET /rol', getRoles.success ? 'PASS' : 'FAIL', getRoles.error);

  log('\n📊 RESUMO DOS TESTES', 'bold');
  log('=====================================', 'blue');
  log('✅ Testes concluídos!', 'green');
  log('💡 Para mais detalhes, consulte docs/API-TESTING.md', 'yellow');
  log('🔧 Para testar manualmente, use Postman ou curl', 'yellow');
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runTests().catch(error => {
    log(`Erro durante execução dos testes: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint };
