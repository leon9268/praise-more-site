# 任務：用 Google Flow 生成網站配圖，並放上 Praise More 網站

> 撰寫：2026-11-18。執行者：Claude Code。負責人：Leon。
> 網站：https://www.praisemore.com.hk（Cloudflare Pages，push 到 `main` 約 1 分鐘自動部署）

## 0. 先讀

- `PROJECT.md`：網站結構、內容檔、部署方式
- `content/site.json`：所有文字內容；`build.js`：生成全部頁面（`node build.js` → `dist/`）
- 不要改動任何文字聲稱，尤其 GoldShield 頁（只可寫 EPA 標籤批准的講法，不可加殺病毒、99.99%、新冠等字眼）

## 1. 用 Flow 生成圖片

- 用 Claude in Chrome 打開 https://flow.google.com （Leon 的 Google 帳戶已登入）。開新分頁做，不要動其他分頁。
- 圖片比例 16:9，每條指示生成 2–4 張，揀最好一張。
- 每條指示後面加上以下統一風格：

```
Photorealistic, natural soft daylight, warm and clean atmosphere with fresh green accents, shallow depth of field, documentary style, Hong Kong setting, no text, no logos, no watermarks, 16:9
```

- 揀圖時剔除：手指數目錯、面部變形、背景出現亂碼字或標誌、看似真實學校校徽或校服。
- 下載原圖，以下方 `檔名` 命名（.png 或 .jpg 均可），存到 `static/assets/photos/src/`（此資料夾加入 `.gitignore`，不上傳原圖）。
- **先做 5 張試樣**：home、shadow-teacher-tutoring、goldshield-coating、ai-school-courses、campus-cleaning。做好後停下，把 5 張圖給 Leon 看，Leon 確認風格才做其餘。
- 短片（最後兩條）要 Leon 另外確認先做，會用較多額度。

### 不可用 AI 生成（要真相，Leon 會另外提供）
- 許秀香老師（Sarah Hui）個人照
- GoldShield 產品樽身標籤

### 圖片清單（23 張）

| 檔名 | 用於 | 指示 |
|---|---|---|
| home | 首頁 | A warm scene of a Hong Kong kindergarten classroom, a friendly female teacher kneeling beside two young Asian children building colourful blocks together, bright window light, green plants |
| about | 關於我們 | A small team of four Hong Kong education professionals in smart-casual clothes having a friendly meeting around a light wooden table with notebooks and a tablet, bright modern office with plants |
| schools | 學校專區 | A school principal and a consultant shaking hands in a bright Hong Kong primary school corridor, students' artwork on the wall behind, blurred background |
| home-classes | 上門興趣班 | A young female tutor teaching a 6-year-old Asian girl to play the keyboard in a cosy Hong Kong apartment living room, afternoon light |
| centre-classes | 中心興趣班 | A small group of five preschool children doing a colourful art activity at a round table in a bright activity centre, teacher smiling and guiding |
| online-classes | 網上興趣班 | An 8-year-old Asian boy at home attending an online class on a laptop, waving at the teacher on screen, headphones on, tidy desk with notebook and pencils |
| domestic-helper-matching | 外傭配對 | A Southeast Asian domestic helper reading a picture book to a young child on a sofa in a Hong Kong home, warm and caring moment |
| sen-support | SEN 專業支援 | A patient female educator sitting at a child's eye level, using picture cards to communicate with a 5-year-old boy in a calm, softly lit learning room |
| sen-classes | SEN 興趣班 | Three children in a small-group sensory play class with soft balls and textured mats, an instructor encouraging them, calm and joyful mood |
| shadow-teacher-tutoring | 影子老師 | In a Hong Kong primary school classroom, a shadow teacher sitting beside a young student at his desk, gently pointing to his workbook while the class continues in the background, shot from behind at a slight angle |
| brain-training | 專注力訓練 | A 7-year-old child concentrating on a colourful puzzle game at a table, an educator observing with a clipboard, bright and calm room |
| school-based-classes | 校本興趣班 | Hong Kong primary school students in a bright classroom enjoying an after-school drama and music activity, instructor leading, energetic but orderly |
| school-brain-programme | 校本腦效能計劃 | A small group of four primary school students doing focus-training card activities with an instructor in a school activity room |
| school-support | 到校支援服務 | A teacher and a support specialist discussing a student's learning plan at a desk in a school staff room, documents and a laptop |
| ai-school-courses | AI 到校課程 | Hong Kong secondary school students working in pairs on laptops in a modern computer room, exploring an AI chatbot, a teacher walking between desks |
| smart-learning-plan | 「智」啟學教計劃 | A teacher using a large interactive display showing abstract data charts in a modern classroom, students watching attentively |
| goldshield-coating | GoldShield 抗菌塗層（示意圖） | A cleaning technician in a light green uniform and gloves spraying a clear coating from an unbranded white spray bottle onto an empty classroom desk, after school, chairs stacked, evening light |
| campus-cleaning | 校園清潔及消毒（示意圖） | Two professional cleaners in uniforms wiping down door handles and desks in an empty bright kindergarten playroom, colourful toys neatly stored |
| home-cleaning | 家居清潔及消毒 | A cleaner wiping a child's bedroom surfaces in a tidy Hong Kong apartment, soft toys on the bed, bright natural light |
| article-what-is-shadow-teacher | 影子老師文章 | Close-up of an adult's hand gently guiding a child's hand holding a pencil on a workbook, warm light |
| article-smart-learning-grant-guide | 智啟學教文章 | A teacher's desk with a laptop showing abstract AI icons, a coffee cup and lesson plans, bright school office |
| article-antimicrobial-coating-vs-disinfection | 抗菌塗層文章 | A clean, empty bright classroom with sunlight on the desks, fresh and hygienic atmosphere |

### 短片（2 段，Leon 確認後先做；8 秒、16:9）

| 檔名 | 用於 | 指示 |
|---|---|---|
| video-home | 首頁背景 | Slow cinematic dolly shot through a bright Hong Kong kindergarten classroom, children playing and a teacher smiling, soft daylight, gentle movement, no text |
| video-coating | GoldShield 頁背景 | Slow close-up of a technician in gloves spraying a fine clear mist from an unbranded spray bottle onto a clean classroom desk, light catching the mist, calm and clean, no text |

## 2. 處理圖片

- 用 sharp 或 Pillow 轉成 WebP，輸出到 `static/assets/photos/`：
  - `<檔名>.webp`：闊 1600px，quality 80，目標每張 < 200KB
  - `<檔名>-800.webp`：闊 800px（手機用，配 `srcset`）
  - `og/<檔名>.jpg`：1200×630 置中裁切，quality 82，作分享縮圖
- 短片：ffmpeg 轉 H.264 MP4，靜音、720p、`-preset veryfast -crf 28`，目標 < 2MB；再截第一格做 poster（WebP）。

## 3. 放上網站

1. `content/site.json`：每個服務、文章、頁面加 `photo` 欄位（檔名）及 `photoAlt`（中文 alt，描述圖中內容，自然地帶入頁面主關鍵字，例如「影子老師在小學課室陪伴學生上課」）。
2. `build.js`：
   - 服務頁：用本地 `photo` 取代現時連去舊網的 `image`（`IMG` 常數指向 praise.com.hk，AI 到校課程、智啟學教兩頁仍用舊網圖，保留舊圖直至 Leon 決定）。圖放在 lead 段落之上，用 `<picture>`/`srcset`（800／1600），加 `width`、`height` 避免版面跳動，第一張圖不要 `loading="lazy"`，其餘要。
   - 首頁、關於我們、學校專區：在 hero 下方第一個 section 加入圖片，配合現有設計（圓角 `var(--radius)`、細邊框）。
   - 文章頁：標題下方加封面圖。
   - GoldShield、校園清潔兩頁的圖片下方加細字「示意圖」。
   - `head()`：`og:image` 改用該頁的 `og/<檔名>.jpg`，沒有就用 logo；同時把圖片加入該頁 JSON-LD（Service／Article 的 `image`）。
3. 不要動 WebGL 動畫，不要改任何文字內容。

## 4. 檢查

- `node build.js` 無錯誤。
- 本地開 `dist/`（`python3 -m http.server`），用桌面 1440px 及手機 390px 截圖檢查：首頁、影子老師、GoldShield、學校專區、一篇文章。圖片清晰、不變形、文字不被遮擋。
- 每頁只有一個 H1；每張圖都有 alt；頁面總圖片重量合理（首頁 < 1MB）。

## 5. 提交

- commit 訊息用中文，簡述加了哪些圖片；push 到 `main`。
- 上線後到 https://www.praisemore.com.hk 抽查 3 頁。
- 在 `PROJECT.md` 加一節記錄：用了哪些 AI 示意圖、哪些頁仍待真相（Sarah 個人照、GoldShield 標籤）。
- 最後向 Leon 報告：完成了哪些、哪些圖重新生成過、剩下甚麼待辦。
