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

### 三層架構（A1）

`tokens.css` 分三層，元件 CSS **只能用第 2、3 層**：

1. **Primitive**：原始值，依色相＋階層命名（`--color-primitive-neutral-500`、`--text-lg`）。只能被語意層引用。
2. **Semantic**：用途命名（`--color-text-secondary`、`--type-title`）。元件用這層。
3. **Component**：某個元件專用，指向語意層（`--tooltip-font`、`--article-h2-font`）。改某個元件的字，只改這裡一行。

Storybook 的 Foundations 頁直接解析 `tokens.css`，每列顯示「指向誰 → 實際值」，新增 token 會自動出現。完整準則與決策見 [`design-guidelines-draft.md`](design-guidelines-draft.md)。

### 顏色

**全站冷灰**（C4，2026-11-24 決定）：原本作品內頁的暖米白與暖墨色階已移除，案例頁和其他頁同一套。

| Token | 指向 | 值 | 用途 |
|---|---|---|---|
| `--color-bg-page` | neutral-50 | `#F6F6F6` | 全站頁面底色 |
| `--color-bg-surface` | neutral-100 | `#ECEDEF` | 次一層：卡片圖片底色、沒有封面的方塊、inline code |
| `--color-bg-surface-strong` | neutral-200 | `#DCDEE2` | 更明顯的面 |
| `--color-bg-raised` | neutral-0 | `#FFFFFF` | 浮起的面：彈窗、輸入框 |
| `--color-text-primary` | neutral-900 | `#0A0A0C` | 主要文字、標題 |
| `--color-text-secondary` | neutral-500 | `#5A6069` | 次要文字：年份、說明、標籤。三層背景上對比都 ≥ 4.7:1 |
| `--color-text-tertiary` | neutral-400 | `#8D939C` | 只給裝飾或停用狀態，不放必讀資訊 |
| `--color-text-on-accent` | neutral-0 | `#FFFFFF` | 主色上的文字（7.1:1） |
| `--color-accent` | blue-500 | `#1043E5` | 主色（見下） |
| `--color-accent-strong` | blue-700 | `#0B2FA6` | 淺底上的文字連結 |
| `--color-border-hairline` | neutral-300 | `#C6CAD0` | 看得見的細線、標籤外框 |
| `--color-border-subtle` | neutral-200 | `#DCDEE2` | 安靜的細線：圖片外框、hr、引言左線 |
| `--color-bg-inverse` | neutral-900 | `#0A0A0C` | 深色強調面：案例頁的強調色塊 |
| `--color-text-inverse` | neutral-0 | `#FFFFFF` | 深色面上的主要文字 |
| `--color-text-inverse-secondary` | neutral-300 | `#C6CAD0` | 深色面上的補充說明 |
| `--color-rule-on-photo` | neutral-0 | `#FFFFFF` | 疊在照片上的線與小字 |
| `--color-backdrop` | alpha-black-30 | | 案例頁、Notes 彈窗後的遮罩 |
| `--color-backdrop-heavy` | alpha-black-90 | | 圖片燈箱 |

**主色用途**（C3）：導覽列目前頁、游標提示、封面 badge 預設、焦點框、連結 hover、按鈕 hover、篩選標籤的選取狀態。不用漸層。

### 字體與字級

- **主字體** `--font-sans`：標題與內文共用（T1），層級靠字重和字級分，不再用第二套標題字。定案是 LINE Seed，webfont 還沒自架，目前顯示的是後備的 Noto Sans TC。
- **Mono** `--font-mono`（Space Mono 400／700）：小標籤與數據的識別（T2），包括 badge、標籤、年份、日期、meta、Back、游標提示、**導覽列連結與 Admin 按鈕**，以及首頁開場動畫底部那排資訊（大標與小字都是）。
- **字級階層**（T3，rem）：`--text-2xs` 11 · `xs` 12 · `sm` 14 · `md` 15 · `base` 16 · `lg` 18 · `xl` 20 · `2xl` 22 · `3xl` 26 · `4xl` 28 · `5xl` 34 · `6xl` 40。上面幾階照 meganyap.me 的案例頁：段落標題 22 → 26 → 28、案例標題 28 → 34 → 40。最大到 40px。
- **字重** 400／500／700；**行高** 1.2／1.3／1.5／1.65；**字距** -0.02em／0／0.06em／0.12em（T4）。
- `html` 字級是 `100%`，尊重使用者的瀏覽器設定（T7）。

**文字角色**（T5）：全站文字只能從這張表選。每個角色是一個 `font` 簡寫 token，加上選用的字距 token：

```css
font: var(--type-title);
letter-spacing: var(--type-title-tracking);
```

| 角色 | 規格 | 用在 |
|---|---|---|
| `--type-display` | 40 / 700 / 1.2 | 桌機案例標題（≥ 768px）、Resume 名字 |
| `--type-title` | 34 / 700 / 1.2 | 頁標題、平板案例標題（≥ 640px） |
| `--type-title-sm` | 28 / 700 / 1.2 | 手機案例標題 |
| `--type-section` | 28 / 700 / 1.2 | 案例頁 h2（≥ 768px；≥ 640px 用 `section-md` 26、手機 `section-sm` 22）、文章 h2 |
| `--type-subsection` | 20 / 700 / 1.3 | 案例頁、文章 h3 |
| `--type-body-lg` | 18 / 400 / 1.65 | Resume 自介 |
| `--type-body` | 16 / 400 / 1.65 | 預設內文、側欄目錄 |
| `--type-body-sm` | 14 / 400 / 1.65 | 案例頁、文章內文 |
| `--type-ui` | 15 / 500 / 1.5 | 作品卡片標題、導覽列、按鈕 |
| `--type-ui-strong` | 16 / 700 / 1.3 | Blog 卡片標題、h4、Logo |
| `--type-caption` | 14 / 400 / 1.5 | 圖說、摘要、次要說明 |
| `--type-label` | mono 11 / 700 / 大寫 / 0.06em | 標籤（`Label` 元件） |
| `--type-label-lg` | mono 14 / 400 / 大寫 / 0.06em | 大標籤：案例頁標題上方的 tags |
| `--type-data` | mono 14 / 400 | 年份、日期、meta、Back |
| `--type-tooltip` | mono 15 / 400 / 1.3 | 游標提示 |

### 版面（S3）

| Token | 值 | 用途 |
|---|---|---|
| `--layout-max` | `1600px` | 作品牆、Blog 的頁框最寬 |
| `--layout-gutter` | `56px` | 頁框左右留白（桌機）；手機 `--layout-gutter-mobile` 16px |
| `--layout-gap-x` / `-y` | `24px` / `40px` | 作品牆、Blog 的欄距／列距 |
| `--layout-reading` | `42.5rem`（680px） | 閱讀欄：Blog 文章、Resume（T6） |
| `--layout-case-main` | `68.75rem`（1100px） | 案例頁主文區最寬 |
| `--layout-case-text` | `58rem`（928px） | 案例頁標題與內文一行最長 |
| `--layout-case-media` | `47.5rem`（760px） | 案例頁圖片、互動插圖最寬 |
| `--layout-case-banner` | `35rem`（560px） | 案例頁封面橫幅最寬（3:2） |
| `--layout-case-sidebar` | `303px` | 案例頁側欄寬 |
| `--layout-nav-clearance` | `112px` | 頁面上方留給固定導覽列的空間 |

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
| `--spacing-3xl` | `96px` | 頁面上下留白 |
| `--spacing-gutter` | `56px` | 頁面左右外緣留白（桌機） |

`--grid-unit` 刻意不帶單位，才能乘出任何 8 的倍數；spacing 系列帶 `px`，可以直接當長度用。

### 圓角

| Token | 值 | 用途 |
|---|---|---|
| `--radius-none` | `0` | 所有元件。系統裡沒有圓角。 |
| `--radius-round` | `50%` | 唯一的例外：自訂游標（圓形）。新的例外要先加 token。 |

### 動態

| Token | 值 | 用途 |
|---|---|---|
| `--duration-step` | `120ms` | 方塊走一格、小的狀態切換（按鈕底色） |
| `--duration-base` | `240ms` | 一般過場：hover 顏色、導覽列、換頁淡出 |
| `--duration-focus` | `550ms` | 對焦：卡片對焦、捲動淡入、換頁淡入、平滑捲動的追趕時間 |
| `--duration-flip` | `700ms` | **只給**作品卡片 → 案例頁的展開 / 收合 |
| `--stagger` | `60ms` | 列表進場每項錯開，最多 8 步（M1）：作品牆、Blog（`<Reveal index>`） |
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
- 作品卡片不播劇本。
- 全域 CSS（`src/index.css`）把所有 transition / animation 時長歸零。
- 首頁開場動畫有自己的處理（俄羅斯方塊只擺出靜止箭頭）。

---

## 作品卡片（Work Card）

元件：[`src/components/WorkCard/`](../src/components/WorkCard/)。對應 Figma 元件組 Work Card（`60:44`），變體 `State=Default` / `State=Hover`。

### 外觀

- 圖片 3:2（Figma 360×240），底色 `--color-bg-surface`。
- 封面清楚顯示，沒有模糊、方框、十字或小字。
- **Badge**：封面左上角（內縮 `--spacing-md`，手機 `--spacing-sm`），文字 = `work.tag`，底色 = `work.tag_color`（後台設定），沒設定時用 `#1043E5`（`--color-accent`）。字色依底色自動選黑或白。外觀是 `<Label variant="solid">`。沒有 `tag` 就不顯示。元件：[`src/pages/Works/CoverTag.jsx`](../src/pages/Works/CoverTag.jsx)。
- **Active**：目前沒有變化（劇本已停用，見下方 HoverPlayCard）。影片封面會播放。
- 標題與年份在圖**外**，永遠清楚（規則 4）。標題最多兩行。

### 什麼時候是 Active

| 情境 | 觸發 |
|---|---|
| 滑鼠 | hover |
| 鍵盤 | `:focus-visible`（等同 hover；滑鼠點擊造成的 focus 不算） |
| 觸控裝置（沒有 hover） | 卡片圖片進入畫面中央 10% 的帶狀區時（IntersectionObserver） |
| 減少動態 | 不播劇本 |

影片封面在 Active 時播放，離開時停止並回到開頭。

### 沒有封面

不會壞：顯示 `--color-bg-surface` 的方塊，badge 照常顯示。

---

## 作品卡片的小劇本（HoverPlayCard）

> **目前停用**：作品卡片和案例頁封面都不播劇本。劇本裡的關鍵字方塊看起來像可以點的 tag，但其實沒有互動，容易讓人困惑。元件與 `scripts.js` 保留，之後若要恢復，在 `WorkCard.jsx`／`WorkDetail.jsx` 傳回 `script={scriptFor(id)}` 即可。

元件：[`src/components/HoverPlayCard/`](../src/components/HoverPlayCard/)。**改劇本只改 [`scripts.js`](../src/components/HoverPlayCard/scripts.js)**，以作品 id 對應；沒列的作品不播劇本，只保留模糊 → 對焦。

- 卡片先對焦（`--duration-focus`），再播劇本：面板浮出 → 每字 30ms 打字（加閃爍游標，系統裡唯一的主色）→ 方塊以 0.08s 間隔往上浮出 → 停 2 秒 → 淡出再循環。
- 移開／失焦：暫停，`--duration-base` 淡回封面，歸零。觸控裝置：卡片到畫面中間才播（和對焦同一個判斷）。畫面外一律暫停。
- 減少動態：不播動畫，作用中時直接顯示完成狀態。
- 劇本內容取自各案例內文裡實際出現的詞。

## 縮放檢視框（ZoomViewer）

[`src/components/ZoomViewer/`](../src/components/ZoomViewer/)。參考 mchiu.co.uk 案例頁的工作坊白板。給比畫面大很多的互動圖用（目前是 MetroSense 的資訊架構圖，畫布 1626×1960）。

- **框的大小固定**：寬度跟著欄位（案例頁最寬 760px），高 `--zoom-viewer-height` = `min(480px, 70vh)`。頁面不會被大圖撐高。
- **一開始整張圖縮進框裡**（四邊留 24px），淺灰底加 24px 方格，像白板。
- **移動**：捲動、觸控板，或滑鼠拖曳。按下後移動不到 4px 仍算點擊，所以圖裡的按鈕照常可以點。
- **縮放**：右下角 ＋／−（直角、36px），從「整張」到「5 倍」分 4 段，每段等比放大，`--duration-base` + `--ease-focus` 緩動。觸控板雙指縮放可以連續縮放。縮放時，游標（按鈕則是框的中心）下面那一點維持不動。
- 減少動態：按鈕縮放沒有動畫，直接跳到該段。

## 標籤（Label）

[`src/components/Label/`](../src/components/Label/)。全站唯一的小標籤（P2），字一律是 `--label-font`（mono 11px、粗體、大寫、字距 0.06em），直角。`size="lg"` 改用 `--label-font-lg`（mono 14px）。

| 變體 | 樣子 | 用在 |
|---|---|---|
| `plain` | 無框、secondary 色 | 日期、年份 |
| `outline` | 1px `--color-border-hairline` 框 | 內容標籤（Blog、Notes） |
| `fill` | `--color-bg-surface-strong` 底、secondary 字 | 案例頁標題上方的 tags（搭配 `size="lg"`） |
| `solid` | 色塊底（預設主色，可自訂） | 封面 badge（CoverTag） |

新的小標籤一律用這個元件，不要在頁面 CSS 裡另寫一套。

## 游標提示（Cursor Tooltip）

[`src/components/CursorTooltip/`](../src/components/CursorTooltip/)，掛在 `App.jsx`，全站只有一個。參考 mchiu.co.uk。

- 任何元素加上 `data-tooltip="…"`，滑鼠移上去就在游標**右下 24px** 顯示這段字；右邊快超出畫面時往左推，離邊緣 8px。
- 跟隨游標有一點延遲（`--duration-base` + `--ease-focus`，GSAP `quickTo`），文字每 18ms 打一個字；移出元素立刻消失，點擊也會消失。
- 外觀：直角、`--color-accent` 底、`--color-text-on-accent` 字、`--tooltip-font`（mono 15px，跟 badge 同字體家族，T2）、內距 8×16、最寬 360px，`\n` 換行。出現時 `--duration-step` 淡入並上移 4px。
- 作品卡片的文字來自後台「滑鼠提示 Hover Text」欄位（`projects.hover_text`），留空就不顯示。
- 觸控／沒有 hover 的裝置、螢幕 ≤ 768px、減少動態：不顯示。

## 卡片 → 案例頁（FLIP）

[`src/motion/CaseOverlay.jsx`](../src/motion/CaseOverlay.jsx)、[`src/motion/flip.js`](../src/motion/flip.js)。

- 從卡片點進去：網址變成 `/works/:id`（可分享），但作品牆不卸載，案例頁以 overlay 疊在上面（`history.state.backgroundLocation`，由 `PublicLayout` 判斷）。
- 開啟：所有動作**同時**開始，`--duration-flip` + `--ease-flip`。
  - 遮罩（ink 30% + `blur(10px)` 毛玻璃）淡入，`--duration-base`。
  - **頁面本身從卡片長出來**：案例頁的 `clip-path` 從卡片的框擴到整個視窗，米白底一開始就在，不是等落地才淡入。
  - 卡片圖用同一條曲線 FLIP 到頂端主視覺（直角不變，3:2 等比），所以始終在展開中的頁面裡。
  - 內容在飛行約 55% 時就開始淡入、上浮 8px（與展開重疊）；落地後焦點移到標題。
- 關閉（Back 按鈕、`Esc`、瀏覽器上一頁）：內容先快速淡出（`--duration-step`），頁面與主視覺一起縮回原卡片，遮罩同時淡出；作品牆捲動位置不變，焦點回到卡片。
- 直接打開 `/works/:id`：一般頁面＋淡入，不跑 FLIP。減少動態：不放大，只淡入淡出。
- 開啟期間背後鎖捲動、設 `inert`；動畫中忽略重複點擊。
- 注意：ScrollSmoother 會把取得焦點的元素捲進畫面，已用 `onFocusIn` 限定只處理平滑捲動內容裡的元素，否則焦點移進 overlay 會把背後的頁面捲到底。

## 作品內頁（Case study page）

`src/pages/Works/WorkDetail.jsx`、`CaseSidebar.jsx` 和兩個對應的 `.module.css`。**版面照 meganyap.me 的案例頁**，再套 Style C（直角、冷灰、無陰影）。

**整體**：左側欄＋右邊主文區。

- **側欄**（≥ 1024px 才顯示）：寬 303px、內距 40px、間距 24px，`--color-bg-surface` 底，捲動時固定在畫面上。由上到下：
  - `← WORKS`：回作品牆，overlay 裡等於關閉。
  - **Contents 目錄**：從內文的 h2 自動產生，點了跳到該段。目前段落用深一階的方塊標示，判斷方式是「最後一個捲過畫面 30% 位置的標題」。
  - `↑ BACK TO TOP`：固定在側欄底部。
  - 從卡片開的 overlay 是原生捲動，側欄用 CSS sticky；直接開的頁面有 ScrollSmoother，改用 ScrollTrigger pin。
- **主文區**：最寬 1100px、置中。內距 16 / 24 / 40px（手機／≥ 640／≥ 768），區塊間距 32 / 40 / 56px（手機／≥ 640／≥ 1024）。手機沒有側欄，返回連結放在主文區最上面。

**主文區由上到下**：

1. **橫幅**：封面維持原本的 3:2（跟作品卡片一樣，不裁切），最寬 560px（`--layout-case-banner`）。外層 `.banner` 撐住版面，裡面的 `.hero` 是 FLIP 目標（絕對定位），飛進來時下面的內容不會跳動。
   - **程式繪製的封面**（[`codeCovers.js`](../src/pages/Works/codeCovers.js)，以作品 id 對應）：有些作品的橫幅不用上傳的圖，而是用 Figma 圖層組成的元件，可以做響應式。目前只有 MetroSense（[`MetroCover`](../src/components/MetroCover/)，Figma `133:58`）。桌機照 Figma 的 824:467、最寬 760px，每個圖層用百分比定位、等比縮放；M 版（< 640px）改成 4:3，logo 置中放大到 80% 寬，列車縮小貼右下。作品牆的卡片仍用上傳的封面圖。
2. **Tags**：後台「Tags」欄位，`<Label variant="fill" size="lg">`，間距 8px。
3. **標題**：28 → 34 → 40px（手機／≥ 640／≥ 768），最長 928px。`text-wrap: balance` 讓需要換行的長標題平均分行；`text-spacing-trim: trim-start` 去掉開頭「【」的半形空白。
4. **連結按鈕**：有填 Link 才出現，滿寬外框按鈕，高 44px（參考「Try it out →」）。
5. **資訊區塊**：Year / Role / Team，手機 2 欄、≥ 768px 4 欄，`--color-bg-surface` 底、內距 16px。標籤是 mono 14px 大寫，值是內文 16px。沒填的項目不顯示。
6. **內文**：
   - 一行最長 928px（`--layout-case-text`），內文 14px（`body-sm`）。
   - h2 22 → 26 → 28px，和上一段距 32 / 40 / 56px；同段內的段落間距 8px。h3 16px 粗體，h4 15px。
   - **圖片置中，最寬 760px、最高 70% 螢幕高**，直式截圖會維持手機大小，不會撐滿整欄（參考 320px／760px）。連續兩張以上自動並排，兩欄同高；手機疊成一欄。
   - 圖說：圖片後、整段只有 `<em>` 的段落，12px、secondary、置中，與圖距 8px。
   - **強調色塊（callout）**：引言（blockquote）的第一行整行粗體時，變成強調色塊，用來突顯一句話，例如問題陳述（參考 meganyap.me 的 Problem statement）。粗體的第一行是主句（20px 粗體），之後的行是補充說明（14px、`--color-text-inverse-secondary`），不放小標。深色底 `--color-bg-inverse`、白字、置中、直角，內距 24px（≥ 640px 為 40 × 56px）。不用主色：主色只給目前位置與可互動元素（C3）。一般引言（第一行不是整行粗體）維持左邊細線的樣式。後台做法：按 Quote，再把第一行設成粗體。
   - **互動插圖**（`proseEmbeds.jsx` 把特定圖片換成元件，例如 MetroSense 的雙模式圖、資訊架構圖）：跟圖片一樣最寬 760px、置中。資訊架構圖放在 `ZoomViewer` 裡（見下）。
   - 這些 `data-*` 標記和 h2 的 id 由 `prepareHtml()` 在 render 前加上，不改寫資料庫內容。

## Blog

**Blog 一律沒有封面**：列表卡片和文章頁都不放封面圖或影片，後台也拿掉了封面上傳欄。資料庫的 `cover_image` 欄位保留但不使用。

### 列表卡片（BlogCard）

元件：[`src/components/BlogCard/`](../src/components/BlogCard/)。只有文字，由上到下：日期（`<Label>`）、標題（`--type-ui-strong`）、摘要（`--type-caption`、secondary、最多 3 行）、tags（`<Label variant="outline">`）。

- `--color-bg-surface` 底、內距 `--spacing-md`、元素間距 `--spacing-sm`，直角無陰影。
- Hover：1px `--color-text-primary` 框（`--duration-base`）。鍵盤 focus：2px 主色外框。
- 列表頁：頁框同作品牆（`--layout-max`），瀑布流 3 / 2 / 1 欄（> 960 / > 520 / 以下），間距 `--layout-gap-x`，`<Reveal index>` 錯開進場。

### 文章頁

[`src/pages/Blog/BlogPost.jsx`](../src/pages/Blog/BlogPost.jsx)。閱讀欄 680px（`--layout-reading`），由上到下：Back、日期與 tags、標題（`--article-title-*`，28 → 34 → 40px）、內文、底部 Back。沒有封面橫幅。

內文是 Tiptap 的 HTML，樣式用標籤選擇器套在 `.prose` 上：

| 元素 | 樣式 |
|---|---|
| `h2` | `--article-h2-font-lg`，上距 `--spacing-2xl` |
| `h3` | `--article-h3-font`，上距 `--spacing-xl` |
| `p` | `--article-body-font`（14px），段距 1em |
| `blockquote` | 引言框：`--color-bg-surface` 底、左邊 4px `--color-border-hairline`、內距 `--spacing-md` / `--spacing-lg` |
| `img` | 原尺寸、最寬到欄寬、置中，1px `--color-border-subtle` 外框 |
| 圖說 | 圖片後、整段只有 `<em>` 的段落：`--article-caption-font`（12px）、secondary、置中，與圖距 `--spacing-sm` |
| `hr` | 1px `--color-border-subtle`，上下 `--spacing-2xl`；正文和文末資訊的分隔 |
| `a` | `--color-accent-strong`、底線，hover `--color-accent` |

---

## 首頁開場動畫（HELLO → HEDY）

`public/hero.html`，以 iframe 嵌在首頁。它載入同一份 `/tokens.css`，CSS 的時長與緩動都用 token；**JS 時間軸（`setTimeout` 的時間點、延遲、邏輯）是作者手調的，不屬於這套 token，不要改**。

- 背景漸層與飄動的光暈（17s / 21s / 25s 循環）是規則 3 的例外，不套 token。
- `opacity 1ms linear` 是「瞬間切換」的技巧，不是動畫，保留原樣。

---

## 字體

- **定案**：LINE Seed（中文 LINE Seed TW、英數 LINE Seed EN），SIL OFL 1.1，自架 webfont。
- **現況**：webfont 還沒自架。`--font-sans` 堆疊已把 LINE Seed 排第一，裝好字型檔就會生效；目前顯示的是後備的 Noto Sans TC。Raleway 已移除（T1）。Mono 保留 Space Mono（T2）。
- 字體堆疊定義在 `public/tokens.css` 的 `--font-primitive-*`。

## 待補

- Figma 尚未設計：導覽列、按鈕與連結、標籤、段落標題、頁尾、Works 作品牆版面、Home Hero、作品內頁標題區。在那之前這些元件只換了動態 token，視覺沒有照 Style C 重做。
- 公開頁面（Works、案例頁、Blog、Notes、Resume、導覽列）已全部改用 v2 token，CSS 裡沒有寫死的字級、色碼、字體。Notes 的陰影與圓角已移除。
- 例外：MetroSense 案例的互動插圖（`MetroHomeModes`、`MetroIAMap`）是作品內容，保留該專案自己的品牌色與字體，就像圖片一樣。
- 後台頁面還沒收斂（A2 待決定）。
- Notes 版面本身仍未決定。（Blog 已定，見上方 Blog 一節。）
