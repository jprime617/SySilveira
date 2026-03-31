require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const connection = require('./database');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 3333;

async function bootstrap() {
  try {
    await connection.authenticate();
    console.log('Database connected (WAL enabled natively).');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed, retrying in 5 seconds...', error);
    setTimeout(bootstrap, 5000);
  }
}

bootstrap();
