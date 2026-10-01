// GET /api/products  商品列表（自动初始化数据库与默认商品）
// POST /api/products 新增商品（需 Authorization: Bearer <管理密码>）
import { json, isAuthed, ensureDb, rowToProduct, normalizeProduct, validateProduct } from "../_lib.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.DB) {
    return json({ ok: false, error: "数据库未配置：请先在 Cloudflare 后台为 orange-mall 项目绑定 D1 数据库（变量名 DB）" }, 503);
  }
  await ensureDb(env);

  if (request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY sort ASC, id ASC").all();
    return json({ ok: true, products: results.map(rowToProduct) });
  }

  if (request.method === "POST") {
    if (!isAuthed(request, env)) return json({ ok: false, error: "未授权" }, 401);
    let body = {};
    try { body = await request.json(); } catch (e) { return json({ ok: false, error: "请求体不是合法 JSON" }, 400); }
    const p = normalizeProduct(body);
    const err = validateProduct(p);
    if (err) return json({ ok: false, error: err }, 400);
    const res = await env.DB.prepare(
      "INSERT INTO products (name, category, catName, price, rating, isNew, image, description, feats, on_sale, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(p.name, p.category, p.catName, p.price, p.rating, p.isNew, p.image, p.description, JSON.stringify(p.feats), p.on_sale, p.sort).run();
    const created = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(res.meta.last_row_id).first();
    return json({ ok: true, product: rowToProduct(created) }, 201);
  }

  return json({ ok: false, error: "不支持的方法" }, 405);
}
