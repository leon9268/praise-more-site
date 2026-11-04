# Praise More 網站

praise.com.hk 新版網站（靜態網站，部署於 Cloudflare Pages）。

## 改內容
所有文字都喺 `content/site.json`。喺 GitHub 網頁打開呢個檔案 → 按鉛筆圖示 → 改字 → Commit，Cloudflare 會自動重新建置及上線（約 1 分鐘）。

- `site`：聯絡資料（電話、WhatsApp、電郵、社交平台）
- `home`：主頁文字
- `about`：關於我們、配對流程
- `history`：品牌歷程、傳媒訪問、活動相簿
- `services`：15 個服務頁（`category` 決定歸入家長服務／學校服務／健康環境服務）

## Cloudflare Pages 設定
- Framework preset：None
- Build command：`node build.js`
- Build output directory：`dist`

## 本機預覽
```
node build.js
npx serve dist
```

## 檔案
- `build.js`：將 `content/site.json` 生成所有頁面（無需安裝任何套件）
- `static/assets/style.css`：設計樣式（品牌色 #4F9A1C、#8CC63F、#2B2B2B）
- `static/assets/main.js`：WebGL 粒子動畫及互動效果
- `static/assets/vendor/three.module.min.js`：three.js r160（MIT）
- `_redirects`：自動將舊網中文網址轉去新頁面（網域轉過嚟之後生效）
