#!/usr/bin/env node

/**
 * Script para comparar respostas entre sua API e o json-server
 * Útil para validar se sua implementação está retornando dados corretos
 */

const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3000/api';
const JSON_SERVER_URL = 'http://localhost:3004';

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

async function fetchData(url) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response
        ? `${error.response.status}: ${error.response.statusText}`
        : error.message,
    };
  }
}

function compareProducts(apiProduct, jsonProduct) {
  const differences = [];

  const fieldsToCompare = [
    'id',
    'name',
    'brand',
    'price',
    'category',
    'product_type',
  ];

  fieldsToCompare.forEach(field => {
    if (apiProduct[field] !== jsonProduct[field]) {
      differences.push({
        field,
        api: apiProduct[field],
        json: jsonProduct[field],
      });
    }
  });

  return differences;
}

async function compareProductById(productId) {
  log(`\n🔍 Comparando produto ID: ${productId}`, 'blue');

  const [apiResult, jsonResult] = await Promise.all([
    fetchData(`${API_BASE_URL}/product/${productId}`),
    fetchData(`${JSON_SERVER_URL}/products/${productId}`),
  ]);

  if (!apiResult.success) {
    log(`❌ API: ${apiResult.error}`, 'red');
  }

  if (!jsonResult.success) {
    log(`❌ JSON Server: ${jsonResult.error}`, 'red');
    return;
  }

  if (!apiResult.success) {
    log(
      `⚠️  Produto não encontrado na API, mas existe no JSON Server`,
      'yellow'
    );
    log(`📋 Dados do JSON Server:`, 'blue');
    console.log(JSON.stringify(jsonResult.data, null, 2));
    return;
  }

  const differences = compareProducts(apiResult.data, jsonResult.data);

  if (differences.length === 0) {
    log(`✅ Produto ${productId}: Dados idênticos`, 'green');
  } else {
    log(
      `⚠️  Produto ${productId}: ${differences.length} diferenças encontradas`,
      'yellow'
    );
    differences.forEach(diff => {
      log(
        `  ${diff.field}: API="${diff.api}" vs JSON="${diff.json}"`,
        'yellow'
      );
    });
  }
}

async function compareAllProducts() {
  log(`\n📊 Comparando lista de produtos`, 'blue');

  const [apiResult, jsonResult] = await Promise.all([
    fetchData(`${API_BASE_URL}/products`),
    fetchData(`${JSON_SERVER_URL}/products`),
  ]);

  if (!apiResult.success) {
    log(`❌ API: ${apiResult.error}`, 'red');
    return;
  }

  if (!jsonResult.success) {
    log(`❌ JSON Server: ${jsonResult.error}`, 'red');
    return;
  }

  const apiCount = Array.isArray(apiResult.data) ? apiResult.data.length : 0;
  const jsonCount = Array.isArray(jsonResult.data) ? jsonResult.data.length : 0;

  log(`📈 Contagem de produtos:`, 'blue');
  log(`  API: ${apiCount} produtos`, apiCount > 0 ? 'green' : 'red');
  log(`  JSON Server: ${jsonCount} produtos`, 'blue');

  if (apiCount === 0 && jsonCount > 0) {
    log(
      `💡 Sugestão: Implemente a rota GET /products para retornar os produtos`,
      'yellow'
    );
  }
}

async function testSearchFunctionality() {
  log(`\n🔍 Testando funcionalidades de busca`, 'blue');

  // Buscar produtos da marca Dior no JSON Server
  const jsonDiorProducts = await fetchData(
    `${JSON_SERVER_URL}/products?brand=dior`
  );

  if (jsonDiorProducts.success && jsonDiorProducts.data.length > 0) {
    log(
      `📋 JSON Server tem ${jsonDiorProducts.data.length} produtos Dior`,
      'blue'
    );

    // Testar busca na API
    const apiBrandSearch = await fetchData(
      `${API_BASE_URL}/products/brand/?brand=dior`
    );

    if (apiBrandSearch.success) {
      const apiCount = Array.isArray(apiBrandSearch.data)
        ? apiBrandSearch.data.length
        : 0;
      log(`✅ API busca por marca: ${apiCount} produtos encontrados`, 'green');
    } else {
      log(`❌ API busca por marca: ${apiBrandSearch.error}`, 'red');
      log(`💡 Implemente a rota GET /products/brand/?brand=dior`, 'yellow');
    }

    // Testar busca por nome
    const apiNameSearch = await fetchData(
      `${API_BASE_URL}/products/name?name=nail`
    );

    if (apiNameSearch.success) {
      const apiCount = Array.isArray(apiNameSearch.data)
        ? apiNameSearch.data.length
        : 0;
      log(`✅ API busca por nome: ${apiCount} produtos encontrados`, 'green');
    } else {
      log(`❌ API busca por nome: ${apiNameSearch.error}`, 'red');
      log(`💡 Implemente a rota GET /products/name?name=nail`, 'yellow');
    }
  }
}

async function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    comparison: {
      products: {},
      search: {},
      summary: {},
    },
  };

  // Salvar relatório
  fs.writeFileSync(
    'api-comparison-report.json',
    JSON.stringify(report, null, 2)
  );
  log(`📄 Relatório salvo em: api-comparison-report.json`, 'green');
}

async function main() {
  log('🔄 Iniciando comparação entre APIs...', 'bold');
  log('=====================================', 'blue');

  // Verificar se os serviços estão rodando
  const jsonServerCheck = await fetchData(`${JSON_SERVER_URL}/products`);
  if (!jsonServerCheck.success) {
    log('❌ JSON Server não está rodando. Execute: npm run json', 'red');
    return;
  }

  // Comparar alguns produtos específicos
  const testProductIds = [740, 730, 729, 728, 168];

  for (const productId of testProductIds) {
    await compareProductById(productId);
  }

  // Comparar lista completa
  await compareAllProducts();

  // Testar funcionalidades de busca
  await testSearchFunctionality();

  // Gerar relatório
  await generateReport();

  log('\n✅ Comparação concluída!', 'green');
  log(
    '💡 Use os dados do JSON Server como referência para implementar sua API',
    'yellow'
  );
}

if (require.main === module) {
  main().catch(error => {
    log(`Erro durante comparação: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { compareProductById, compareAllProducts };
