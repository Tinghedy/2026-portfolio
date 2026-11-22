import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MetroIAMap.module.css";

/* ──────────────────────────────────────────────────────────────
 * 北捷 App 原本 UI 資訊流（Figma node 4068:15153）
 * 座標與尺寸直接取自 Figma，畫布 1626 × 1960
 * 改內容只要改下面的 CATEGORIES / NODES
 * ────────────────────────────────────────────────────────────── */

const CANVAS_W = 1626;
const CANVAS_H = 1960;
const NODE_H = 32;
const GAP = 3.5; // 連線端點與節點之間的距離（同 Figma connector）

export const CATEGORIES = {
  life: { label: "生活", color: "#fce6cc" },
  care: { label: "溫馨服務", color: "#f4cdcd" },
  ops: { label: "營運資訊", color: "#dceece" },
  member: { label: "會員專屬", color: "#ccf3ec" },
};

// kind: root | primary（綠色主選單）| secondary（藍灰節點）| leaf（常用功能底下的分類節點）
// side: 子節點在父節點的左邊 (L) 或右邊 (R)
// trunk: 這個節點往子節點連線時，垂直主幹的 x 座標
// note: 選填，hover 時顯示的說明
export const NODES = [
  { id: "root", label: "北捷", x: 752, y: 265, w: 64, kind: "root" },

  // ── 右側：首頁 ──
  { id: "home", label: "首頁", x: 878, y: 265, w: 64, kind: "primary", parent: "root", side: "R", trunk: 992 },
  { id: "marquee", label: "跑馬燈資訊", x: 1042, y: 197, w: 102, parent: "home", side: "R" },
  { id: "banner", label: "輪播圖", x: 1042, y: 245, w: 74, parent: "home", side: "R" },
  { id: "plan", label: "旅程規劃", x: 1042, y: 306, w: 88, parent: "home", side: "R" },
  { id: "common", label: "常用功能", x: 1042, y: 367, w: 88, parent: "home", side: "R", trunk: 1245,
    note: "首頁的常用功能共 29 項，四種性質的服務混在同一層。" },
  { id: "stations", label: "常用站點/鄰近站點", x: 1065, y: 1878, w: 150, parent: "home", side: "R" },

  // ── 常用功能底下（依分類上色）──
  ...[
    ["旅程時間/票價", 367, 116, "ops"],
    ["動態資訊", 415, 88, "ops"],
    ["下車提醒", 463, 88, "ops"],
    ["捷運小幫手", 511, 102, "life"],
    ["優惠券", 559, 74, "member"],
    ["我的票卡", 607, 88, "member"],
    ["AI智能客服", 655, 102, "care"],
    ["捷運點", 700, 74, "life"],
    ["旅遊趣", 748, 74, "life"],
    ["相約列車", 796, 88, "member"],
    ["友好聯盟", 844, 88, "ops"],
    ["路線擁擠度", 892, 102, "ops"],
    ["貓纜購票", 934, 88, "ops"],
    ["兒樂一日票", 976, 102, "ops"],
    ["旅遊票優惠", 1018, 102, "ops"],
    ["旅館及運動預約", 1060, 130, "ops"],
    ["更多連結", 1111, 88, "ops"],
    ["遺失物協尋", 1162, 102, "care"],
    ["旅遊票推薦", 1213, 102, "care"],
    ["誤點證明", 1264, 88, "care"],
    ["好孕吊飾申請", 1315, 116, "care"],
    ["帶寵物車搭捷運", 1366, 130, "care"],
    ["退費申請及查詢", 1417, 130, "care"],
    ["電梯施工", 1468, 88, "care"],
    ["貼心措施", 1519, 88, "care"],
    ["線上商城", 1570, 88, "life"],
    ["找優惠GO", 1621, 96, "member"],
    ["集章活動", 1672, 88, "member"],
    ["悠遊付", 1718, 74, null], // 設計稿中未分類（灰色）
  ].map(([label, y, w, cat], i) => ({
    id: `common-${i}`, label, x: 1359, y, w, kind: "leaf", cat, parent: "common", side: "R",
  })),

  // ── 左側：捷運路線 ──
  { id: "route", label: "捷運路線", x: 506, y: 265, w: 96, kind: "primary", parent: "root", side: "L", trunk: 459 },
  { id: "route-time", label: "時間", x: 353, y: 233, w: 60, parent: "route", side: "L" },
  { id: "route-full", label: "全票", x: 353, y: 281, w: 60, parent: "route", side: "L" },
  { id: "route-disc", label: "優待票", x: 339, y: 325, w: 74, parent: "route", side: "L" },
  { id: "route-plan", label: "旅程規劃", x: 325, y: 373, w: 88, parent: "route", side: "L" },

  // ── 左側：Go優惠 ──
  { id: "go", label: "Go優惠", x: 506, y: 567, w: 86, kind: "primary", parent: "root", side: "L", trunk: 459 },
  { id: "go-coupon", label: "主打優惠券", x: 311, y: 543, w: 102, parent: "go", side: "L" },
  { id: "go-travel", label: "旅遊趣", x: 339, y: 587, w: 74, parent: "go", side: "L" },
  { id: "go-shop", label: "線上商城", x: 325, y: 625, w: 88, parent: "go", side: "L" },

  // ── 左側：更多功能 ──
  { id: "more", label: "更多功能/自訂服務", x: 448, y: 759, w: 160, kind: "primary", parent: "root", side: "L",
    note: "編輯後，更多功能會變成自訂服務，並回到首頁的常用功能。" },

  // ── 左側：我的帳戶 ──
  { id: "account", label: "我的帳戶", x: 506, y: 1038, w: 96, kind: "primary", parent: "root", side: "L", trunk: 473 },
  { id: "login", label: "登入/加入會員", x: 318, y: 1038, w: 122, parent: "account", side: "L" },
  { id: "member", label: "會員服務", x: 352, y: 1116, w: 88, parent: "account", side: "L", trunk: 335 },
  { id: "contact", label: "聯絡我們", x: 352, y: 1540, w: 88, parent: "account", side: "L", trunk: 335 },
  { id: "push", label: "推播設定", x: 352, y: 1802, w: 88, parent: "account", side: "L", trunk: 335 },

  { id: "m-card", label: "我的票卡", x: 230, y: 1116, w: 88, parent: "member", side: "L" },
  { id: "m-coupon", label: "我的優惠券", x: 216, y: 1166, w: 102, parent: "member", side: "L" },
  { id: "m-barcode", label: "我的會員條碼", x: 202, y: 1216, w: 116, parent: "member", side: "L" },
  { id: "m-barcode-2", label: "我的會員條碼", x: 202, y: 1266, w: 116, parent: "member", side: "L" },
  { id: "m-edit", label: "修改會員資料", x: 202, y: 1316, w: 116, parent: "member", side: "L" },
  { id: "m-terms", label: "會員服務條款", x: 202, y: 1366, w: 116, parent: "member", side: "L" },
  { id: "m-invite", label: "邀請好友", x: 230, y: 1416, w: 88, parent: "member", side: "L" },
  { id: "m-points", label: "會員點數使用辦法", x: 174, y: 1466, w: 144, parent: "member", side: "L" },

  { id: "c-text", label: "AI智慧文字客服", x: 188, y: 1540, w: 130, parent: "contact", side: "L" },
  { id: "c-voice", label: "AI智慧語音客服", x: 188, y: 1590, w: 130, parent: "contact", side: "L" },
  { id: "c-feedback", label: "意見反應", x: 230, y: 1646, w: 88, parent: "contact", side: "L" },
  { id: "c-risk", label: "捷運周邊高風險通報", x: 160, y: 1685, w: 158, parent: "contact", side: "L" },

  { id: "p-marquee", label: "顯示跑馬燈資訊", x: 188, y: 1802, w: 130, parent: "push", side: "L" },
  { id: "p-notify", label: "接受通知", x: 230, y: 1858, w: 88, parent: "push", side: "L" },
];

// 北捷 → 左側主選單 的主幹
const ROOT_LEFT_TRUNK = 672;

// 「更多功能 → 常用功能」的回流線（設計稿中的大 U 形連線）
const LOOP = { from: "more", to: "common" };
const LOOP_PATH = "M444.5 775 H441 Q429 775 429 787 V859 Q429 871 441 871 H1074 Q1086 871 1086 859 V402.5";

/* ── helpers ── */

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

function ancestorsOf(id) {
  const out = new Set();
  let cur = byId[id];
  while (cur) {
    out.add(cur.id);
    cur = cur.parent ? byId[cur.parent] : null;
  }
  return out;
}

function descendantsOf(id) {
  const out = new Set([id]);
  const walk = (pid) =>
    NODES.forEach((n) => {
      if (n.parent === pid) {
        out.add(n.id);
        walk(n.id);
      }
    });
  walk(id);
  return out;
}

const hasChildren = (id) => NODES.some((n) => n.parent === id);

function elbow(sx, sy, tx, ex, ey, r = 12) {
  if (Math.abs(ey - sy) < 0.5) return `M${sx} ${sy} H${ex}`;
  const d1 = Math.sign(tx - sx);
  const d2 = Math.sign(ex - tx);
  const dy = Math.sign(ey - sy);
  const rr = Math.min(r, Math.abs(ey - sy) / 2, Math.abs(tx - sx), Math.abs(ex - tx));
  return [
    `M${sx} ${sy}`,
    `H${tx - d1 * rr}`,
    `Q${tx} ${sy} ${tx} ${sy + dy * rr}`,
    `V${ey - dy * rr}`,
    `Q${tx} ${ey} ${tx + d2 * rr} ${ey}`,
    `H${ex}`,
  ].join(" ");
}

function buildEdges() {
  return NODES.filter((n) => n.parent).map((child) => {
    const p = byId[child.parent];
    const sy = p.y + NODE_H / 2;
    const ey = child.y + NODE_H / 2;
    let sx, ex, tx;
    if (child.side === "R") {
      sx = p.x + p.w + GAP;
      ex = child.x - GAP;
      tx = p.trunk ?? (sx + ex) / 2;
    } else {
      sx = p.x - GAP;
      ex = child.x + child.w + GAP;
      tx = p.id === "root" ? ROOT_LEFT_TRUNK : p.trunk ?? (sx + ex) / 2;
    }
    return { id: `${p.id}->${child.id}`, from: p.id, to: child.id, d: elbow(sx, sy, tx, ex, ey) };
  });
}

/* ── component ── */

export default function MetroIAMap() {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [activeCat, setActiveCat] = useState(null); // 圖例篩選
  const [focusId, setFocusId] = useState(null); // 點節點：聚焦分支
  const [hoverId, setHoverId] = useState(null); // hover：高亮路徑

  const edges = useMemo(buildEdges, []);

  const counts = useMemo(() => {
    const c = {};
    NODES.forEach((n) => n.cat && (c[n.cat] = (c[n.cat] || 0) + 1));
    return c;
  }, []);

  // 依容器寬度等比縮放
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(Math.max(0.5, Math.min(1, w / CANVAS_W)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Esc 清除所有狀態
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setActiveCat(null);
        setFocusId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const focusSet = useMemo(() => {
    if (!focusId) return null;
    const s = new Set([...descendantsOf(focusId), ...ancestorsOf(focusId)]);
    if (focusId === LOOP.from || focusId === LOOP.to) {
      s.add(LOOP.from);
      s.add(LOOP.to);
      ancestorsOf(LOOP.to).forEach((id) => s.add(id));
      ancestorsOf(LOOP.from).forEach((id) => s.add(id));
    }
    return s;
  }, [focusId]);

  const pathSet = useMemo(() => (hoverId ? ancestorsOf(hoverId) : null), [hoverId]);

  const nodeOpacity = (n) => {
    let o = 1;
    if (focusSet && !focusSet.has(n.id)) o = 0.15;
    if (activeCat) {
      if (n.kind === "leaf") o = Math.min(o, n.cat === activeCat ? 1 : 0.15);
      else o = Math.min(o, 0.35);
    }
    return o;
  };

  const edgeState = (e) => {
    const dimByFocus = focusSet && !(focusSet.has(e.from) && focusSet.has(e.to));
    const dimByCat = activeCat && byId[e.to].cat !== activeCat;
    const onPath = pathSet && pathSet.has(e.from) && pathSet.has(e.to);
    const catHit = activeCat && byId[e.to].cat === activeCat;
    return {
      opacity: dimByFocus || dimByCat ? 0.12 : 1,
      highlight: onPath || catHit,
    };
  };

  const loopActive =
    focusId === LOOP.from || focusId === LOOP.to || hoverId === LOOP.from;
  const loopDim = (focusSet && !loopActive) || activeCat;

  const hovered = hoverId ? byId[hoverId] : null;

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.hint}>
        <span className={styles.badge}>Interactive</span>
        點圖例篩選分類・點選單節點聚焦分支・Esc 重置
      </figcaption>

      <div ref={wrapRef} className={styles.scroller}>
        <div
          className={styles.sizer}
          style={{ width: CANVAS_W * scale, height: CANVAS_H * scale }}
        >
          <div
            className={styles.canvas}
            style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})` }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setFocusId(null);
            }}
          >
            {/* 圖例 */}
            <div className={styles.legend} role="group" aria-label="依分類篩選">
              {Object.entries(CATEGORIES).map(([key, c]) => {
                const on = activeCat === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={styles.legendItem}
                    aria-pressed={on}
                    data-dim={activeCat && !on ? "" : undefined}
                    onClick={() => setActiveCat(on ? null : key)}
                  >
                    <span className={styles.swatch} style={{ background: c.color }}>
                      <span className={styles.count}>{counts[key] || 0}</span>
                    </span>
                    <span className={styles.legendLabel}>{c.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 連線 */}
            <svg
              className={styles.edges}
              width={CANVAS_W}
              height={CANVAS_H}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              aria-hidden="true"
            >
              <defs>
                {[
                  ["arrow", "#AAAAAA"],
                  ["arrow-hi", "#353535"],
                ].map(([id, fill]) => (
                  <marker
                    key={id}
                    id={`metro-${id}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    markerUnits="userSpaceOnUse"
                    orient="auto-start-reverse"
                  >
                    <path d="M0 0 L10 5 L0 10 z" fill={fill} />
                  </marker>
                ))}
              </defs>

              {/* 樹狀連線 */}
              {edges.map((e) => {
                const s = edgeState(e);
                return (
                  <path
                    key={e.id}
                    d={e.d}
                    className={styles.edge}
                    data-hi={s.highlight ? "" : undefined}
                    style={{ opacity: s.opacity }}
                    markerEnd={`url(#metro-${s.highlight ? "arrow-hi" : "arrow"})`}
                  />
                );
              })}

              {/* 更多功能 → 常用功能 回流線 */}
              <path
                d={LOOP_PATH}
                className={styles.edge}
                data-hi={loopActive ? "" : undefined}
                data-loop=""
                style={{ opacity: loopDim ? 0.12 : 1 }}
                markerEnd={`url(#metro-${loopActive ? "arrow-hi" : "arrow"})`}
              />
            </svg>

            {/* 節點 */}
            {NODES.map((n) => {
              const kind = n.kind || "secondary";
              const clickable = hasChildren(n.id) || n.id === LOOP.from;
              const Tag = clickable ? "button" : "div";
              const bg = kind === "leaf" ? (n.cat ? CATEGORIES[n.cat].color : "rgba(0,0,0,0.12)") : undefined;
              return (
                <Tag
                  key={n.id}
                  type={clickable ? "button" : undefined}
                  className={styles.node}
                  data-kind={kind}
                  data-focused={focusId === n.id ? "" : undefined}
                  aria-pressed={clickable ? focusId === n.id : undefined}
                  style={{
                    left: n.x,
                    top: n.y,
                    width: n.w,
                    opacity: nodeOpacity(n),
                    "--node-bg": bg,
                  }}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(n.id)}
                  onBlur={() => setHoverId(null)}
                  onClick={clickable ? () => setFocusId(focusId === n.id ? null : n.id) : undefined}
                >
                  <span className={styles.nodeLabel}>{n.label}</span>
                </Tag>
              );
            })}

            {/* 設計稿上的註解 */}
            <p className={styles.annotation} style={{ left: 463, top: 795 }}>
              編輯後更多功能變成自訂服務
            </p>

            {/* hover 說明 */}
            {hovered?.note && (
              <div
                className={styles.tooltip}
                role="tooltip"
                style={{
                  left: hovered.x + hovered.w / 2,
                  top: hovered.y + NODE_H + 8,
                }}
              >
                {hovered.note}
              </div>
            )}
          </div>
        </div>
      </div>
    </figure>
  );
}
