# 橙屿商城（Orange Isle Mall）

一个开源的**演示型购物网站**：数码与生活好物精选，支持分类筛选、关键词搜索、商品详情弹窗与购物车本地持久化。全部由原生 HTML / CSS / JavaScript 实现，无后端、无构建步骤，可直接免费部署到 GitHub Pages 或 Cloudflare Pages。

## 功能特性

- 商品展示：8 款虚构好物，含分类标签、评分、价格与详情
- 搜索筛选：关键词实时搜索 + 分类/新品筛选
- 商品详情弹窗：功能卖点、数量选择、加入购物车
- 购物车抽屉：数量增减、移除、合计金额，数据保存在浏览器 localStorage
- 响应式布局：桌面 / 平板 / 手机自适应
- 无障碍基础：键盘焦点可见、ESC 关闭弹层、减少动态效果适配

## 技术栈

- 原生 HTML5 / CSS3 / JavaScript（无框架、无构建工具）
- 字体：Noto Serif SC / Noto Sans SC（自托管镜像）
- 商品图片：AI 生成素材（存放于 `assets/`）

## 目录结构

```
orange-mall/
├── index.html       # 单文件应用（含内联样式与脚本）
├── assets/          # 商品与主视觉图片
│   ├── hero.jpg
│   ├── p01-earbuds.jpg ... p08-organizer.jpg
├── LICENSE          # MIT 开源协议
└── README.md
```

## 本地运行

直接用浏览器打开 `index.html` 即可，无需任何依赖。也可以起一个静态服务：

```bash
python -m http.server 8080
# 访问 http://localhost:8080
```

## 部署到 Cloudflare Pages（免费）

1. 将本项目推送到 GitHub 仓库（公开或私有均可）；
2. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages；
3. 选择 **Connect to Git**，授权并选择本仓库；
4. 构建设置：Framework preset 选 **None**，Build command 留空，Build output directory 填 `/`；
5. 点击 Deploy，完成后即可获得 `https://<项目名>.pages.dev` 的免费域名。

每次向 GitHub 推送代码，Cloudflare Pages 会自动重新构建部署。

## 开源协议

本项目基于 [MIT License](LICENSE) 开源，欢迎 fork、修改与二次开发。

## 免责声明

本项目为演示用途：所有商品名称、价格、评分与文案均为虚构示例数据，不构成任何真实交易或推荐。
