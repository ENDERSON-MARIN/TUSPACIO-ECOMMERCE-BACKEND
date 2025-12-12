require('dotenv').config();
const bcrypt = require('bcrypt');
const { Rol, User, Categorie, Product, database } = require('../db');

/**
 * Script para popular o banco de dados com dados iniciais
 * - Roles (Admin, User)
 * - Usuário Admin de teste
 * - Categorias para produtos
 * - Produtos (opcional)
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

const seedInitialData = async () => {
  try {
    console.log('🌱 Iniciando seed dos dados iniciais...');

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
      // Verificar se o usuário admin já existe
      const existingAdmin = await User.findOne({
        where: { email: adminUser.email },
      });

      if (existingAdmin) {
        console.log('   ℹ️  Usuário admin já existe');
      } else {
        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
          adminUser.password,
          saltRounds
        );

        // Criar usuário admin
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

    // 4. Estatísticas finais
    console.log('\n📊 Estatísticas finais:');
    const rolesCount = await Rol.count();
    const usersCount = await User.count();
    const categoriesCount = await Categorie.count();
    const productsCount = await Product.count();

    console.log(`   - Roles: ${rolesCount}`);
    console.log(`   - Usuários: ${usersCount}`);
    console.log(`   - Categorias: ${categoriesCount}`);
    console.log(`   - Produtos: ${productsCount}`);

    console.log('\n🎉 Seed dos dados iniciais concluído com sucesso!');
    console.log('\n🔐 Credenciais do Admin:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Senha: ${adminUser.password}`);
  } catch (error) {
    console.error('❌ Erro durante o seed dos dados iniciais:', error.message);
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
  seedInitialData();
}

module.exports = { seedInitialData };
