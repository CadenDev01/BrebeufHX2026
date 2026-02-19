// Quick script to make a user an admin
// Usage: node make-admin.mjs <email>

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const email = process.argv[2]
if (!email) {
  console.log('Usage: node make-admin.mjs <email>');
  process.exit(1);
}

async function makeAdmin() {
  const client = await MongoClient.connect(process.env.ATLAS_URI);
  const db = client.db(process.env.CONNECTION_NAME || 'test');

  const result = await db.collection('users').updateOne(
    { email },
    { $set: { roles: ['user', 'admin'] } }
  );

  if (result.matchedCount === 0) {
    console.log(`User with email "${email}" not found`);
  } else {
    console.log(`Success! ${email} is now an admin`);
  }

  await client.close();
  process.exit();
}

makeAdmin().catch(console.error);
