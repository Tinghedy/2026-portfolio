// POST /api/figma — server-side proxy to the Figma REST API. Admin only.
// body: { action: "file" | "images" | "nodes", fileKey, nodeIds?, format?, scale? }
import { requireAdmin, readJson, sendJson } from "./_auth.js";

const FILE_KEY_RE = /^[A-Za-z0-9]+$/;
const NODE_ID_RE = /^I?[0-9]+[:-][0-9]+(;I?[0-9]+[:-][0-9]+)*$/;
const FORMATS = new Set(["png", "jpg", "svg", "pdf"]);
const MAX_NODE_IDS = 50;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) return sendJson(res, auth.status, { error: auth.message });

  const token = process.env.FIGMA_TOKEN;
  if (!token) return sendJson(res, 500, { error: "FIGMA_TOKEN 尚未設定" });

  const body = await readJson(req);
  if (!body) return sendJson(res, 400, { error: "無效的 JSON" });

  const { action, fileKey } = body;
  if (typeof fileKey !== "string" || !FILE_KEY_RE.test(fileKey)) {
    return sendJson(res, 400, { error: "無效的 Figma file key" });
  }

  let path;
  if (action === "file") {
    path = `/v1/files/${fileKey}`;
  } else if (action === "images" || action === "nodes") {
    const nodeIds = Array.isArray(body.nodeIds) ? body.nodeIds : [body.nodeIds];
    if (
      nodeIds.length === 0 ||
      nodeIds.length > MAX_NODE_IDS ||
      !nodeIds.every((id) => typeof id === "string" && NODE_ID_RE.test(id))
    ) {
      return sendJson(res, 400, { error: "無效的 node ID" });
    }
    const ids = encodeURIComponent(nodeIds.join(","));

    if (action === "images") {
      const format = FORMATS.has(body.format) ? body.format : "png";
      const scale = Math.min(4, Math.max(0.5, Number(body.scale) || 2));
      path = `/v1/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`;
    } else {
      path = `/v1/files/${fileKey}/nodes?ids=${ids}`;
    }
  } else {
    return sendJson(res, 400, { error: "未知的 action" });
  }

  let upstream;
  try {
    upstream = await fetch(`https://api.figma.com${path}`, {
      headers: { "X-Figma-Token": token },
    });
  } catch {
    return sendJson(res, 502, { error: "無法連線到 Figma" });
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return sendJson(res, upstream.status, { error: data.err || data.message || `Figma API Error (${upstream.status})` });
  }
  return sendJson(res, 200, data);
}
