require('dotenv').config();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { Rol, User, Categorie, Product, database } = require('../db');

/**
 * Script completo para popular o banco de dados com todos os dados necessários
 * - Roles (Admin, User, Moderator)
 * - Usuário Admin de teste
 * - Categorias para produtos
 * - Produtos do arquivo db.json
 */

// Roles iniciais
const initialRoles = [
  {
    id: 1,
    rolName: 'admin',
    status: true,
  },
  {
    id: 2,
    rolName: 'user',
    status: true,
  },
  {
    id: 3,
    rolName: 'moderator',
    status: true,
  },
];

// Usuário admin de teste
const adminUser = {
  nickname: 'admin',
  name: 'Administrador do Sistema',
  email: 'admin@tuspacio.com',
  password: 'admin123', // Será hasheada
  email_verified: true,
  picture: null,
  address: 'Endereço do Admin',
  status: true,
  rol_id: 1, // Role de admin
};

// Categorias iniciais para produtos
const initialCategories = [
  {
    id: 1,
    name: 'Maquiagem para Olhos',
  },
  {
    id: 2,
    name: 'Maquiagem para Lábios',
  },
  {
    id: 3,
    name: 'Base e Corretivos',
  },
  {
    id: 4,
    name: 'Cuidados com Unhas',
  },
  {
    id: 5,
    name: 'Contorno e Iluminação',
  },
  {
    id: 6,
    name: 'Produtos Premium',
  },
  {
    id: 7,
    name: 'Cuidados com a Pele',
  },
  {
    id: 8,
    name: 'Perfumes e Fragrâncias',
  },
  {
    id: 9,
    name: 'Acessórios de Beleza',
  },
  {
    id: 10,
    name: 'Produtos Naturais',
  },
];

// Mapeamento de tipos de produto para categorias
const productTypeToCategoryMap = {
  mascara: 1,
  eyeshadow: 1,
  eyeliner: 1,
  lipstick: 2,
  lip_gloss: 2,
  lip_liner: 2,
  foundation: 3,
  concealer: 3,
  powder: 3,
  nail_polish: 4,
  bronzer: 5,
  blush: 5,
  highlighter: 5,
};

// Função para determinar a categoria baseada no tipo de produto
const getCategoryForProduct = productType => {
  return productTypeToCategoryMap[productType] || 1; // Categoria padrão
};

const seedCompleteData = async () => {
  try {
    console.log('🌱 Iniciando seed completo do banco de dados...');

    // Sincronizar o banco de dados
    await database.sync({ force: false });
    console.log('✅ Banco de dados sincronizado');

    // 1. Seed dos Roles
    console.log('\n👥 Criando roles...');
    for (const roleData of initialRoles) {
      try {
        const [role, created] = await Rol.findOrCreate({
          where: { rolName: roleData.rolName },
          defaults: roleData,
        });

        if (created) {
          console.log(`   ✅ Role criado: ${role.rolName}`);
        } else {
          console.log(`   ℹ️  Role já existe: ${role.rolName}`);
        }
      } catch (error) {
        console.error(
          `   ❌ Erro ao criar role ${roleData.rolName}:`,
          error.message
        );
      }
    }

    // 2. Seed do Usuário Admin
    console.log('\n👤 Criando usuário admin...');
    try {
      const existingAdmin = await User.findOne({
        where: { email: adminUser.email },
      });

      if (existingAdmin) {
        console.log('   ℹ️  Usuário admin já existe');
      } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
          adminUser.password,
          saltRounds
        );

        const admin = await User.create({
          ...adminUser,
          password: hashedPassword,
        });

        console.log(`   ✅ Usuário admin criado: ${admin.email}`);
        console.log(
          `   🔑 Credenciais: ${adminUser.email} / ${adminUser.password}`
        );
      }
    } catch (error) {
      console.error('   ❌ Erro ao criar usuário admin:', error.message);
    }

    // 3. Seed das Categorias
    console.log('\n📂 Criando categorias...');
    for (const categoryData of initialCategories) {
      try {
        const [category, created] = await Categorie.findOrCreate({
          where: { name: categoryData.name },
          defaults: categoryData,
        });

        if (created) {
          console.log(`   ✅ Categoria criada: ${category.name}`);
        } else {
          console.log(`   ℹ️  Categoria já existe: ${category.name}`);
        }
      } catch (error) {
        console.error(
          `   ❌ Erro ao criar categoria ${categoryData.name}:`,
          error.message
        );
      }
    }

    // 4. Seed dos Produtos (se o arquivo db.json existir)
    console.log('\n📦 Verificando produtos...');
    const dbJsonPath = path.join(__dirname, '../controllers/db.json');

    if (fs.existsSync(dbJsonPath)) {
      console.log('   📄 Arquivo db.json encontrado, carregando produtos...');

      try {
        const rawData = fs.readFileSync(dbJsonPath, 'utf8');
        const data = JSON.parse(rawData);

        if (data.products && Array.isArray(data.products)) {
          console.log(
            `   📦 Encontrados ${data.products.length} produtos no arquivo JSON`
          );

          // Verificar se já existem produtos
          const existingProductsCount = await Product.count();
          if (existingProductsCount > 0) {
            console.log(
              `   ℹ️  ${existingProductsCount} produtos já existem no banco`
            );
          } else {
            console.log('   🔄 Inserindo produtos...');

            // Processar produtos em lotes
            const batchSize = 50;
            let insertedCount = 0;
            let skippedCount = 0;

            for (let i = 0; i < data.products.length; i += batchSize) {
              const batch = data.products.slice(i, i + batchSize);
              const productsToInsert = [];

              for (const product of batch) {
                try {
                  const productType =
                    product.product_type || product.category || 'cosmetic';
                  const productData = {
                    brand: product.brand || 'Unknown',
                    name: product.name || 'Produto sem nome',
                    price: parseFloat(product.price) || 0,
                    price_sign: product.price_sign || '$',
                    currency: product.currency || 'USD',
                    image_link:
                      product.image_link || product.api_featured_image || '',
                    description:
                      product.description || 'Sem descrição disponível',
                    rating: parseFloat(product.rating) || 0,
                    product_type: productType,
                    category_id: getCategoryForProduct(productType),
                    stock: Math.floor(Math.random() * 100) + 1,
                    tag_list: product.tag_list || [],
                    product_colors: product.product_colors || [],
                    status: true,
                  };

                  if (productData.name && productData.brand) {
                    productsToInsert.push(productData);
                  } else {
                    skippedCount++;
                  }
                } catch (error) {
                  skippedCount++;
                }
              }

              if (productsToInsert.length > 0) {
                try {
                  await Product.bulkCreate(productsToInsert, {
                    validate: true,
                    ignoreDuplicates: true,
                  });
                  insertedCount += productsToInsert.length;
                  console.log(
                    `   ✅ Lote ${Math.floor(i / batchSize) + 1}: ${productsToInsert.length} produtos inseridos`
                  );
                } catch (error) {
                  console.error(
                    `   ❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`,
                    error.message
                  );
                  skippedCount += productsToInsert.length;
                }
              }
            }

            console.log(`   📊 Produtos inseridos: ${insertedCount}`);
            console.log(`   ⚠️  Produtos ignorados: ${skippedCount}`);
          }
        } else {
          console.log('   ⚠️  Arquivo db.json não contém produtos válidos');
        }
      } catch (error) {
        console.error('   ❌ Erro ao processar produtos:', error.message);
      }
    } else {
      console.log(
        '   ℹ️  Arquivo db.json não encontrado, pulando seed de produtos'
      );
    }

    // 5. Estatísticas finais
    console.log('\n📊 Estatísticas finais:');
    const rolesCount = await Rol.count();
    const usersCount = await User.count();
    const categoriesCount = await Categorie.count();
    const productsCount = await Product.count();

    console.log(`   - Roles: ${rolesCount}`);
    console.log(`   - Usuários: ${usersCount}`);
    console.log(`   - Categorias: ${categoriesCount}`);
    console.log(`   - Produtos: ${productsCount}`);

    console.log('\n🎉 Seed completo concluído com sucesso!');

    if (usersCount > 0) {
      console.log('\n🔐 Credenciais do Admin:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Senha: ${adminUser.password}`);
    }
  } catch (error) {
    console.error('❌ Erro durante o seed completo:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await database.close();
    process.exit(0);
  }
};

// Executar o seed se o arquivo for chamado diretamente
if (require.main === module) {
  seedCompleteData();
}

module.exports = { seedCompleteData };
