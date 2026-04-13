require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
  },
  // Aquecedores e proteção contra timeout do Render / Neon:
  pool: {
    max: 10,       // Máximo de conexões (ideal para tier free)
    min: 0,        // Mínimo de conexões
    acquire: 60000, // Tempo máximo que tenta reconectar antes de falhar (60 segundos)
    idle: 10000    // Remove do pool conexões inativas por mais de 10 seg
  },
  dialectOptions: process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech') ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    keepAlive: true // Mantém socket TCP vivo contra cortas do Render
  } : {}
};
