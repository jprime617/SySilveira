require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  try {
    // Check and create client Mercado
    let res = await client.query("SELECT id FROM clients WHERE name = 'Mercado'");
    let clientId;
    if (res.rows.length === 0) {
      const insert = await client.query(
        "INSERT INTO clients (name, email, phone, document, address, created_at, updated_at) VALUES ('Mercado', 'mercado@transfer.local', '0', '0', 'Mercado', NOW(), NOW()) RETURNING id"
      );
      clientId = insert.rows[0].id;
      console.log('Criou cliente Mercado', clientId);
    } else {
      clientId = res.rows[0].id;
      console.log('Cliente Mercado ja existe', clientId);
    }

    // Check and create delivery person Mercado
    res = await client.query("SELECT id FROM delivery_people WHERE name = 'Mercado'");
    let deliveryId;
    if (res.rows.length === 0) {
      const insert = await client.query(
        "INSERT INTO delivery_people (name, phone, vehicle_plate, created_at, updated_at) VALUES ('Mercado', '0', 'MERC', NOW(), NOW()) RETURNING id"
      );
      deliveryId = insert.rows[0].id;
      console.log('Criou entregador Mercado', deliveryId);
    } else {
      deliveryId = res.rows[0].id;
      console.log('Entregador Mercado ja existe', deliveryId);
    }

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
