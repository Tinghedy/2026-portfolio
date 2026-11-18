# Design System — Style C「Light Grey × Blue」

這份文件說明網站的視覺系統：token 是什麼、什麼時候用、以及幾個元件與動態的行為。
改樣式之前先讀這份；新增的東西如果這裡沒有對應的 token 或規則，先補文件再寫 code。

- **來源**：Figma 檔 `x2xfHe6kMY0IHgoM4WfbYq`，頁面「01 Design system」，frame「C — Light Grey × Blue（定案）」（node `59:2`）；作品卡片元件組 Work Card（node `60:44`）。
- **Token 檔**：[`public/tokens.css`](../public/tokens.css)。變數名稱就是 Figma 變數的 WEB code syntax（例如 Figma `color/accent` → `var(--color-accent)`）。
- **誰在讀它**：主站（`index.html` 用 `<link>` 載入）、首頁開場動畫 iframe（`public/hero.html`）、GSAP（`src/motion/tokens.js` 在執行時讀 CSS 變數）。**值只改 `tokens.css` 一個地方**，CSS 與 JS 會一起跟著變。
- 舊的 Style A（Block & Grid）、Style B（Grey Light）仍在 Figma 同一頁，但不再沿用它們的 token。

---

## 四條規則

這套系統的骨架。實作時遇到沒規定的情況，用這四條判斷。

1. **矩形 = 注意力在這裡。** 首頁的方塊、作品卡片上清楚的方框、導覽列的目前頁、按鈕，都是同一個視覺語言：被框起來的地方就是焦點。不要拿矩形框當純裝飾。
2. **主色只給「現在在哪／可以互動」。** `--color-accent` 用在目前位置與可互動元素（目前頁、主要按鈕、鍵盤焦點框），一個畫面最多兩三塊。靜態內容一律用灰階。
3. **直角、無陰影、對齊 8px 方格。** 圓角一律 `--radius-none`，不加 `box-shadow`。尺寸與間距用 spacing token 或 `--grid-unit` 的倍數。**首頁背景漸層是唯一例外**。
4. **模糊只用在圖上。** 標題、年份、任何文字永遠清楚。模糊是「失焦」的意思，只屬於影像。

---

## Token

### 顏色（語意層）

Figma 裡這層別名到 Primitives 集合（`grey/50…700`、`ink`、`white`、`blue/500`、`blue/700`）。程式碼只用語意層，不直接用 primitive。

| Token | 值 | 用途 |
|---|---|---|
| `--color-bg-page` | `#F6F6F6` | 全站頁面底色（Works 頁也是，不再用黑底） |
| `--color-bg-surface` | `#ECEDEF` | 次一層的面：卡片圖片底色、沒有封面時的方塊 |
| `--color-bg-surface-strong` | `#DCDEE2` | 需要更明顯區隔的面（選取列、按下狀態） |
| `--color-text-primary` | `#0A0A0C` | 主要文字、標題 |
| `--color-text-secondary` | `#5A6069` | 次要文字：年份、說明、標籤 |
| `--color-text-on-accent` | `#FFFFFF` | 放在主色上的文字（對比 7.10:1，過 AAA） |
| `--color-accent` | `#1043E5` | 主色：目前位置、可互動元素、焦點框（放淺灰底 6.11:1） |
| `--color-accent-strong` | `#0B2FA6` | 淺底上的文字連結、主色元素的 hover/按下 |
| `--color-border-hairline` | `#C6CAD0` | 細分隔線、沒有封面時卡片上的方框 |
| `--color-rule-on-photo` | `#FFFFFF` | 疊在照片上的線與小字（卡片方框、十字、標籤） |

### 暖墨色階（作品內頁 case study 專用）

只有一個 RGB 底值，其他層級都是它的 alpha。深色模式只需換 `--ink-rgb` 與 `--color-bg-warm`。目前只用在 `/works/:id`，其他頁仍是 Style C 的冷灰。

| Token | 值 | 用途 |
|---|---|---|
| `--ink-rgb` | `54, 54, 48` | 底值，只拿來組 `rgba(var(--ink-rgb), α)` |
| `--color-bg-warm` | `#FBFAF4` | 作品內頁底色（暖米白） |
| `--color-ink-secondary` | α 0.6 | 日期、meta、圖說、引言、連結底線 |
| `--color-ink-code` | α 0.08 | inline code 底色 |
| `--color-ink-fill` | α 0.05 | 圖片載入前底色、透明 PNG 襯底 |
| `--color-ink-line` | α 0.1 | 細線：圖片外框、hr、引言左線 |

主要文字沿用 `--color-text-primary`。

### 方格與間距

| Token | 值 | 用途 |
|---|---|---|
| `--grid-unit` | `8`（無單位） | 方格單位，當倍數用：`calc(var(--grid-unit) * 14px)` = 112px |
| `--spacing-xs` | `4px` | 緊貼的文字之間（標題與年份） |
| `--spacing-sm` | `8px` | 元件內小間距（卡片圖與文字） |
| `--spacing-md` | `16px` | 一般間距；也是捲動淡入的位移距離 |
| `--spacing-lg` | `24px` | 欄與欄之間（作品牆的欄距） |
| `--spacing-xl` | `40px` | 區塊之間、作品牆的列距 |
| `--spacing-2xl` | `64px` | 大段落之間 |
| `--spacing-gutter` | `56px` | 頁面左右外緣留白（桌機） |

`--grid-unit` 刻意不帶單位，才能乘出任何 8 的倍數；spacing 系列帶 `px`，可以直接當長度用。

### 圓角

| Token | 值 | 用途 |
|---|---|---|
| `--radius-none` | `0` | 所有元件。系統裡沒有圓角。 |

### 動態

| Token | 值 | 用途 |
|---|---|---|
| `--duration-step` | `120ms` | 方塊走一格、小的狀態切換（按鈕底色） |
| `--duration-base` | `240ms` | 一般過場：hover 顏色、導覽列、換頁淡出 |
| `--duration-focus` | `550ms` | 對焦：卡片對焦、捲動淡入、換頁淡入、平滑捲動的追趕時間 |
| `--duration-flip` | `700ms` | **只給**作品卡片 ↔ 案例頁的 FLIP：米白底長出來＋封面飛行 |
| `--ease-step` | `steps(4, end)` | **方塊類**：一格一格跳，不平滑 |
| `--ease-focus` | `cubic-bezier(.2,.6,.2,1)` | **對焦類**與其他所有平滑動態 |
| `--ease-fall` | `cubic-bezier(.55,.02,.78,.36)` | 下墜：越掉越快（首頁方塊落下） |
| `--ease-flip` | `cubic-bezier(.34,1.1,.64,1)` | **只給**作品卡片 → 案例頁的 FLIP 放大：稍微衝過頭再回彈 |

**不要在頁面裡自己寫時間或曲線**（`0.3s ease`、`power2.out` 之類）。CSS 用 `var(--duration-*) var(--ease-*)`；GSAP 用 `getMotion()`（見下方）。

---

## 動態

### 兩類動態

- **方塊類** → `--ease-step`：矩形在方格上移動、出現、消失（首頁俄羅斯方塊、消行）。逐格跳，看起來像格子在走。
- **對焦類** → `--ease-focus`：東西從失焦到清楚、從無到有（卡片對焦、捲動淡入、換頁）。其餘不屬於方塊的平滑過場（hover 變色等）也用這條。
- **下墜** → `--ease-fall`：只給「從上面掉下來」的方塊。

時長取最接近的 token：小的回饋 `step`、一般過場 `base`、對焦與進場 `focus`。

### GSAP

GSAP 的時間與曲線一律從 [`src/motion/tokens.js`](../src/motion/tokens.js) 取：

```js
import { gsap, getMotion } from "../motion/tokens";
const m = getMotion();
gsap.to(el, { autoAlpha: 1, duration: m.duration.focus, ease: m.ease.focus });
```

- `getMotion()` 在執行時讀 CSS 變數，`cubic-bezier()` 轉成 GSAP CustomEase，`steps(4, end)` 轉成**與 CSS 完全一致**的函式。注意：GSAP 內建的 `"steps(4)"` 與 CSS `steps(4, end)` 不同（它有 5 階、在 80% 就到終點），不要直接用。
- 外掛（ScrollTrigger、ScrollSmoother、CustomEase）在 `tokens.js` 統一註冊。GSAP 3.13 起所有外掛都在公開的 `gsap` npm 套件裡，`npm install gsap` 即可，`import { ScrollSmoother } from "gsap/ScrollSmoother"`；不需要私有 registry 或 `gsap-trial`。

### 全站行為

| 行為 | 實作 | Token |
|---|---|---|
| 平滑捲動 | ScrollSmoother，`src/motion/PublicLayout.jsx` | 追趕時間 `duration-focus`、`ease-focus`；觸控裝置維持原生捲動 |
| 捲動淡入 | `<Reveal>`，`src/motion/Reveal.jsx`：上移 `spacing-md` 並淡入，只播一次 | `duration-focus`、`ease-focus` |
| 換頁轉場 | 舊頁淡出 → 換路由、捲回頂端 → 新頁淡入 | 淡出 `duration-base`、淡入 `duration-focus`，都用 `ease-focus` |
| 游標跟隨 | `src/components/Cursor/Cursor.jsx` | `duration-base`、`ease-focus` |

- 固定定位的東西（Navbar、游標）必須放在 `PublicLayout` **外面**：ScrollSmoother 會對內容做 transform，裡面的 `position: fixed` 會跟著捲走。`position: sticky` 在 smoother 裡也不會作用。
- 不要再加 `html { scroll-behavior: smooth }`，會和 ScrollSmoother 打架。
- 後台（`/admin`）不包 `PublicLayout`，沒有平滑捲動與轉場。

### prefers-reduced-motion

使用者開啟「減少動態」時：

- 不建立 ScrollSmoother（原生捲動），沒有換頁轉場，新頁直接出現在頂端。
- `<Reveal>` 不做動畫，內容直接就位。
- 作品卡片直接顯示清楚版本，沒有模糊、方框、標籤。
- 全域 CSS（`src/index.css`）把所有 transition / animation 時長歸零。
- 首頁開場動畫有自己的處理（俄羅斯方塊只擺出靜止箭頭）。

---

## 作品卡片（Work Card）

元件：[`src/components/WorkCard/`](../src/components/WorkCard/)。對應 Figma 元件組 Work Card（`60:44`），變體 `State=Default` / `State=Hover`。

### 外觀

- 圖片 3:2（Figma 360×240），底色 `--color-bg-surface`。
- **Default**：整張失焦（`blur(8px)`，對應 Figma 的 layer blur），只有兩個方框內清楚。方框有 1px 白色細框線（`--color-rule-on-photo`）。旁邊有小字標籤（`01 / 類別`、年份）和一個 16px 十字記號。
- **Active**：整張對焦，方框、標籤、十字淡出。`--duration-focus` + `--ease-focus`。
- 標題與年份在圖**外**，永遠清楚（規則 4）。標題最多兩行。
- 方框位置是 Figma 的版面，以百分比寫在 `WorkCard.jsx` 的 `FRAMES`；想讓卡片之間有變化，往這個陣列加預設即可。

### 什麼時候是 Active

| 情境 | 觸發 |
|---|---|
| 滑鼠 | hover |
| 鍵盤 | `:focus-visible`（等同 hover；滑鼠點擊造成的 focus 不算） |
| 觸控裝置（沒有 hover） | 卡片圖片進入畫面中央 10% 的帶狀區時（IntersectionObserver） |
| 減少動態 | 永遠是清楚版本，沒有過場 |

影片封面在 Active 時播放，離開時停止並回到開頭。

### 實作方式

只用一個 `<img>` / `<video>`（清楚的），上面蓋一層 `backdrop-filter: blur()`，再用 CSS mask 在方框位置挖洞。Active 時把模糊動畫到 0。這樣影片封面也適用，不必疊好幾份媒體。

### 沒有封面

不會壞：顯示 `--color-bg-surface` 的方塊，方框改用 `--color-border-hairline`、標籤用 `--color-text-secondary`，hover 時一樣消失。

---

## 作品卡片的小劇本（HoverPlayCard）

元件：[`src/components/HoverPlayCard/`](../src/components/HoverPlayCard/)。**改劇本只改 [`scripts.js`](../src/components/HoverPlayCard/scripts.js)**，以作品 id 對應；沒列的作品不播劇本，只保留模糊 → 對焦。

- 卡片先對焦（`--duration-focus`），再播劇本：面板浮出 → 每字 30ms 打字（加閃爍游標，系統裡唯一的主色）→ 方塊以 0.08s 間隔往上浮出 → 停 2 秒 → 淡出再循環。
- 移開／失焦：暫停，`--duration-base` 淡回封面，歸零。觸控裝置：卡片到畫面中間才播（和對焦同一個判斷）。畫面外一律暫停。
- 減少動態：不播動畫，作用中時直接顯示完成狀態。
- 劇本內容取自各案例內文裡實際出現的詞。

## 卡片 → 案例頁（FLIP）

[`src/motion/CaseOverlay.jsx`](../src/motion/CaseOverlay.jsx)、[`src/motion/flip.js`](../src/motion/flip.js)。

- 從卡片點進去：網址變成 `/works/:id`（可分享），但作品牆不卸載，案例頁以 overlay 疊在上面（`history.state.backgroundLocation`，由 `PublicLayout` 判斷）。
- 開啟（`--duration-flip` + `--ease-flip`，以下同時開始）：遮罩淡入（`--duration-base`）；米白底從卡片的位置長成全螢幕；卡片圖從格子位置飛到頂端主視覺（3:2 等比、直角不變）。飛到 55% 時上方 Back 與標題淡入、上浮 8px。落地後才掛上 meta、正文、圖庫並淡入（Supabase 抓回來的完整資料也等落地才套用）；主視覺重播一次劇本；焦點移到標題。
- 關閉（Back 按鈕、`Esc`、瀏覽器上一頁）：文字先淡出（`--duration-step`），封面與米白底一起縮回原卡片、遮罩淡出。作品牆捲動位置不變，焦點回到卡片。
- 效能規則：飛行中只動 transform 與 opacity。Flip 一律 `scale: true`、不加 `absolute`；飛行中不要讓 React 改案例頁的 DOM（新內容等落地再掛）。
- 直接打開 `/works/:id`：一般頁面＋淡入，不跑 FLIP。減少動態：不放大，只淡入淡出。
- 開啟期間背後鎖捲動、設 `inert`；動畫中忽略重複點擊。
- 注意：ScrollSmoother 會把取得焦點的元素捲進畫面，已用 `onFocusIn` 限定只處理平滑捲動內容裡的元素，否則焦點移進 overlay 會把背後的頁面捲到底。

## 作品內頁（Case study page）

`src/pages/Works/WorkDetail.jsx` + `WorkDetail.module.css`。排版對齊 haoqi.design/adrive，只動樣式層，資料與文字不變。

- **容器**：單欄置中，`max-width: 880px`，左右 24px，上下 72px（≥1024px 為 96px）。沒有雙欄、卡片或 grid 區塊。
- **頁首**：← Back → 10vh 留白 → 封面主視覺（3:2，FLIP 終點，重播劇本）→ h1 → meta 一行（4px，mono、tabular-nums、14px、secondary）→ 正文（第一段即 intro）。沒有封面大圖。
- **字級**：h1 48/60/700/−1.2px（<768px 為 30px）；h2 28/35/600，上 56 下 16；h3 24/30/600，上 48 下 16；h4 20/27.5/600，上 40 下 16；正文 16/26（<768px 為 14px）。標題都有 `scroll-margin-top: 96px`。
- **垂直節奏**：只有一條規則：`.prose > * + * { margin-top: 16px }`。標題、圖片、hr 用自己的 margin 覆蓋（margin 會合併取大值）。每個區塊的第一個子元素 `margin-top: 0`。
- **圖片**：滿寬、直角、`--color-ink-line` 細框、`--color-ink-fill` 底色，上下 24px；無陰影、無裝置框。點擊或 Enter 開 lightbox（`src/components/Lightbox/`，原生 `<dialog>`，Esc 關閉）。
- **圖說**：圖片後、整段只有 `<em>` 的段落自動視為圖說：14px、secondary、正體、靠左，與圖距 8px。
- **並排**：連續兩張以上的圖自動包成 `[data-image-row]`：兩欄 grid、gap 16px、同高（`object-fit: cover`）；<768px 疊成一欄。
- **hr**：1px `--color-ink-line`，上下 32px。只用在功能區塊切換（目前只有文末「Back」之前一條）。
- 以上的 `data-*` 標記由 `prepareHtml()` 在 render 前加上，不改寫資料庫內容。

## 首頁開場動畫（HELLO → HEDY）

`public/hero.html`，以 iframe 嵌在首頁。它載入同一份 `/tokens.css`，CSS 的時長與緩動都用 token；**JS 時間軸（`setTimeout` 的時間點、延遲、邏輯）是作者手調的，不屬於這套 token，不要改**。

- 背景漸層與飄動的光暈（17s / 21s / 25s 循環）是規則 3 的例外，不套 token。
- `opacity 1ms linear` 是「瞬間切換」的技巧，不是動畫，保留原樣。

---

## 字體

- **定案**：LINE Seed（中文 LINE Seed TW、英數 LINE Seed EN），SIL OFL 1.1，自架 webfont。
- **現況**：尚未切換，暫時仍是 Google Fonts 的 Raleway（標題）／Noto Sans TC（內文）。小字標籤用 Space Mono（`--font-mono`），是否保留未決定。
- 字體堆疊定義在 `src/index.css` 的 `--font-*`。

## 待補

- Figma 尚未設計：導覽列、按鈕與連結、標籤、段落標題、頁尾、Works 作品牆版面、Home Hero、作品內頁標題區。在那之前這些元件只換了動態 token，視覺沒有照 Style C 重做。
- Blog 列表與文章頁已先依四條規則換成 token（淺底、直角、連結用 `--color-accent-strong`、小字標籤用 `--font-mono`）。作品內頁改走上面的 case study 規格。
- Blog、Notes 版面未決定；Notes 卡片目前仍有 `box-shadow`，與規則 3 不符。
