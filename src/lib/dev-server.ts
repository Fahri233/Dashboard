import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { createClient } from '@libsql/client/web';
import seedData from '../data/seed.json' with { type: 'json' };
import { K3Finding } from '../types/k3.ts';

const DEFAULT_URL = 'libsql://dashboard-fahri233.aws-ap-southeast-1.turso.io';
const DEFAULT_AUTH_TOKEN =
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM3MTY3MTcsImlkIjoiMDFhMWExZDgtZTIwMS03NzE5LWJkMDUtOTIxNDVhMzczN2EwIiwia2lkIjoiUml3czV4QW40aWV5eWVlYWpwV19uSnJfbXBoRklyb3N5eWE2YmJnZERtMCIsInJpZCI6Ijc4ODI4YjQyLWIxNzAtNDI4YS1hMDQ4LTVhNzc3NWE3MDBmOSJ9.oGGutSDRGFKwD9l7G2V2e2uaRFkCtM1IOHq574vfGyIa8zoua9ucgFFcwEiECIc6EGcg0p893hqrTxbZwbo4Ag';

function rowToFinding(row: any): K3Finding {
  return {
    id: String(row.id),
    no: Number(row.no),
    tanggal: String(row.tanggal),
    tanggalIso: String(row.tanggal_iso),
    lokasi: row.lokasi,
    aktivitas: String(row.aktivitas),
    potensiBahaya: String(row.potensi_bahaya),
    kategori: row.kategori,
    tingkatRisiko: row.tingkat_risiko,
    pengendalian: String(row.pengendalian),
    status: row.status,
    keterangan: String(row.keterangan || '-'),
    raw: {
      kategori: row.raw_kategori || undefined,
      pengendalian: row.raw_pengendalian || undefined,
      potensiBahaya: row.raw_potensi_bahaya || undefined,
      tanggal: row.raw_tanggal || undefined,
    },
  };
}

export function tursoApiDevPlugin(): Plugin {
  return {
    name: 'turso-api-dev-server',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '');
      const url = env.TURSO_DATABASE_URL || DEFAULT_URL;
      const authToken = env.TURSO_AUTH_TOKEN || DEFAULT_AUTH_TOKEN;

      const db = createClient({
        url,
        authToken,
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname;
        const queryId = parsedUrl.searchParams.get('id');

        const sendJson = (status: number, data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = status;
          res.end(JSON.stringify(data));
        };

        const parseBody = () =>
          new Promise<any>(resolve => {
            let bodyStr = '';
            req.on('data', chunk => {
              bodyStr += chunk;
            });
            req.on('end', () => {
              try {
                resolve(bodyStr ? JSON.parse(bodyStr) : {});
              } catch {
                resolve({});
              }
            });
          });

        try {
          // Route: /api/init
          if (pathname === '/api/init') {
            const countRes = await db.execute('SELECT COUNT(*) as count FROM findings');
            return sendJson(200, { success: true, count: Number(countRes.rows[0].count) });
          }

          // Route: /api/reset
          if ((pathname === '/api/findings/reset' || pathname === '/api/reset') && req.method === 'POST') {
            await db.execute('DELETE FROM findings');
            const statements = (seedData as K3Finding[]).map(item => ({
              sql: `INSERT INTO findings (
                id, no, tanggal, tanggal_iso, lokasi, aktivitas, potensi_bahaya,
                kategori, tingkat_risiko, pengendalian, status, keterangan,
                raw_kategori, raw_pengendalian, raw_potensi_bahaya, raw_tanggal
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                item.id,
                item.no,
                item.tanggal,
                item.tanggalIso,
                item.lokasi,
                item.aktivitas,
                item.potensiBahaya,
                item.kategori,
                item.tingkatRisiko,
                item.pengendalian,
                item.status,
                item.keterangan || '-',
                item.raw?.kategori || null,
                item.raw?.pengendalian || null,
                item.raw?.potensiBahaya || null,
                item.raw?.tanggal || null,
              ],
            }));
            await db.batch(statements, 'write');
            const countRes = await db.execute('SELECT COUNT(*) as count FROM findings');
            return sendJson(200, { success: true, count: Number(countRes.rows[0].count) });
          }

          // Route: /api/findings
          const idMatch = pathname.match(/^\/api\/findings\/([^/]+)$/);
          const targetId = idMatch ? decodeURIComponent(idMatch[1]) : queryId;

          if (pathname === '/api/findings' || idMatch) {
            if (req.method === 'GET') {
              if (targetId) {
                const getRes = await db.execute({
                  sql: 'SELECT * FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
                  args: [targetId, targetId],
                });
                if (getRes.rows.length === 0) return sendJson(404, { error: 'Not found' });
                return sendJson(200, { success: true, data: rowToFinding(getRes.rows[0]) });
              }
              const result = await db.execute('SELECT * FROM findings ORDER BY no ASC');
              return sendJson(200, { success: true, data: result.rows.map(rowToFinding) });
            }

            if (req.method === 'POST') {
              const item = await parseBody();
              const maxRes = await db.execute('SELECT MAX(no) as max_no FROM findings');
              const maxNo = Number(maxRes.rows[0]?.max_no || 0);
              const safeNo = item.no && item.no > maxNo ? item.no : maxNo + 1;
              const id = item.id || `K3-${safeNo}-${Date.now()}`;

              await db.execute({
                sql: `INSERT INTO findings (
                  id, no, tanggal, tanggal_iso, lokasi, aktivitas, potensi_bahaya,
                  kategori, tingkat_risiko, pengendalian, status, keterangan,
                  raw_kategori, raw_pengendalian, raw_potensi_bahaya, raw_tanggal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  id,
                  safeNo,
                  item.tanggal,
                  item.tanggalIso || item.tanggal,
                  item.lokasi,
                  item.aktivitas,
                  item.potensiBahaya,
                  item.kategori,
                  item.tingkatRisiko,
                  item.pengendalian,
                  item.status,
                  item.keterangan || '-',
                  item.raw?.kategori || null,
                  item.raw?.pengendalian || null,
                  item.raw?.potensiBahaya || null,
                  item.raw?.tanggal || null,
                ],
              });
              const inserted = await db.execute({
                sql: 'SELECT * FROM findings WHERE id = ?',
                args: [id],
              });
              return sendJson(201, { success: true, data: rowToFinding(inserted.rows[0]) });
            }

            if (req.method === 'PUT') {
              const item = await parseBody();
              const idToUpdate = targetId || item?.id;
              if (!idToUpdate) return sendJson(400, { error: 'ID diperlukan' });

              await db.execute({
                sql: `UPDATE findings SET
                  tanggal = ?, tanggal_iso = ?, lokasi = ?, aktivitas = ?,
                  potensi_bahaya = ?, kategori = ?, tingkat_risiko = ?,
                  pengendalian = ?, status = ?, keterangan = ?,
                  raw_kategori = ?, raw_pengendalian = ?, raw_potensi_bahaya = ?, raw_tanggal = ?,
                  updated_at = CURRENT_TIMESTAMP
                WHERE id = ? OR CAST(no AS TEXT) = ?`,
                args: [
                  item.tanggal,
                  item.tanggalIso || item.tanggal,
                  item.lokasi,
                  item.aktivitas,
                  item.potensiBahaya,
                  item.kategori,
                  item.tingkatRisiko,
                  item.pengendalian,
                  item.status,
                  item.keterangan || '-',
                  item.raw?.kategori || null,
                  item.raw?.pengendalian || null,
                  item.raw?.potensiBahaya || null,
                  item.raw?.tanggal || null,
                  idToUpdate,
                  idToUpdate,
                ],
              });
              const updated = await db.execute({
                sql: 'SELECT * FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
                args: [idToUpdate, idToUpdate],
              });
              return sendJson(200, { success: true, data: rowToFinding(updated.rows[0]) });
            }

            if (req.method === 'DELETE') {
              const item = await parseBody();
              const idToDelete = targetId || item?.id;
              if (!idToDelete) return sendJson(400, { error: 'ID diperlukan' });

              await db.execute({
                sql: 'DELETE FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
                args: [idToDelete, idToDelete],
              });
              return sendJson(200, { success: true, message: 'Deleted' });
            }
          }

          return next();
        } catch (err: any) {
          console.error('Dev API Error:', err);
          return sendJson(500, { error: err.message });
        }
      });
    }
  };
}
