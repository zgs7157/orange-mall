// 共享工具：JSON 响应、管理员鉴权、D1 建表与默认商品（_ 开头不会被发布为路由）

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

export function adminPassword(env) {
  // 演示项目默认密码 orange2026；正式使用请在 Cloudflare 后台
  // orange-mall 项目设置中添加环境变量 ADMIN_PASSWORD 覆盖它。
  return env.ADMIN_PASSWORD || "orange2026";
}

export function isAuthed(request, env) {
  const auth = request.headers.get("Authorization") || "";
  return auth === "Bearer " + adminPassword(env);
}

export const DEFAULT_PRODUCTS = [
  { name:"轻羽降噪耳机 Pro", category:"digital", catName:"数码", price:399, rating:4.9, isNew:1,
    image:"assets/p01-earbuds.jpg", description:"入耳式主动降噪，通勤地铁一秒安静。",
    feats:["-43dB 混合主动降噪，通透模式一键切换","单次续航 8 小时，配合充电仓共 30 小时","蓝牙 5.3 低延迟，支持双设备连接"], sort:1 },
  { name:"星环智能手表 S2", category:"digital", catName:"数码", price:899, rating:4.8, isNew:0,
    image:"assets/p02-watch.jpg", description:"全天候健康监测，抬腕即见一天状态。",
    feats:["血氧、心率、睡眠多维度监测","双频 GPS，户外轨迹精准记录","典型续航 14 天，5ATM 防水"], sort:2 },
  { name:"小方便携蓝牙音箱", category:"digital", catName:"数码", price:269, rating:4.7, isNew:0,
    image:"assets/p03-speaker.jpg", description:"360° 环绕声，拎上就去野餐。",
    feats:["360° 环绕发声，低音浑厚","IPX7 防水，浴室泳池放心用","18 小时播放，Type-C 快充"], sort:3 },
  { name:"奶油轴机械键盘 75%", category:"digital", catName:"数码", price:459, rating:4.8, isNew:0,
    image:"assets/p04-keyboard.jpg", description:"紧凑布局不占桌面，敲击手感扎实。",
    feats:["热插拔客制化轴体，可自行更换","三模连接：蓝牙 / 2.4G / 有线","PBT 键帽耐磨不打油"], sort:4 },
  { name:"暖阳随行保温杯 500ml", category:"life", catName:"生活好物", price:129, rating:4.9, isNew:0,
    image:"assets/p05-bottle.jpg", description:"316 不锈钢内胆，冬日热饮夏日冰爽。",
    feats:["316 不锈钢内胆，食品级安全","保温 12 小时 / 保冷 24 小时","单手开盖，配可拎硅胶提绳"], sort:5 },
  { name:"云朵香薰加湿器", category:"life", catName:"生活好物", price:159, rating:4.7, isNew:1,
    image:"assets/p06-humidifier.jpg", description:"细密水雾与木质底座，桌面多一份宁静。",
    feats:["超声波雾化，出雾细腻安静","可加精油，营造放松氛围","低于 30dB 静音运行，断电缺水保护"], sort:6 },
  { name:"澄光护眼台灯", category:"life", catName:"生活好物", price:329, rating:4.8, isNew:0,
    image:"assets/p07-lamp.jpg", description:"无频闪柔光，护眼从一盏灯开始。",
    feats:["无频闪全光谱光源，国标 AA 级照度","三档色温可调，亮度记忆","金属灯臂，多角度自由调节"], sort:7 },
  { name:"层序桌面收纳架", category:"life", catName:"生活好物", price:199, rating:4.6, isNew:0,
    image:"assets/p08-organizer.jpg", description:"实木三层，桌面杂物各归其位。",
    feats:["三层实木搁板 + 金属支架，稳固承重","免安装设计，开箱即用","原木纹理，适配多种家居风格"], sort:8 }
];

export async function ensureDb(env) {
  // 建表；表为空时写入默认商品（首次访问自动初始化）
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'digital',
    catName TEXT NOT NULL DEFAULT '数码',
    price REAL NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 4.8,
    isNew INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    feats TEXT NOT NULL DEFAULT '[]',
    on_sale INTEGER NOT NULL DEFAULT 1,
    sort INTEGER NOT NULL DEFAULT 0
  )`).run();
  const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM products").first();
  if (row && row.n === 0) {
    const stmts = DEFAULT_PRODUCTS.map(p => env.DB.prepare(
      "INSERT INTO products (name, category, catName, price, rating, isNew, image, description, feats, on_sale, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)"
    ).bind(p.name, p.category, p.catName, p.price, p.rating, p.isNew, p.image, p.description, JSON.stringify(p.feats), p.sort));
    await env.DB.batch(stmts);
  }
}

export function rowToProduct(r) {
  let feats = [];
  try { feats = JSON.parse(r.feats || "[]"); } catch (e) { feats = []; }
  if (!Array.isArray(feats)) feats = [];
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    catName: r.catName,
    price: r.price,
    rating: r.rating,
    isNew: !!r.isNew,
    image: r.image || "",
    description: r.description || "",
    feats,
    on_sale: !!r.on_sale,
    sort: r.sort || 0
  };
}

// 兼容后台表单与前端两种字段命名（img/desc/cat 与 image/description/category）
export function normalizeProduct(b) {
  const category = String(b.category || b.cat || "digital") === "life" ? "life" : "digital";
  const catName = String(b.catName || "").trim() || (category === "life" ? "生活好物" : "数码");
  return {
    name: String(b.name ?? "").trim(),
    category,
    catName,
    price: Number(b.price),
    rating: (b.rating === undefined || b.rating === null || b.rating === "") ? 4.8 : Number(b.rating),
    isNew: b.isNew ? 1 : 0,
    image: String(b.image || b.img || "").trim(),
    description: String(b.description || b.desc || "").trim(),
    feats: Array.isArray(b.feats) ? b.feats.map(f => String(f).trim()).filter(Boolean) : [],
    on_sale: (b.on_sale === undefined || b.on_sale === null) ? 1 : (b.on_sale ? 1 : 0),
    sort: Number(b.sort) || 0
  };
}

export function validateProduct(p) {
  if (!p.name) return "商品名称不能为空";
  if (!(p.price > 0)) return "价格必须大于 0";
  if (isNaN(p.rating) || p.rating < 0 || p.rating > 5) return "评分应在 0–5 之间";
  return null;
}
