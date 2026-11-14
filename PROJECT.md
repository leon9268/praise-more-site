# Praise More 新網站項目總結

> 最後更新：2026-11-14
> 負責人：Leon Lai（Business Development Manager）
> 網站擁有人：Praise More（Sarah）

---

## 1. 項目目標

將舊網 praise.com.hk（Artech Creative CMS，原 Praise Education Centre）重做成全新的 **Praise More** 網站：

- 保留舊網所有文字內容
- 使用 Praise 品牌色
- 風格現代、新穎，有強烈視覺效果，不像傳統 Wix／WordPress 網站
- 先放在 Cloudflare 上線，日後再接駁正式網域

---

## 2. 現況（已上線）

| 項目 | 內容 |
|---|---|
| 網址 | https://praise-more-site.pages.dev |
| 原始碼 | GitHub `leon9268/praise-more-site`（branch `main`，Public） |
| 寄存 | Cloudflare Pages（免費版），帳戶 leonlaihinhei@gmail.com |
| 自動部署 | push 到 GitHub `main` 後約 1 分鐘自動更新 |
| Build 設定 | Framework：無；Build command：`node build.js`；輸出目錄：`dist` |
| GitHub 授權 | Cloudflare GitHub App 只開放 `praise-more-site` 一個 repo |

---

## 3. 網站結構（共 21 頁）

| 頁面 | 網址 |
|---|---|
| 主頁 | `/` |
| 關於我們 | `/about/` |
| 服務介紹總覽 | `/services/` |
| 15 個服務頁 | `/services/<slug>/` |
| 品牌歷程 | `/history/` |
| 聯絡我們 | `/contact/` |
| 404 | `/404.html` |

### 服務分類

**家長服務（健康家庭生活）**
上門興趣班、中心興趣班、網上興趣班、外傭聘請配對、SEN 專業支援、SEN 興趣班、影子老師及私人補習、腦效能評估及訓練

**學校服務（愉快校園生活）**
校本興趣班、校本腦效能提升計劃、到校支援服務、AI 到校課程、「智」啟學教計劃

**健康環境服務**
家居清潔及消毒、校園清潔及消毒（已移除舊網的【健康環境】前綴）

### 內容處理決定

- 舊網的「分校網絡、傳媒訪問、活動相簿」合併成 **品牌歷程** 頁；分校地址已移除
- 22 張傳媒剪報做成橫向滑動相廊
- 活動相簿改為連結到 Facebook 專頁
- SEN 專業支援、SEN 興趣班、影子老師三頁加入聲明：「此服務屬教育訓練，並非醫療診斷或治療」（舊網原本沒有）
- 品牌歷程時間線中「幼兒課程及活動」「獲多家媒體報道」兩段為新撰文字，**待 Leon／Sarah 確認**

---

## 4. 設計

### 視覺效果

- 主頁及各頁頂部：WebGL 粒子球（three.js r160，已放在網站內，不依賴外部 CDN），跟隨滑鼠移動，向下捲動時變成波浪
- 斜放服務名稱跑馬燈
- 捲動時逐字亮起的使命句
- 數字動畫統計（18 年／30,000+ 家庭／15 項服務）
- 三大服務分類的立體傾斜卡片
- 配對流程五步隨捲動橫向推進
- 手機版有全屏選單，所有效果都設有「減少動態」及不支援 WebGL 時的備用畫面

### 品牌色

| 用途 | 網站現用 | Logo 實際顏色 |
|---|---|---|
| 主色（深綠） | `#4F9A1C` | `#30583E` |
| 輔助色（淺綠） | `#8CC63F` | `#7CC27C` |
| 內文 | `#2B2B2B` | — |

> ⚠️ 網站色與新 logo 色有少許差異，**待決定是否將全站顏色改為跟 logo**。

### Logo

- 2026-11-11 換上六角形 pm logo（頂部、頁尾、favicon、iPhone 主畫面圖示、分享縮圖）
- 網站頂部為深色，logo 放在白色圓角底上
- 檔案：`static/assets/logo-512.png`、`logo-192.png`、`favicon.png`、`apple-touch-icon.png`
- 現有 logo 為由 JPG 去背的 PNG；**仍需向設計師索取 SVG／透明底原檔**

---

## 5. 如何修改內容

所有文字集中在 **`content/site.json`**：

1. 在 GitHub 打開 `content/site.json`
2. 按鉛筆圖示編輯
3. 按 **Commit changes**
4. 約 1 分鐘後網站自動更新

| 欄位 | 內容 |
|---|---|
| `site` | 電話、WhatsApp、電郵、Facebook、Instagram、Google Analytics |
| `home` | 主頁文字、統計數字、四大賣點、最新消息 |
| `about` | 關於我們、配對流程 |
| `history` | 品牌歷程、傳媒剪報、相簿 |
| `categories` | 三大服務分類 |
| `services` | 15 個服務頁（`category` 決定歸入哪個分類） |

加圖片：GitHub → `static/assets/` → **Add file → Upload files**。

### 檔案結構

```
content/site.json          所有文字內容
build.js                   將內容生成所有頁面（無需安裝套件）
static/assets/style.css    設計樣式
static/assets/main.js      WebGL 動畫及互動
static/assets/vendor/      three.js
README.md                  簡易使用說明
PROJECT.md                 本文件
```

### 其他自動生成

- `_redirects`：舊網中文網址（如 `/課程介紹/SEN專業支援`）自動 301 轉到新頁面，網域接駁後生效
- `sitemap.xml`、`robots.txt`

---

## 6. 網域及商用電郵（進行中）

### 網域選擇

| 網域 | 狀況 | 費用 |
|---|---|---|
| praisemore.com | 已被註冊 | — |
| praisemorehk.com | Cloudflare 可買 | 約 US$11.17／年 |
| **praisemore.hk** | 經 HKDNR 購買 | HK$250／年（Leon 報價） |
| praisemore.com.hk | 需 Praise 商業登記（BR） | 未查 |

**傾向：praisemore.hk**（香港本地網域，較適合學校客戶）

### 購買後步驟

1. 在 HKDNR 購買 praisemore.hk，**開啟自動續期**
2. 在 Cloudflare 加入網域（免費版，無額外收費）
3. 在 HKDNR 將 Nameserver 改為 Cloudflare 指定的兩個
4. 在 Cloudflare Pages 將網站接駁 praisemore.hk（SSL 自動配置）
5. 開 Google Workspace 商用電郵（Business Starter 約 HK$45／用戶／月，2024 年價，落單時再確認）
6. 設定 Google 驗證、MX、SPF、DKIM 記錄
7. Resend 驗證網域，EDM 改用新網域寄出

### 待決定

- [ ] 網域及 Cloudflare 掛在誰的帳戶（現時用 Leon 個人帳戶；Praise 付款，日後轉交 Sarah 會較麻煩）
- [ ] 開多少個電郵用戶（例如 `leon@`、`info@`、`sarah@`）

---

## 7. 待辦清單

### 高優先

- [ ] **搬圖片**：AI 到校課程、「智」啟學教計劃兩頁配圖，及 22 張傳媒剪報，現時仍直接連去舊網 praise.com.hk。舊網停用前必須搬入新網站 repo
- [ ] 購買網域並接駁網站（見第 6 節）
- [ ] 開商用電郵

### 內容確認

- [ ] 確認品牌歷程兩段新撰文字
- [ ] 決定是否將全站顏色改為 logo 顏色
- [ ] 索取 logo SVG／透明底原檔
- [ ] 是否在副標題加入「一站式」字眼（建議：「學校一站式健康校園及教育支援」）
- [ ] 確認聯絡電話：網站現用 **6620 3724**（舊網號碼），EDM 用 **6578 2601**，需統一

### 可選

- [ ] 將 GitHub repo 改為 Private（Settings → Danger Zone）
- [ ] 網域接駁後，與 Artech 協調舊網停用時間

---

## 8. 費用摘要

| 項目 | 費用 |
|---|---|
| Cloudflare Pages 寄存 | 免費 |
| GitHub | 免費 |
| SSL | 免費（Cloudflare 自動） |
| 網域 praisemore.hk | HK$250／年 |
| Google Workspace | 約 HK$45／用戶／月 |
| Cloudflare Pro（暫不需要） | 約 US$20／月 |

---

## 9. 時間線

| 日期 | 事項 |
|---|---|
| 2026-11-04 | 收集舊網內容、設計及建置新網站，push 到 GitHub，接駁 Cloudflare Pages 上線 |
| 2026-11-10 | 研究網域（.com／.hk／.com.hk）及商用電郵方案 |
| 2026-11-11 | 選定六角形 pm logo，更新到網站 |
| 2026-11-14 | 撰寫本項目總結 |
