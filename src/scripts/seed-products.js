require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Product, database } = require('../db');

/**
 * Script para popular o banco de dados com produtos do arquivo db.json
 * Este script lê os produtos do arquivo JSON e os insere no banco de dados PostgreSQL
 */

// Categorias de teste para vincular aos produtos
const testCategories = [
  {
    id: 1,
    name: 'Maquiagem para Olhos',
    description: 'Produtos para realçar e definir os olhos',
    product_types: ['mascara', 'eyeshadow', 'eyeliner'],
    active: true,
  },
  {
    id: 2,
    name: 'Maquiagem para Lábios',
    description: 'Produtos para colorir e hidratar os lábios',
    product_types: ['lipstick', 'lip_gloss', 'lip_liner'],
    active: true,
  },
  {
    id: 3,
    name: 'Base e Corretivos',
    description: 'Produtos para uniformizar e corrigir a pele',
    product_types: ['foundation', 'concealer', 'powder'],
    active: true,
  },
  {
    id: 4,
    name: 'Cuidados com Unhas',
    description: 'Esmaltes e produtos para cuidado das unhas',
    product_types: ['nail_polish'],
    active: true,
  },
  {
    id: 5,
    name: 'Contorno e Iluminação',
    description: 'Produtos para contornar e iluminar o rosto',
    product_types: ['bronzer', 'blush', 'highlighter'],
    active: true,
  },
  {
    id: 6,
    name: 'Produtos Premium',
    description: 'Linha premium com produtos de alta qualidade',
    product_types: ['lipstick', 'foundation', 'mascara'],
    active: true,
  },
];

// Função para determinar a categoria baseada no tipo de produto
const getCategoryForProduct = productType => {
  for (const category of testCategories) {
    if (category.product_types.includes(productType)) {
      return category.id;
    }
  }
  // Categoria padrão para produtos não categorizados
  return 1;
};

const seedProducts = async () => {
  try {
    console.log('🌱 Iniciando seed dos produtos...');

    // Mostrar informações sobre as categorias de teste
    console.log('📂 Categorias de teste disponíveis:');
    testCategories.forEach(category => {
      console.log(`   - ${category.name}: ${category.description}`);
      console.log(
        `     Tipos de produto: ${category.product_types.join(', ')}`
      );
    });
    console.log('');

    // Ler o arquivo db.json
    const dbJsonPath = path.join(__dirname, '../controllers/db.json');
    const rawData = fs.readFileSync(dbJsonPath, 'utf8');
    const data = JSON.parse(rawData);

    if (!data.products || !Array.isArray(data.products)) {
      throw new Error('Arquivo db.json não contém um array de produtos válido');
    }

    console.log(
      `📦 Encontrados ${data.products.length} produtos no arquivo JSON`
    );

    // Sincronizar o banco de dados (criar tabelas se não existirem)
    await database.sync({ force: false });
    console.log('✅ Banco de dados sincronizado');

    // Limpar produtos existentes (opcional - remova se quiser manter dados existentes)
    const existingProductsCount = await Product.count();
    if (existingProductsCount > 0) {
      console.log(
        `🗑️  Removendo ${existingProductsCount} produtos existentes...`
      );

      // Usar CASCADE para remover registros relacionados ou simplesmente DELETE sem TRUNCATE
      // para evitar problemas com foreign key constraints
      try {
        // Primeiro, tentar com truncate e cascade
        await database.query('TRUNCATE TABLE product RESTART IDENTITY CASCADE');
        console.log('✅ Produtos removidos com TRUNCATE CASCADE');
      } catch (truncateError) {
        console.log('⚠️  TRUNCATE falhou, usando DELETE...');
        // Se truncate falhar, usar delete normal
        await Product.destroy({
          where: {},
          force: true, // Para garantir que seja um hard delete
        });
        console.log('✅ Produtos removidos com DELETE');
      }
    }

    // Processar produtos em lotes para melhor performance
    const batchSize = 100;
    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < data.products.length; i += batchSize) {
      const batch = data.products.slice(i, i + batchSize);
      const productsToInsert = [];

      for (const product of batch) {
        try {
          // Mapear os dados do JSON para o formato do modelo
          const productType =
            product.product_type || product.category || 'cosmetic';
          const productData = {
            brand: product.brand || 'Unknown',
            name: product.name || 'Produto sem nome',
            price: parseFloat(product.price) || 0,
            price_sign: product.price_sign || '$',
            currency: product.currency || 'USD',
            image_link: product.image_link || product.api_featured_image || '',
            description: product.description || 'Sem descrição disponível',
            rating: parseFloat(product.rating) || 0,
            product_type: productType,
            category_id: getCategoryForProduct(productType), // Vincular à categoria de teste
            stock: Math.floor(Math.random() * 100) + 1, // Stock aleatório entre 1-100
            tag_list: product.tag_list || [],
            product_colors: product.product_colors || [],
            status: true,
          };

          // Validar dados essenciais
          if (!productData.name || !productData.brand) {
            console.warn(
              `⚠️  Produto inválido ignorado: ${product.id} - ${product.name}`
            );
            skippedCount++;
            continue;
          }

          productsToInsert.push(productData);
        } catch (error) {
          console.warn(
            `⚠️  Erro ao processar produto ${product.id}: ${error.message}`
          );
          skippedCount++;
        }
      }

      // Inserir lote no banco de dados
      if (productsToInsert.length > 0) {
        try {
          await Product.bulkCreate(productsToInsert, {
            validate: true,
            ignoreDuplicates: true,
          });
          insertedCount += productsToInsert.length;
          console.log(
            `✅ Lote ${Math.floor(i / batchSize) + 1}: ${productsToInsert.length} produtos inseridos`
          );
        } catch (error) {
          console.error(
            `❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`,
            error.message
          );

          // Tentar inserir produtos individualmente se o lote falhar
          for (const productData of productsToInsert) {
            try {
              await Product.create(productData);
              insertedCount++;
            } catch (individualError) {
              console.warn(
                `⚠️  Erro ao inserir produto individual: ${productData.name} - ${individualError.message}`
              );
              skippedCount++;
            }
          }
        }
      }
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Produtos inseridos: ${insertedCount}`);
    console.log(`   - Produtos ignorados: ${skippedCount}`);
    console.log(`   - Total processados: ${insertedCount + skippedCount}`);

    // Verificar contagem final no banco
    const finalCount = await Product.count();
    console.log(`   - Produtos no banco: ${finalCount}`);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Fechar conexão com o banco
    await database.close();

    process.exit(0);
  }
};

// Executar o seed se o arquivo for chamado diretamente
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts };
