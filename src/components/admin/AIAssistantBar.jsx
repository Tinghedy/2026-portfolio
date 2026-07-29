import { useState } from "react";
import { generateOutline, polishContent, summarizeContent, generateTags } from "../../lib/gemini";
import styles from "./AIAssistantBar.module.css";

export default function AIAssistantBar({
  title = "",
  content = "",
  onApplyOutline,
  onApplyPolish,
  onApplySummary,
  onApplyTags,
}) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState("");

  const handleOutline = async () => {
    if (!title.trim()) {
      setError("請先填寫標題/主題，AI 才能幫忙生成大綱。");
      return;
    }
    setError("");
    setLoadingAction("outline");
    try {
      const outline = await generateOutline(title);
      if (onApplyOutline) onApplyOutline(outline);
    } catch (err) {
      setError(err.message || "生成大綱失敗");
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePolish = async () => {
    if (!content.trim()) {
      setError("編輯器內尚無文字內容可供潤飾。");
      return;
    }
    setError("");
    setLoadingAction("polish");
    try {
      const polished = await polishContent(content);
      if (onApplyPolish) onApplyPolish(polished);
    } catch (err) {
      setError(err.message || "潤飾內文失敗");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSummary = async () => {
    if (!content.trim() && !title.trim()) {
      setError("請先填寫標題或內容，以供 AI 生成摘要。");
      return;
    }
    setError("");
    setLoadingAction("summary");
    try {
      const textToSummarize = `${title}\n\n${content}`;
      const summary = await summarizeContent(textToSummarize);
      if (onApplySummary) onApplySummary(summary);
    } catch (err) {
      setError(err.message || "生成摘要失敗");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTags = async () => {
    if (!content.trim() && !title.trim()) {
      setError("請先填寫內容，以利 AI 提取關鍵字標籤。");
      return;
    }
    setError("");
    setLoadingAction("tags");
    try {
      const textToTag = `${title}\n\n${content}`;
      const tags = await generateTags(textToTag);
      if (onApplyTags) onApplyTags(tags);
    } catch (err) {
      setError(err.message || "生成標籤失敗");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className={styles.bar}>
      <div className={styles.titleGroup}>
        <span className={styles.sparkleIcon}>✨</span>
        <span>Gemini AI 創作助手</span>
      </div>

      <div className={styles.actionsGroup}>
        {onApplyOutline && (
          <button
            type="button"
            className={styles.aiBtn}
            onClick={handleOutline}
            disabled={Boolean(loadingAction)}
          >
            {loadingAction === "outline" ? "大綱思考中..." : "📝 寫大綱"}
          </button>
        )}

        {onApplyPolish && (
          <button
            type="button"
            className={styles.aiBtn}
            onClick={handlePolish}
            disabled={Boolean(loadingAction)}
          >
            {loadingAction === "polish" ? "潤飾中..." : "🪄 潤飾內文"}
          </button>
        )}

        {onApplySummary && (
          <button
            type="button"
            className={styles.aiBtn}
            onClick={handleSummary}
            disabled={Boolean(loadingAction)}
          >
            {loadingAction === "summary" ? "生成摘要中..." : "💡 產生摘要"}
          </button>
        )}

        {onApplyTags && (
          <button
            type="button"
            className={styles.aiBtn}
            onClick={handleTags}
            disabled={Boolean(loadingAction)}
          >
            {loadingAction === "tags" ? "提取標籤中..." : "🏷️ 自動標籤"}
          </button>
        )}
      </div>

      {loadingAction && (
        <span className={styles.statusText}>
          ⏳ Gemini 正在為您運算中...
        </span>
      )}

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
