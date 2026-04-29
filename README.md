# mermaid-to-svg

基于 `beautiful-mermaid` 的 Mermaid 转 SVG 页面。

## 工作方式

- 用户在浏览器输入 Mermaid，或上传 `.mmd` 文件
- 浏览器内调用 `beautiful-mermaid` 渲染成更好看的 SVG
- 用户直接下载当前 SVG
- 站点只托管静态文件，可直接部署到 Cloudflare Workers Static Assets 或 Cloudflare Pages

## 开发

新人本地启动，直接跑：

```bash
npm install
npm run dev
```

`npm run dev` 会先构建前端 bundle，再启动 `wrangler dev` 本地预览。

> 如果你已经安装了 [pnpm](https://pnpm.io)，也可以直接用 `pnpm install` 和 `pnpm run dev`。

## 本地预览

构建后直接用 `wrangler dev` 本地预览：

```bash
npm run dev
```

然后打开终端输出的本地地址即可。

## 部署

仓库已包含 `wrangler.toml`，静态资源目录是 `public/`。

### 用 Wrangler 部署到 Workers Static Assets

```bash
npm run deploy
```

### 用 Wrangler 本地预览

```bash
npm run dev
```

### Cloudflare Pages

- Framework preset: `None`
- Build command: `npm install && npm run build`
- Build output directory: `public`

## 文件

- `public/index.html`：页面结构
- `public/styles.css`：样式
- `src/app.js`：`beautiful-mermaid` 入口、主题、文件导入与下载逻辑
- `public/app.js`：构建产物
- `wrangler.toml`：Cloudflare Workers Static Assets 配置
- `package.json`：依赖与构建脚本

## 致谢

本项目基于 [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) 构建，感谢上游库提供的出色主题和渲染能力。

## License

[MIT](LICENSE)
