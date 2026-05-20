import { rest } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const handlers = [
  // GET categories
  rest.get(`${API_BASE}/api/kategori`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([{ id: 1, name: 'Meat' }, { id: 2, name: 'Vegetables' }]));
  }),

  // GET menu
  rest.get(`${API_BASE}/api/menu`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),

  // POST create category
  rest.post(`${API_BASE}/api/kategori`, async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.status(201), ctx.json({ id: Date.now(), name: body.name }));
  }),

  // PUT update category
  rest.put(`${API_BASE}/api/kategori/:id`, async (req, res, ctx) => {
    const { id } = req.params as any;
    const body = await req.json();
    return res(ctx.status(200), ctx.json({ id: Number(id), name: body.name }));
  }),

  // DELETE category
  rest.delete(`${API_BASE}/api/kategori/:id`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
];
