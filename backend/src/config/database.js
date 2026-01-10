// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT || 5432,
//     dialect: "postgres",
//     logging: false,
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//   }
// );

// module.exports = sequelize;

// using url

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,

  dialectOptions: process.env.PGSSLMODE === 'require' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false, // REQUIRED for Neon
    },
  } : undefined, // No SSL for local development
});

module.exports = sequelize;
