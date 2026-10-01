// POST /api/login  { password } -> { ok, token }
import { json, adminPassword } from "../_lib.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") {
    return json({ ok: false, error: "仅支持 POST 请求" }, 405);
  }
  let body = {};
  try { body = await request.json(); } catch (e) {}
  const pw = adminPassword(env);
  if (body.password === pw) {
    return json({ ok: true, token: pw });
  }
  return json({ ok: false, error: "密码错误" }, 401);
}
