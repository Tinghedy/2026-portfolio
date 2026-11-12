# 2026 Portfolio

個人作品集網站，以極簡設計語言呈現作品、部落格與履歷，並附有後台管理系統。

---

## 設計理念

以「少即是多」為核心，捨棄視覺噪音，讓作品本身說話。  
頁面入場動畫以 GSAP 驅動，節奏克制而流暢；自訂游標在滑過互動元素時給予細微的觸覺回饋，在不干擾閱讀的前提下提升空間感。  
後台採用受保護的路由與 Supabase Auth，讓內容管理與公開展示完全解耦，發佈新文章或作品不需要重新部署。

---

## 特色功能

- **動態入場動畫** — GSAP Timeline 驅動的 Hero 區塊，元素依序淡入滑入
- **自訂游標** — GSAP 跟隨滑鼠位置並帶有延遲，懸停連結 / 卡片時自動放大
- **作品集管理** — 後台可新增、編輯、排序作品項目，支援圖片壓縮上傳（browser-image-compression）
- **部落格系統** — 使用 Tiptap 富文字編輯器撰寫文章，支援連結嵌入，以 slug 產生永久連結
- **拖曳排序** — 以 dnd-kit 在後台對作品與文章進行拖曳重新排序
- **受保護的後台** — Supabase Auth 登入驗證，搭配 AuthGuard 元件確保未授權者無法存取 `/admin/*` 路由
- **SPA 路由支援** — vercel.json 設定 rewrite，確保重新整理或直接輸入 URL 時不出現 404

---

## 本機開發

```bash
npm install
cp .env.example .env.local   # 填入實際的值
npm run dev                  # 前台與後台一般功能
```

後台的 **AI 助手**和 **Figma 匯入**會呼叫 `api/` 底下的 Vercel Serverless Function，`npm run dev` 不會啟動它們。要測這兩個功能請改用：

```bash
npx vercel link              # 第一次才需要
npx vercel env pull .env.local
npx vercel dev
```

## 環境變數

| 變數 | 位置 | 說明 |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | 前端（公開） | 設計上可公開，寫入權限由 RLS 控管 |
| `GEMINI_API_KEY` | 僅伺服器 | Gemini API，由 `api/gemini.js` 使用 |
| `FIGMA_TOKEN` | 僅伺服器 | Figma REST API，由 `api/figma.js` 使用 |
| `ADMIN_EMAIL` | 僅伺服器 | 只有此 email 登入後才能呼叫 `/api/*` |

> ⚠️ 金鑰類變數**不要**加 `VITE_` 前綴，否則會被打包進前端 JS 公開。

