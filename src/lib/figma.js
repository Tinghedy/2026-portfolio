/**
 * Figma REST API helper — calls our own /api/figma serverless function,
 * which holds the Figma token server-side. Admin login required.
 */
import { callApi } from "./apiClient";

/**
 * Extract file key and node id from a Figma URL
 * Examples:
 * - https://www.figma.com/design/abc123XYZ/Project-Title?node-id=1-2
 * - https://www.figma.com/file/abc123XYZ/Project-Title?node-id=10%3A20
 */
export function parseFigmaUrl(url) {
  if (!url || typeof url !== "string") return null;

  try {
    const parsed = new URL(url.trim());
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    
    // Path format: /design/:fileKey/:title OR /file/:fileKey/:title
    let fileKey = null;
    if ((pathParts[0] === "design" || pathParts[0] === "file") && pathParts[1]) {
      fileKey = pathParts[1];
    }

    const nodeIdParam = parsed.searchParams.get("node-id");
    let nodeId = null;
    if (nodeIdParam) {
      // Convert URL encoding or hyphens: "1-2" -> "1:2", "1%3A2" -> "1:2"
      nodeId = decodeURIComponent(nodeIdParam).replace("-", ":");
    }

    return { fileKey, nodeId };
  } catch (err) {
    console.error("[Figma] Failed to parse Figma URL:", err);
    return null;
  }
}

/**
 * Fetch Figma file metadata
 */
export async function getFigmaFile(fileKey) {
  if (!fileKey) throw new Error("Figma file key is required");
  return await callApi("/api/figma", { action: "file", fileKey });
}

/**
 * Fetch exported image URLs for specific node IDs in a Figma file
 */
export async function getFigmaImages(fileKey, nodeIds, options = {}) {
  if (!fileKey) throw new Error("Figma file key is required");
  const data = await callApi("/api/figma", {
    action: "images",
    fileKey,
    nodeIds: Array.isArray(nodeIds) ? nodeIds : [nodeIds],
    format: options.format || "png",
    scale: options.scale || 2,
  });
  return data.images; // Object mapping nodeId -> imageUrl
}

/**
 * Fetch node details (e.g. layer names, dimensions, frame info)
 */
export async function getFigmaNodes(fileKey, nodeIds) {
  if (!fileKey) throw new Error("Figma file key is required");
  return await callApi("/api/figma", {
    action: "nodes",
    fileKey,
    nodeIds: Array.isArray(nodeIds) ? nodeIds : [nodeIds],
  });
}
