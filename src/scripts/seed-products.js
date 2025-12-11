require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Product, database } = require('../db');

/**
 * Script para popular o banco de dados com produtos do arquivo db.json
 * Este script lê os produtos do arquivo JSON e os insere no banco de dados PostgreSQL
 */

const seedProducts = async () => {
  try {
    console.log('🌱 Iniciando seed dos produtos...');

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
      await Product.destroy({ where: {}, truncate: true });
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
          const productData = {
            brand: product.brand || 'Unknown',
            name: product.name || 'Produto sem nome',
            price: parseFloat(product.price) || 0,
            price_sign: product.price_sign || '$',
            currency: product.currency || 'USD',
            image_link: product.image_link || product.api_featured_image || '',
            description: product.description || 'Sem descrição disponível',
            rating: parseFloat(product.rating) || 0,
            product_type:
              product.product_type || product.category || 'cosmetic',
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
    console.log('🔌 Conexão com banco fechada');
    process.exit(0);
  }
};

// Executar o seed se o arquivo for chamado diretamente
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts };
