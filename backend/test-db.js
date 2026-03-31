const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'SySilveira',
  password: '',
  port: 5432,
});

async function test() {
  try {
    await client.connect();
    console.log('Connected successfully!');
    await client.end();
  } catch (err) {
    console.error('Connection error', err.stack);
  }
}

test();
