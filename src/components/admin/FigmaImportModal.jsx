import { useState } from "react";
import { parseFigmaUrl, getFigmaImages, getFigmaNodes, getFigmaFile } from "../../lib/figma";
import styles from "./FigmaImportModal.module.css";

export default function FigmaImportModal({ isOpen, onClose, onImportImages }) {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewItems, setPreviewItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  if (!isOpen) return null;

  const handleFetch = async () => {
    setError("");
    setPreviewItems([]);
    setSelectedIds([]);

    const parsed = parseFigmaUrl(urlInput);
    if (!parsed || !parsed.fileKey) {
      setError("請輸入有效的 Figma 連結 (例如 https://www.figma.com/design/... 或 file/...)");
      return;
    }

    setLoading(true);

    try {
      let nodeIdsToExport = [];
      const nodeNameMap = {};

      if (parsed.nodeId) {
        // Direct node URL
        nodeIdsToExport = [parsed.nodeId];
        try {
          const nodeData = await getFigmaNodes(parsed.fileKey, [parsed.nodeId]);
          const nodeObj = nodeData.nodes?.[parsed.nodeId]?.document;
          if (nodeObj) {
            nodeNameMap[parsed.nodeId] = nodeObj.name || `Node ${parsed.nodeId}`;
          }
        } catch {
          nodeNameMap[parsed.nodeId] = `Node ${parsed.nodeId}`;
        }
      } else {
        // Whole file - fetch top level frames
        const fileData = await getFigmaFile(parsed.fileKey);
        const pages = fileData.document?.children || [];
        pages.forEach((page) => {
          (page.children || []).forEach((child) => {
            if (child.type === "FRAME" || child.type === "COMPONENT" || child.type === "SECTION") {
              if (nodeIdsToExport.length < 12) {
                nodeIdsToExport.push(child.id);
                nodeNameMap[child.id] = child.name;
              }
            }
          });
        });
      }

      if (nodeIdsToExport.length === 0) {
        throw new Error("在此 Figma 檔案中未找到可導出的 Frame / 圖層。");
      }

      // Export PNG images from Figma API
      const imagesMap = await getFigmaImages(parsed.fileKey, nodeIdsToExport, { format: "png", scale: 2 });
      
      const items = Object.entries(imagesMap)
        .filter(([, imgUrl]) => Boolean(imgUrl))
        .map(([id, imgUrl]) => ({
          id,
          name: nodeNameMap[id] || `Frame ${id}`,
          url: imgUrl,
        }));

      if (items.length === 0) {
        throw new Error("無法導出圖片，請確認此 Figma 檔案有給予存取權限。");
      }

      setPreviewItems(items);
      // Auto select all by default
      setSelectedIds(items.map((i) => i.id));
    } catch (err) {
      console.error("[FigmaImportModal] Error fetching Figma data:", err);
      setError(err.message || "讀取 Figma 失敗，請確認 Token 與連結正確。");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedImages = previewItems
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => ({ url: item.url, title: item.name }));

    onImportImages(selectedImages);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>
            <svg width="18" height="18" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38H19V28.5Z" fill="#1ABCFE"/>
              <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
              <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
              <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
              <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
            </svg>
            從 Figma 匯入設計圖
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.body}>
          <p className={styles.hintText}>
            請貼上 Figma 專案連結或特定 Frame 畫布連結（例如含有 <code>node-id=...</code> 的網址）：
          </p>

          <div className={styles.inputGroup}>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.figma.com/design/abc123XYZ/My-Design?node-id=1-2"
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            />
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleFetch}
              disabled={loading || !urlInput.trim()}
            >
              {loading ? "讀取中..." : "抓取圖片"}
            </button>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          {previewItems.length > 0 && (
            <div>
              <p className={styles.hintText} style={{ fontWeight: 500 }}>
                選擇要匯入的 Frame ({selectedIds.length}/{previewItems.length}):
              </p>
              <div className={styles.imageGrid}>
                {previewItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`${styles.imageCard} ${isSelected ? styles.selected : ""}`}
                      onClick={() => toggleSelect(item.id)}
                    >
                      {isSelected && <span className={styles.checkBadge}>✓</span>}
                      <img src={item.url} alt={item.name} />
                      <div className={styles.imageLabel} title={item.name}>
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>取消</button>
          <button
            className={styles.btnPrimary}
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
          >
            匯入已選圖片 ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
