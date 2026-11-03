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
        const queryId = url.searchParams.get('id');

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

          // Route: /api/findings (with optional query ?id=...) OR /api/findings/:id
          const idMatch = pathname.match(/^\/api\/findings\/([^/]+)$/);
          const targetId = idMatch ? decodeURIComponent(idMatch[1]) : queryId;

          if (pathname === '/api/findings' || idMatch) {
            // GET
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

            // POST (Add Finding)
            if (req.method === 'POST' && pathname === '/api/findings') {
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

            // PUT (Update Finding)
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

            // DELETE
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
