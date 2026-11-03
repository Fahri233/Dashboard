import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { getTursoClient, initDatabase, seedFindings, rowToFinding } from './_db.ts';

export function tursoApiDevPlugin(): Plugin {
  return {
    name: 'turso-api-dev-server',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '');
      if (env.TURSO_DATABASE_URL) process.env.TURSO_DATABASE_URL = env.TURSO_DATABASE_URL;
      if (env.TURSO_AUTH_TOKEN) process.env.TURSO_AUTH_TOKEN = env.TURSO_AUTH_TOKEN;

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

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

        const db = getTursoClient();
        if (!db) {
          return sendJson(500, { error: 'Turso client tidak tersedia. Periksa .env.local' });
        }

        try {
          await initDatabase(db);

          // Route: /api/init
          if (pathname === '/api/init') {
            const countRes = await db.execute('SELECT COUNT(*) as count FROM findings');
            return sendJson(200, { success: true, count: Number(countRes.rows[0].count) });
          }

          // Route: /api/findings/reset
          if (pathname === '/api/findings/reset' && req.method === 'POST') {
            await seedFindings(db);
            const countRes = await db.execute('SELECT COUNT(*) as count FROM findings');
            return sendJson(200, { success: true, count: Number(countRes.rows[0].count) });
          }

          // Route: /api/findings
          if (pathname === '/api/findings') {
            if (req.method === 'GET') {
              const result = await db.execute('SELECT * FROM findings ORDER BY no ASC');
              return sendJson(200, { success: true, data: result.rows.map(rowToFinding) });
            }
            if (req.method === 'POST') {
              const item = await parseBody();
              const id = item.id || `K3-${item.no}-${Date.now()}`;
              await db.execute({
                sql: `INSERT INTO findings (
                  id, no, tanggal, tanggal_iso, lokasi, aktivitas, potensi_bahaya,
                  kategori, tingkat_risiko, pengendalian, status, keterangan,
                  raw_kategori, raw_pengendalian, raw_potensi_bahaya, raw_tanggal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  id,
                  item.no,
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
                  item.raw?.tanggal || null
                ]
              });
              const inserted = await db.execute({
                sql: 'SELECT * FROM findings WHERE id = ?',
                args: [id]
              });
              return sendJson(201, { success: true, data: rowToFinding(inserted.rows[0]) });
            }
          }

          // Route: /api/findings/:id
          const idMatch = pathname.match(/^\/api\/findings\/([^/]+)$/);
          if (idMatch) {
            const id = decodeURIComponent(idMatch[1]);
            if (req.method === 'GET') {
              const getRes = await db.execute({
                sql: 'SELECT * FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
                args: [id, id]
              });
              if (getRes.rows.length === 0) return sendJson(404, { error: 'Not found' });
              return sendJson(200, { success: true, data: rowToFinding(getRes.rows[0]) });
            }
            if (req.method === 'PUT') {
              const item = await parseBody();
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
                  id,
                  id
                ]
              });
              const updated = await db.execute({
                sql: 'SELECT * FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
                args: [id, id]
              });
              return sendJson(200, { success: true, data: rowToFinding(updated.rows[0]) });
            }
            if (req.method === 'DELETE') {
              await db.execute({
                sql: 'DELETE FROM findings WHERE id = ? OR CAST(no AS TEXT) = ?',
                args: [id, id]
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
