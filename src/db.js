require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Importar pg explicitamente para garantir que está disponível
const pg = require("pg");

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT, DATABASE_URL } =
  process.env;

// Configuração do Sequelize
// Suporta tanto DATABASE_URL (NeonDB, Vercel) quanto variáveis individuais (Docker local)
let sequelize;

// Optimized connection pool configuration based on environment
const getPoolConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    max: isProduction ? 10 : 5, // Maximum connections in pool
    min: isProduction ? 2 : 0, // Minimum connections in pool
    acquire: 60000, // Maximum time to get connection (ms)
    idle: 30000, // Maximum idle time before releasing connection (ms)
    evict: 10000, // Time interval for evicting stale connections (ms)
    handleDisconnects: true, // Automatically handle disconnects
  };
};

// SSL configuration for production environments
const getSSLConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) return false;

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
  dialect: "postgres",
  dialectModule: pg,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
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
  benchmark: process.env.NODE_ENV === "development",
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

if (DATABASE_URL) {
  // Use DATABASE_URL if available (NeonDB, Vercel, etc.)
  sequelize = new Sequelize(DATABASE_URL, getSequelizeOptions());
} else if (process.env.NODE_ENV === "production") {
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
    `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT || 5432}/${DB_NAME || "tuspacio_db"}`,
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
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Log connection details in development
    if (process.env.NODE_ENV === "development") {
      const config = sequelize.config;
      console.log(
        `📊 Connected to: ${config.database} on ${config.host}:${config.port}`
      );
      console.log(
        `🔧 Pool config: max=${config.pool.max}, min=${config.pool.min}`
      );
    }
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);

    // In production, we might want to exit the process
    if (process.env.NODE_ENV === "production") {
      console.error("🚨 Database connection failed in production. Exiting...");
      process.exit(1);
    }
  }
};

// Initialize connection test
testConnection();

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("🔄 Closing database connection...");
  await sequelize.close();
  console.log("✅ Database connection closed.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🔄 Closing database connection...");
  await sequelize.close();
  console.log("✅ Database connection closed.");
  process.exit(0);
});

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

// Ejemplo:
const { Product, Review, Categorie, Order, Rol, User, Ofert } =
  sequelize.models;

/*===========================RELATION Rol - User 1:N==============================*/
Rol.hasMany(User, { foreignKey: "rol_id" });
User.belongsTo(Rol, { foreignKey: "rol_id" });

/*===========================RELATION User - Products N:M==============================*/
User.belongsToMany(Product, { through: "Favorite_Products" });
Product.belongsToMany(User, { through: "Favorite_Products" });

/*===========================RELATION CATEGORY - PRODUCTS N:M==============================*/
Categorie.belongsToMany(Product, { through: "Category_Products" });
Product.belongsToMany(Categorie, { through: "Category_Products" });

/*===========================RELATION USER - ORDER 1:N==============================*/
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

/*===========================RELATION USER -  REVIEWS 1:N==============================*/
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

/*===========================RELATION ORDER - PRODUCTS N:M==============================*/
Order.belongsToMany(Product, { through: "Order_Products" });
Product.belongsToMany(Order, { through: "Order_Products" });

/*===========================RELATION PRODUCTS - REVIEWS 1:N==============================*/
Product.hasMany(Review, { foreignKey: "product_id" });
Review.belongsTo(Product, { foreignKey: "product_id" });

/*===========================RELATION PRODUCTS - OFERTS N:M==============================*/
Product.belongsToMany(Ofert, { through: "Product_Oferts" });
Ofert.belongsToMany(Product, { through: "Product_Oferts" });

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  database: sequelize, // para importart la conexión { conn } = require('./db.js');
};
