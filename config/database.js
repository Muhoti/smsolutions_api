const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize(
  process.env.PGDATABASE || 'sdl_db',
  process.env.PGUSER || 'postgres',
  process.env.PGPASSWORD || 'password',
  {
    host: process.env.PGHOST || 'db',
    port: process.env.PGPORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('📦 PostgreSQL Connected Successfully!');
    
    // Create tables if missing; alter schema only in development
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('🔄 Database synchronized');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };