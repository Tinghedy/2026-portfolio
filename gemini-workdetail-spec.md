# Gemini Spec — WorkDetail 圖文排版優化

> 給 VS Code Agent（Gemini）的施工規格。
> 目標：優化 `2026-portfolio` repo 裡 WorkDetail 頁的 **prose 排版樣式**，
> 讓內文中穿插的圖片、圖說、標題呈現出 case study（作品集）質感。
> 這是**純 CSS / 樣式**任務，不碰資料庫、不碰 admin、不改資料流。

---

## 0. 這份 spec 的邊界（施工者先讀，非常重要）

**只能改這一個檔案：**
- `src/pages/Works/WorkDetail.module.css`

**唯一例外**（若下方 §3 需要）：可在 `src/pages/Works/WorkDetail.jsx` 的 prose 區塊外層加 CSS class，但**不得改動任何資料抓取、state、Supabase 查詢邏輯**。

**絕對禁止：**
- ❌ 改 `src/lib/`、`src/pages/admin/`、`supabase/`、任何 `.env`
- ❌ 改資料庫 schema、migration
- ❌ 改 `ProjectForm.jsx`、`ResizableImage.jsx`
- ❌ 改 WorkDetail 的資料流（`useEffect` / `supabase.from` / `dangerouslySetInnerHTML` 的用法）
- ❌ 新增套件（不要 npm install 任何東西）

**背景認知（不要搞錯）：**
- WorkDetail 的內文來自 Supabase `description` 欄（HTML 字串），用 `dangerouslySetInnerHTML` 渲染在 `.prose` 容器內。
- 使用者在後台 Tiptap 編輯器裡「打字＋插圖」，所以 `.prose` 裡的 HTML 會是 `<h2> <p> <img> <p> <img> ...` 交錯。
- 圖片是 `ResizableImage` 產生的 `<img>`，可能帶 inline `width` 屬性（使用者在後台拖曳縮放過）。**不要覆蓋圖片的 inline width**——那是使用者刻意設的尺寸。

---

## 1. 現況（施工前先讀這個檔案確認）

`src/pages/Works/WorkDetail.module.css` 目前的 `.prose :global(img)` 是：
```css
.prose :global(img) {
  width: 100%;
  height: auto;
  display: block;
  margin: 2.5rem 0;
  border-radius: 4px;
}
```
問題：一律滿版、沒有圖說（caption）樣式、沒有並排/置中的變化、圖片與前後段落的節奏太單調。頁面是 dark-page（深色底，文字為半透明白）。

---

## 2. 要達成的排版目標（Ray Ma 風格的關鍵特徵）

1. **圖片與內文的呼吸感**：圖片上下留白要夠、但不要過大到斷裂閱讀
2. **圖說（caption）**：Tiptap 圖片本身沒有 caption 機制，但若使用者在圖片「下一行」用斜體（`<em>`）寫一句話當圖說，要讓它看起來像圖說（置中、小字、更淡）
3. **不要覆蓋使用者設定的圖片寬度**：`ResizableImage` 會給 `<img>` inline `width`。CSS 只設 `max-width: 100%` 和置中，不要用 `width: 100% !important` 蓋掉
4. **維持深色主題**：所有新樣式的顏色沿用現有 rgba(255,255,255,…) 的體系

---

## 3. 具體修改（照做）

### 3.1 改寫 `.prose :global(img)` 區塊
把現有的 `.prose :global(img)` 換成下面這組。重點：用 `max-width` 取代 `width`（保留 inline width）、圖片置中、上下留白加大：

```css
/* 內嵌圖片：置中、保留使用者設定的寬度、上下呼吸 */
.prose :global(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 3.25rem auto 0.75rem;  /* 上大、下小（下方留給圖說） */
  border-radius: 6px;
}

/* 圖片後面若沒有圖說，補回底部間距 */
.prose :global(img + p:not(:has(em:only-child))) {
  margin-top: 2.5rem;
}
```

### 3.2 新增「圖說」樣式
使用者若在圖片下一行用斜體寫一句話（Tiptap 會輸出 `<p><em>…</em></p>` 緊接在 `<img>` 後），把它渲染成圖說：

```css
/* 緊接圖片後、且整段只有斜體文字 → 視為圖說 */
.prose :global(img + p) {
  text-align: center;
  font-size: 0.82rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 3.25rem;
}
.prose :global(img + p em) {
  font-style: normal;  /* 圖說不需要再斜體 */
  color: rgba(255, 255, 255, 0.4);
}
```

> 註：`img + p` 會影響「所有」緊接圖片的段落。這是刻意的約定——**圖片正下方那一段就是圖說**。內容指南會請使用者遵守這個規則（圖片下一行寫圖說、圖說後空一行再開始新段落）。

### 3.3 微調標題與圖片的節奏
確認 `.prose h2` 前若緊接圖片，間距不要打架。在現有 `.prose :global(h2)` 規則後面補一條：

```css
/* 圖片後接 H2 時，縮短過大的疊加間距 */
.prose :global(img + h2),
.prose :global(p + h2) {
  margin-top: 3rem;
}
```

### 3.4 （可選）並排雙圖
若使用者想並排放兩張圖（例如 before/after），Tiptap 預設做不到，但可支援一個簡單約定：使用者把兩張圖放進同一段落。加這條 CSS 讓同段落內的多圖並排：

```css
/* 同一段落內多張圖 → 並排 */
.prose :global(p:has(img + img)) {
  display: flex;
  gap: 1rem;
  margin: 3.25rem 0 0.75rem;
}
.prose :global(p:has(img + img) img) {
  margin: 0;
  flex: 1;
  min-width: 0;
}
```

---

## 4. 驗收條件（施工者逐條自我檢查）

1. `npm run build` 通過，零錯誤
2. 只動了 `WorkDetail.module.css`（若加 class 才碰 `WorkDetail.jsx`，且沒改資料流）
3. 內嵌圖片：置中、上下有呼吸、圓角 6px
4. 使用者設過寬度的圖片，寬度**沒有被 CSS 蓋掉**（inline width 仍生效）
5. 圖片正下方的斜體段落，呈現為置中小字圖說
6. 深色主題沒被破壞（文字仍是半透明白，沒有出現黑字或白底）
7. 手機寬度（≤600px）圖片不破版、並排圖會掉成單欄（`:has(img+img)` 的 flex 在窄螢幕可加 `flex-wrap: wrap`）
8. 沒有 npm install 新套件、沒碰 admin/supabase

> `:has()` 選擇器現代瀏覽器都支援（2023 後）。若 build 或 lint 對 `:has()` 報錯，保留 3.1–3.3 的核心樣式，3.4 並排雙圖可略過並在完工報告註明。

---

## 5. 完工後
- `npm run build` 最終確認乾淨
- `git add -A && git commit -m "style: refine WorkDetail prose typography for case-study layout"`（**只 commit，不 push**）
- 寫一句話完工報告：改了哪些選擇器、`:has()` 有沒有正常 build、有沒有需要人類決策的地方

## 6. 止損
最多 8 回合。同一錯誤修 3 次沒過就停，說明卡在哪，等人工。不要無限迴圈。
