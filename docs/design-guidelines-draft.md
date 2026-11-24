# 設計系統準則（草稿，待逐條確認）

參考：Figma `2026_Portfolio` › 00 Reference Study › **09 mchiu.co.uk**（node 92:2），以及 mchiu.co.uk 線上的 `tokens.css`（2026-11-24 讀取）。

**怎麼看這份文件**：每條準則都有編號，分成三段：

- **mchiu 怎麼做**：參考對象的實際做法
- **我們現況**：這個 repo 目前的狀態
- **建議準則**：要套用的規則。標 ⚖️ 的地方需要你決定

> **2026-11-24 已套用**：除了標 ⚖️ 待決定的部分，其餘準則都已套用到 `public/tokens.css`、公開頁面的 CSS、`docs/design-system.md` 和 Storybook。待決定的項目維持原狀：A2 後台、T6 圖片寬度、T7 讀者字級控制、C3 數字顏色、P1 按下回饋、P3 標題位置。T3 的 10 階數值先照提議套用，之後可以直接改 token 數值。

> 原則：參考的是 mchiu 的「系統方法」（token 怎麼分層、字級怎麼命名、元件怎麼刻畫），不是它的外觀。它是圓角、陰影、青綠＋紫漸層；我們是直角、無陰影、灰＋藍（Style C 四條規則）。外觀上衝突的地方，預設保留我們的規則。

---

## A. Token 架構

### A1. Token 分三層：原始值 → 語意 → 元件

- **mchiu 怎麼做**：`tokens.css` 開頭就寫明三層。
  1. **Primitive**：原始值，用色相＋階層命名，例如 `--color-primitive-neutral-750`、`--text-3xl`。元件**不准直接用**。
  2. **Semantic**：指向 primitive，用用途命名，例如 `--color-text-primary`、`--color-surface-card`。元件用這層。
  3. **Component**：某個元件專用，例如 `--tooltip-size`、`--nav-pill-weight`。
- **我們現況**：只有語意層，色碼直接寫在語意 token 上（`--color-text-primary: #0A0A0C`）。字級完全沒有 token。
- **建議準則**：改成三層。Figma Variables 也照這三層分 collection，名稱和 CSS 一樣。

### A2. 元件的 CSS 只能用語意或元件 token

- **mchiu 怎麼做**：元件 CSS 寫 `font-size: var(--tooltip-size)`，不寫 `18px`。
- **我們現況**：約 45 種寫死的 font-size、63 種寫死的色碼（大多在後台和 Notes）。
- **建議準則**：公開頁面的 CSS 不再出現寫死的色碼和字級。後台 ⚖️：要一起收斂，還是先只管公開頁面？

### A3. 元件 token 集中寫在 tokens.css

- **mchiu 怎麼做**：所有元件的字級組合（`--tooltip-*`、`--tag-*`、`--quote-*`）都寫在 `tokens.css` 的「Semantic typography」段，元件 CSS 只引用。改一個元件的字，只要改一行。
- **建議準則**：照做。一眼就能看出全站有哪些文字樣式，也不會再出現「badge 和 tooltip 各寫各的」。

---

## T. 字體與字級

### T1. 一個主字體貫穿標題和內文

- **mchiu 怎麼做**：全站只用 **Syne**（400–700），標題和內文同一套。點綴字體只出現在一張卡片裡（Tiny5 像素字），卡片內模擬的產品 UI 用系統字。
- **我們現況**：標題 Raleway、內文 Noto Sans TC、小字 Space Mono，三套。文件寫已定案 LINE Seed，但還沒套用。
- **建議準則**：主字體 = **LINE Seed**（中文 LINE Seed TW、英數 LINE Seed EN），標題和內文都用，用字重區分層級。Raleway 拿掉。

### T2. Mono 字只給「資料」，不給「標籤」

- **mchiu 怎麼做**：mono 只用在 Layer Lint 的圖層清單（真的是程式資料）。像 MY DESIGN PRINCIPLE 這種小標籤，用主字體 600、大寫、加寬字距。
- **我們現況**：badge、年份、meta、Back、Blog 標籤都用 Space Mono；游標提示用內文字體。你發現的不一致就在這裡。
- **✅ 已決定（2026-11-24）：保留 mono 當識別。**
  - **mono**：badge、Blog 標籤、年份、日期、meta、Back 連結，以及**游標提示**。游標提示從內文字體改成 mono，跟 badge 一致。
  - **主字體**（LINE Seed）：標題、內文、卡片標題、導覽列。
  - 連帶影響 T5：`label`、`tooltip` 兩個角色改用 mono。字體堆疊仍是 `--font-mono`，要不要從 Space Mono 換成別的 mono 字另外決定。

### T3. 字級用 T 恤尺寸命名的原始階層

- **mchiu 怎麼做**：`--text-3xs`（9px）到 `--text-10xl`（48px），共 17 階，全部用 rem 寫。
- **我們現況**：沒有階層，約 45 種值，px、rem、clamp 混用。
- **建議準則**：建立原始階層，但**比 mchiu 精簡**。我們元件少，17 階太多。依現況實際用到的值，提議 10 階：

  | Token | 值 | 主要用途（預定） |
  |---|---|---|
  | `--text-2xs` | 11px | 標籤、年份 |
  | `--text-xs` | 12px | 說明文字 |
  | `--text-sm` | 14px | meta、圖說、手機內文 |
  | `--text-md` | 15px | 卡片標題、介面文字 |
  | `--text-base` | 16px | 一般內文 |
  | `--text-lg` | 18px | 案例頁內文、游標提示 |
  | `--text-xl` | 20px | 小標（h4） |
  | `--text-2xl` | 24px | 段落標題（h3） |
  | `--text-3xl` | 32px | 頁標題、案例標題 |
  | `--text-4xl` | 48px | 大標（桌機案例 h1）、數字 |

  ⚖️ 階數和數值都可以調。

### T4. 行高、字距、字重也有階層

- **mchiu 怎麼做**：
  - 行高 9 階（1 到 1.65）
  - 字距 6 階（`-0.01em` 到 `0.12em`）
  - 字重 5 階（400 到 800），用名字引用：`--weight-medium`
- **建議準則**：一樣建立，但精簡：
  - 行高 4 階：`tight 1.2`、`snug 1.3`、`normal 1.5`、`relaxed 1.65`
  - 字距 4 階：`tight -0.02em`、`normal 0`、`wide 0.06em`、`ultra 0.12em`
  - 字重 3 階：`regular 400`、`medium 500`、`bold 700`

  全大寫的字一律至少 `wide`。

### T5. 每個文字角色是一組「組合 token」

- **mchiu 怎麼做**：每個角色定義 size＋weight＋leading（＋tracking）一組，例如：

  ```css
  --cs-title-size: var(--text-7xl);
  --cs-title-weight: var(--weight-bold);
  --cs-title-leading: var(--leading-relaxed);
  ```

- **建議準則**：定義以下角色，全站文字只能從這張表選：

  | 角色 | 大小 / 字重 / 行高 | 用在 |
  |---|---|---|
  | `display` | 4xl / bold / tight | 桌機案例標題、大數字 |
  | `title` | 3xl / bold / tight | 頁標題（Works、Blog）、手機案例標題 |
  | `section` | 2xl / bold / snug | 案例頁 h2 |
  | `subsection` | xl / bold / snug | 案例頁 h3 |
  | `body-lg` | lg / regular / relaxed | 案例頁內文 |
  | `body` | base / regular / relaxed | 一般內文、Resume |
  | `ui` | md / medium / normal | 卡片標題、導覽列、按鈕 |
  | `caption` | sm / regular / normal | 圖說、meta |
  | `label` | **mono** / 2xs / bold / normal / wide / 大寫 | badge、Blog 標籤、年份、MY DESIGN PRINCIPLE 類小標 |
  | `tooltip` | **mono** / md / regular / snug | 游標提示 |

  沒標字體的角色都用主字體。依 T2 決定，`label` 和 `tooltip` 用 mono，並做兩個調整：
  - `label` 字距用 `wide`（0.06em），不用 `ultra`：等寬字本身就寬，再加會鬆散。
  - `tooltip` 降到 15px（`md`）：mono 在同字級下看起來比較大。

### T6. 案例頁閱讀欄寬 680px、內文 18px

- **mchiu 怎麼做**：案例內文欄寬 `42.5rem`（680px，約 65 個英文字），內文 18px、行高 1.5，圖片寬約 680。
- **我們現況**：容器最寬 880px，內文 16px／26px（手機 14px）。
- **建議準則**：內文欄寬改 680px、內文改 `body-lg`（18px）。圖片可以比內文寬 ⚖️：要不要讓圖片超出到 880？

### T7. 字級用 rem，讓讀者能放大

- **mchiu 怎麼做**：全部用 rem；案例頁還有「文字大小」控制，乘在 `--cs-type-scale` 上。
- **建議準則**：字級 token 一律用 rem，瀏覽器放大字體時版面一起縮放。讀者文字大小控制先不做 ⚖️。

---

## C. 色彩

### C1. 中性色要有完整階層，語意色指向它

- **mchiu 怎麼做**：
  - neutral 從 0 到 1000 一整條
  - 另有透明度階層（alpha-black-4 / 8 / 10 / 20 / 30）
  - 語意色指向它們：`text-primary → neutral-750`、`text-secondary → neutral-450`、`backdrop → alpha-black-30`
- **我們現況**：冷灰只有 6 個值，各自寫色碼；案例頁的暖墨色另外一套，用透明度。
- **建議準則**：建立一條冷灰 neutral 階層和一條藍色 accent 階層，現有語意 token 改成指向它們，**畫面顏色不變**。

### C2. 文字色分 4 級，次要文字要過 4.5:1

- **mchiu 怎麼做**：
  - `primary`
  - `secondary`：註解寫明「必須通過 4.5:1」
  - `subtle`
  - `muted`
  - `on-dark`、`on-primary` 給深底與主色底
- **我們現況**：只有 `primary`、`secondary`、`on-accent`。
- **建議準則**：定 `primary`、`secondary`（≥ 4.5:1）、`tertiary`（只給裝飾或停用，不放必讀資訊）、`on-accent`。`secondary #5A6069` 在 `#F6F6F6` 上的對比我套用前會驗算。

### C3. 一個主色，用途寫死

- **mchiu 怎麼做**：主色青綠 `#008B8B` 只用在三個地方：游標提示底色、重點句、數字；漸層（青綠→紫）只給粗體重點和數字。
- **我們現況**：規則 2「主色只給現在在哪／可以互動，一個畫面最多兩三塊」。
- **建議準則**：保留規則 2，並把用途列清楚：導覽列目前頁、游標提示、badge 預設、打字游標、連結 hover。**不加漸層。** ⚖️ 案例頁的重點數字要不要也用主色？

### C4. 背景只有 3 層

- **mchiu 怎麼做**：頁面背景 `#F0EDE8`（暖灰）→ 淺卡 `#FAF9F7` → 深卡 `#15121E`，就這三種面。
- **我們現況**：頁面 `#F6F6F6`、次一層 `#ECEDEF`、更深 `#DCDEE2`，案例頁另外是 `#FBFAF4`。
- **✅ 已決定（2026-11-24）：全站冷灰。**
  - 案例頁的暖米白 `#FBFAF4` 和暖墨色階（`--ink-rgb: 54, 54, 48` 系列）改成冷灰，跟作品牆同一套。
  - 背景三層：頁面 `#F6F6F6` → 次一層 `#ECEDEF` → 更深 `#DCDEE2`。
  - 案例頁的文字、細線、圖片底色改用冷灰語意 token（`--color-text-primary`、`--color-text-secondary`、`--color-border-hairline`、`--color-bg-surface`）。暖墨 token 移除，或改成指向冷灰。
  - 連帶影響 C1：只需要建一條冷灰 neutral 階層，不用另外維護暖色。

### C5. 深色模式只換語意層

- **mchiu 怎麼做**：深色模式只覆寫語意 token（`--color-text-primary` 等），primitive 和元件都不動。
- **建議準則**：架構先照這樣留好，深色模式本身之後再做。

---

## S. 形狀、層次、間距

### S1. 圓角 token 化，但維持直角

- **mchiu 怎麼做**：卡片 32、pill 999、小元件 5。
- **建議準則**：維持規則 3 直角，`--radius-none: 0` 是唯一值。之後若有例外（例如頭像要圓），要新增 token，不在元件裡寫數字。

### S2. 不用陰影，用細線分層

- **mchiu 怎麼做**：陰影極淡（`0 1px 3px rgba(0,0,0,.04)` 加一條內側白色高光），hover 時加深。
- **建議準則**：維持「無陰影」。需要分層時用 `--color-border-hairline` 1px 細線，或背景色差一階。Notes 卡片的陰影要拿掉（違反規則）。

### S3. 版面格線寫成 token

- **mchiu 怎麼做**：首頁 4 欄、每格 252、間距 18、總寬 1062 置中；卡片有 1×1、2×1、1×2、2×2 四種尺寸。
- **我們現況**：有 8px 方格和間距 token，但頁寬、欄數、格線間距散在各頁 CSS。
- **建議準則**：新增版面 token：`--layout-max`（頁面最寬）、`--layout-gutter`（左右邊距）、`--layout-columns`、`--layout-gap`。作品牆、Blog 共用。

---

## P. 元件刻畫模式

### P1. 每個元件先列狀態表，再畫

- **mchiu 怎麼做**：卡片有完整狀態：
  - 靜止
  - hover（上浮 3px、陰影加深）
  - 按下（縮到 0.97）
  - 展開（變成全螢幕案例頁）
  - 淡化（篩選時不符合的卡片變淡）
- **建議準則**：每個可互動元件在 Storybook 都要有這幾種狀態：`default`、`hover`、`focus-visible`、`active`、`disabled`（若有）。作品卡片補上「按下」回饋 ⚖️（例如縮到 0.98）。

### P2. 小標籤只有一種元件，用變體區分

- **mchiu 怎麼做**：`--tag-*`（互動標籤 12px／600）、`--project-label-*`（13px／700／字距 0.08em）、`--principle-*`（11px／600／字距 0.12em），三種小標各自有 token，但都屬於同一家族：大寫、加寬、粗。
- **我們現況**：CoverTag（mono 11 大寫）、Blog `.tag`、Blog `.year` 各寫各的。
- **建議準則**：做一個 `Label` 元件，變體分 `solid`（色底，給 badge）和 `plain`（無底，給分類和年份），字一律用 T5 的 `label` 角色。

### P3. 游標提示是作品資訊的主要入口

- **mchiu 怎麼做**：卡片上**完全沒有標題文字**，卡片就是產品畫面本身；標題和一句成果都放在 hover 的游標提示裡。手機沒有 hover，改在右上角放展開按鈕。
- **我們現況**：標題、年份在卡片下方，游標提示是額外補充。
- **建議準則** ⚖️ 二選一：
  - **(a)** 維持標題在卡片下方。規則 4「標題與年份永遠清楚」，對招募者掃描比較友善。
  - **(b)** 照 mchiu 把標題收進游標提示，卡片下方留白。

### P4. 卡片內容是「會動的作品」

- **mchiu 怎麼做**：每張卡都是 live demo（外掛輪播、AI 打字、Alexa 對話、真實地圖），不是靜態截圖。
- **建議準則**：先不做，記錄成方向。之前的打字劇本因為看起來像可以點的 tag 而停用；之後若做，要讓卡片內容**不像按鈕**（例如不要出現有底色的小方塊）。

---

## M. 動態（補充現有規則）

### M1. 進場依序錯開

- **mchiu 怎麼做**：首頁卡片進場時，每張晚 0.06s 出現（`--card-enter-delay`），上移 24px 淡入。
- **建議準則**：新增 `--stagger: 60ms`。作品牆和 Blog 列表進場時依序錯開，最多錯開 8 個，之後同時出現，免得最後一張等太久。

### M2. 小元件出現 120ms，大轉場 700ms

- **mchiu 怎麼做**：游標提示 0.12s、hover 0.15s、背景淡入 0.3s、卡片展開 0.7s。
- **我們現況**：已有 `step 120`、`base 240`、`focus 550`、`flip 700`，對應得上。
- **建議準則**：維持現有四個時長，不新增。

---

## D. 文件

### D1. Storybook 是唯一的視覺來源

- **mchiu 怎麼做**：tokens.css 開頭寫「這些和 Figma Variables 一一對應」。
- **建議準則**：
  - 每個 token 都出現在 Storybook Foundations。
  - 字級頁從「現況盤點」改成讀 token 自動產生，改 tokens.css 就會跟著更新。
  - Figma Variables、`tokens.css`、Storybook 三邊名稱一致。

---

## 需要你決定的事（彙整）

| 編號 | 問題 |
|---|---|
| A2 | 後台要不要一起收斂寫死的顏色和字級？ |
| ~~T2~~ | ✅ 保留 mono（游標提示也改 mono） |
| T3 | 字級 10 階的數值 OK 嗎？ |
| T6 | 案例頁圖片要不要比內文寬？ |
| T7 | 要不要做讀者文字大小控制？ |
| C3 | 案例頁重點數字要不要用主色？ |
| ~~C4~~ | ✅ 全站冷灰（案例頁也改） |
| P1 | 作品卡片要不要加「按下」回饋？ |
| P3 | 標題留在卡片下方（a），還是收進游標提示（b）？ |
