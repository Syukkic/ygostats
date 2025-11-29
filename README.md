## 安裝

```bash
pnpm install
```

如果遇到`better-sqlite3`問題，嘗試執行以下命令來修復它：

```bash
npx node-gyp rebuild --directory=node_modules/better-sqlite3
```

## 運行

```bash
NODE_ENV=production node build/index.js
```

## 截圖

![screenshot](./assets/demo.png)
