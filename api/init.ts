import { createClient } from '@libsql/client/http';

const TURSO_URL =
  process.env.TURSO_DATABASE_URL ||
  'libsql://dashboard-fahri233.aws-ap-southeast-1.turso.io';
const TURSO_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM3MTY3MTcsImlkIjoiMDFhMWExZDgtZTIwMS03NzE5LWJkMDUtOTIxNDVhMzczN2EwIiwia2lkIjoiUml3czV4QW40aWV5eWVlYWpwV19uSnJfbXBoRklyb3N5eWE2YmJnZERtMCIsInJpZCI6Ijc4ODI4YjQyLWIxNzAtNDI4YS1hMDQ4LTVhNzc3NWE3MDBmOSJ9.oGGutSDRGFKwD9l7G2V2e2uaRFkCtM1IOHq574vfGyIa8zoua9ucgFFcwEiECIc6EGcg0p893hqrTxbZwbo4Ag';

function getDb() {
  return createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDb();
    const countResult = await db.execute('SELECT COUNT(*) as count FROM findings');
    const count = Number(countResult.rows[0].count);

    return res.status(200).json({
      success: true,
      message: `Database siap. Total: ${count} temuan.`,
      count,
    });
  } catch (err: any) {
    console.error('API /api/init error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
