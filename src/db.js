require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Importar pg explicitamente para garantir que está disponível
const pg = require('pg');

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT, DATABASE_URL } =
  process.env;

// Configuração do Sequelize
// Suporta tanto DATABASE_URL (NeonDB, Vercel) quanto variáveis individuais (Docker local)
let sequelize;

// Optimized connection pool configuration based on environment
const getPoolConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    max: isProduction ? 15 : 8, // Maximum connections in pool (increased for better concurrency)
    min: isProduction ? 3 : 1, // Minimum connections in pool
    acquire: 60000, // Maximum time to get connection (ms)
    idle: 20000, // Maximum idle time before releasing connection (ms) - reduced for better resource management
    evict: 5000, // Time interval for evicting stale connections (ms) - more frequent cleanup
    handleDisconnects: true, // Automatically handle disconnects
    validate: client => {
      // Validate connections before use
      return !client._ending && !client._destroyed;
    },
  };
};

// SSL configuration for production environments
const getSSLConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    return false;
  }

  return {
    require: true,
    rejectUnauthorized: false, // For cloud providers with self-signed certificates
    ca: process.env.DB_SSL_CA, // Optional: Custom CA certificate
    key: process.env.DB_SSL_KEY, // Optional: Client key
    cert: process.env.DB_SSL_CERT, // Optional: Client certificate
  };
};

// Common Sequelize options
const getSequelizeOptions = () => ({
  dialect: 'postgres',
  dialectModule: pg,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  native: false,
  pool: getPoolConfig(),
  dialectOptions: {
    ssl: getSSLConfig(),
    connectTimeout: 60000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
  },
  retry: {
    max: 3,
    backoffBase: 1000,
    backoffExponent: 1.5,
  },
  benchmark: process.env.NODE_ENV === 'development',
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

if (DATABASE_URL) {
  // Use DATABASE_URL if available (NeonDB, Vercel, etc.)
  sequelize = new Sequelize(DATABASE_URL, getSequelizeOptions());
} else if (process.env.NODE_ENV === 'production') {
  // Production with individual variables
  sequelize = new Sequelize({
    database: DB_NAME,
    host: DB_HOST,
    port: parseInt(DB_PORT) || 5432,
    username: DB_USER,
    password: DB_PASSWORD,
    ...getSequelizeOptions(),
  });
} else {
  // Development local (Docker)
  sequelize = new Sequelize(
    `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT || 5432}/${DB_NAME || 'tuspacio_db'}`,
    {
      ...getSequelizeOptions(),
      dialectOptions: {
        ...getSequelizeOptions().dialectOptions,
        ssl: false, // Disable SSL for local development
      },
    }
  );
}

// const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/dogs`, {
//   logging: false, // set to console.log to see the raw SQL queries
//   native: false, // lets Sequelize know we can use pg-native for ~30% more speed
// });
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter(
    file =>
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach(file => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
const entries = Object.entries(sequelize.models);
const capsEntries = entries.map(entry => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// Test database connection and setup monitoring
const testConnection = async () => {
  try {
    const startTime = Date.now();
    await sequelize.authenticate();
    const connectionTime = Date.now() - startTime;

    console.log('✅ Database connection established successfully.');
    console.log(`⚡ Connection established in ${connectionTime}ms`);

    // Log connection details in development
    if (process.env.NODE_ENV === 'development') {
      const config = sequelize.config;
      console.log(
        `📊 Connected to: ${config.database} on ${config.host}:${config.port}`
      );
      console.log(
        `🔧 Pool config: max=${config.pool.max}, min=${config.pool.min}, idle=${config.pool.idle}ms`
      );
    }

    // Setup database query monitoring
    setupQueryMonitoring();
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);

    // In production, we might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Database connection failed in production. Exiting...');
      process.exit(1);
    }
  }
};

// Setup database query monitoring
const setupQueryMonitoring = () => {
  // Import performance monitor here to avoid circular dependency
  let performanceMonitor;
  try {
    performanceMonitor = require('./utils/performanceMonitor');
  } catch (error) {
    // Performance monitor might not be available during initial setup
    console.log('Performance monitor not available for database monitoring');
    return;
  }

  // Hook into Sequelize query events for monitoring
  sequelize.addHook('beforeQuery', options => {
    options.startTime = Date.now();
  });

  sequelize.addHook('afterQuery', (options, query) => {
    if (options.startTime && performanceMonitor) {
      const queryTime = Date.now() - options.startTime;
      const operation = query.sql
        ? query.sql.split(' ')[0].toUpperCase()
        : 'UNKNOWN';
      performanceMonitor.recordDatabaseQuery(queryTime, true, operation);
    }
  });

  sequelize.addHook('queryError', (error, options, query) => {
    if (options.startTime && performanceMonitor) {
      const queryTime = Date.now() - options.startTime;
      const operation = query.sql
        ? query.sql.split(' ')[0].toUpperCase()
        : 'UNKNOWN';
      performanceMonitor.recordDatabaseQuery(queryTime, false, operation);
      performanceMonitor.recordError(error, `database-query-${operation}`);
    }
  });
};

// Initialize connection test
testConnection();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection...');
  await sequelize.close();
  console.log('✅ Database connection closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connection...');
  await sequelize.close();

  process.exit(0);
});

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

// Ejemplo:
const { Product, Review, Categorie, Order, Rol, User, Ofert } =
  sequelize.models;

/*===========================RELATION Rol - User 1:N==============================*/
Rol.hasMany(User, { foreignKey: 'rol_id' });
User.belongsTo(Rol, { foreignKey: 'rol_id' });

/*===========================RELATION User - Products N:M==============================*/
User.belongsToMany(Product, { through: 'Favorite_Products' });
Product.belongsToMany(User, { through: 'Favorite_Products' });

/*===========================RELATION CATEGORY - PRODUCTS N:M==============================*/
Categorie.belongsToMany(Product, {
  through: 'Category_Products',
  foreignKey: 'categorie_id',
  otherKey: 'product_id',
});
Product.belongsToMany(Categorie, {
  through: 'Category_Products',
  foreignKey: 'product_id',
  otherKey: 'categorie_id',
});

/*===========================RELATION USER - ORDER 1:N==============================*/
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

/*===========================RELATION USER -  REVIEWS 1:N==============================*/
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

/*===========================RELATION ORDER - PRODUCTS N:M==============================*/
Order.belongsToMany(Product, { through: 'Order_Products' });
Product.belongsToMany(Order, { through: 'Order_Products' });

/*===========================RELATION PRODUCTS - REVIEWS 1:N==============================*/
Product.hasMany(Review, { foreignKey: 'product_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

/*===========================RELATION PRODUCTS - OFERTS N:M==============================*/
Product.belongsToMany(Ofert, { through: 'Product_Oferts' });
Ofert.belongsToMany(Product, { through: 'Product_Oferts' });

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  database: sequelize, // para importart la conexión { conn } = require('./db.js');
};
