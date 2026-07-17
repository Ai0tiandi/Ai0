// api/items/index.js
// Quick demo backend for Vercel Serverless Functions.
// Supports GET / POST / DELETE (by ?id=).
// Data is kept in memory (globalThis.__ITEMS__) and is NOT persistent across cold starts.

if (!globalThis.__ITEMS__) globalThis.__ITEMS__ = [];
const items = globalThis.__ITEMS__;

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      // When Vercel parses JSON body, req.body is already an object.
      const text = body.text || (typeof body === 'string' ? JSON.parse(body).text : undefined);
      if (!text || !String(text).trim()) return res.status(400).json({ error: 'empty' });
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
      const item = { id, text: String(text).trim(), createdAt: new Date().toISOString() };
      items.unshift(item);
      return res.status(201).json(item);
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'missing id' });
      const before = items.length;
      for (let i = 0; i < items.length; i++) if (items[i].id === id) { items.splice(i,1); break; }
      return res.status(200).json({ deleted: before - items.length });
    }

    res.setHeader('Allow', 'GET,POST,DELETE');
    return res.status(405).end();
  } catch (err) {
    console.error('api/items error', err);
    return res.status(500).json({ error: String(err) });
  }
}
