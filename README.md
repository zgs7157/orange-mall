# 橙屿商城（Orange Isle Mall）

一个开源的**演示型购物网站**：数码与生活好物精选，支持分类筛选、关键词搜索、商品详情弹窗与购物车本地持久化。前台为原生 HTML / CSS / JavaScript，后台为 Cloudflare Pages Functions + D1 数据库，全部免费额度内运行。

## 功能特性

### 前台（index.html）
- 商品展示：商品含分类标签、评分、价格与详情
- 搜索筛选：关键词实时搜索 + 分类/新品筛选
- 商品详情弹窗：功能卖点、数量选择、加入购物车
- 购物车抽屉：数量增减、移除、合计金额，数据保存在浏览器 localStorage
- 响应式布局：桌面 / 平板 / 手机自适应
- 数据来源：优先从后端 API（`/api/products`）加载；API 不可用时自动回退到内置演示数据

### 后台（admin.html）
- 管理员登录（密码验证）
- 商品管理：新增、编辑、删除、上下架、设置新品标签
- 修改即时生效：保存后前台刷新即可看到变化
- 图片快捷选择：可直接点选现有商品图，或粘贴任意图片地址

## 技术栈

- 前台：原生 HTML5 / CSS3 / JavaScript（无框架、无构建工具）
- 后端：Cloudflare Pages Functions（REST API）
- 数据库：Cloudflare D1（免费 SQLite 云数据库）
- 字体：Noto Serif SC / Noto Sans SC（自托管镜像）
- 商品图片：AI 生成素材（存放于 `assets/`）

## 目录结构

```
orange-mall/
├── index.html          # 前台商城页
├── admin.html          # 后台管理页（登录后可用）
├── functions/          # Cloudflare Pages Functions 后端
│   ├── _lib.js         # 共享工具：鉴权、建表、默认商品
│   └── api/
│       ├── login.js    # POST /api/login 管理员登录
│       ├── products.js # GET/POST /api/products 商品列表与新增
│       └── products/[id].js # GET/PUT/DELETE /api/products/:id
├── assets/             # 商品与主视觉图片
├── LICENSE             # MIT 开源协议
└── README.md
```

## API 一览

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| POST | /api/login | `{password}` → `{token}` | 无 |
| GET | /api/products | 商品列表（首次访问自动建表并写入默认商品） | 无 |
| POST | /api/products | 新增商品 | Bearer 密码 |
| GET | /api/products/:id | 单个商品 | 无 |
| PUT | /api/products/:id | 修改商品 | Bearer 密码 |
| DELETE | /api/products/:id | 删除商品 | Bearer 密码 |

写操作需请求头 `Authorization: Bearer <管理密码>`。默认管理密码为 `orange2026`，正式使用请在 Cloudflare 后台为项目添加环境变量 `ADMIN_PASSWORD` 覆盖。

## 本地运行

前台直接用浏览器打开 `index.html` 即可（无 API 时显示内置演示数据）。也可以起一个静态服务：

```bash
python -m http.server 8080
# 访问 http://localhost:8080
```

后台与 API 依赖 Cloudflare D1，需部署后在线上使用。

## 部署到 Cloudflare Pages（免费）

1. 将本项目推送到 GitHub 仓库；
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages；
3. 选择 **Connect to Git**，授权并选择本仓库；
4. 构建设置：Framework preset 选 **None**，Build command 留空，Build output directory 填 `/`；
5. 点击 Deploy，完成后即可获得 `https://<项目名>.pages.dev` 的免费域名。

### 配置数据库（D1）

1. 打开 Cloudflare Dashboard → 左侧 **D1** → **Create database**，名称填 `orange-mall-db`，创建；
2. 进入 **Workers & Pages** → 点击你的 Pages 项目（orange-mall）→ **Settings** → **Functions** → **D1 database bindings**；
3. 点 **Add binding**，变量名填 `DB`，数据库选择 `orange-mall-db`，保存；
4. 保存后 Cloudflare 会自动重新部署，第一次访问前台时自动建表并写入 8 件默认商品。

后台访问路径：`https://<项目名>.pages.dev/admin.html`

## 开源协议

本项目基于 [MIT License](LICENSE) 开源，欢迎 fork、修改与二次开发。

## 免责声明

本项目为演示用途：所有商品名称、价格、评分与文案均为虚构示例数据，不构成任何真实交易或推荐。默认管理密码仅为演示使用，公开部署前请务必通过环境变量修改。
