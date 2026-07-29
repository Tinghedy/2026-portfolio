/**
 * Figma REST API Service Helper
 */

const FIGMA_TOKEN = import.meta.env.VITE_FIGMA_TOKEN;

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
export async function getFigmaFile(fileKey, token = FIGMA_TOKEN) {
  if (!token) throw new Error("Figma Personal Access Token is missing in .env (VITE_FIGMA_TOKEN)");
  if (!fileKey) throw new Error("Figma file key is required");

  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      "X-Figma-Token": token,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Figma API Error (${res.status})`);
  }

  return await res.json();
}

/**
 * Fetch exported image URLs for specific node IDs in a Figma file
 */
export async function getFigmaImages(fileKey, nodeIds, options = {}, token = FIGMA_TOKEN) {
  if (!token) throw new Error("Figma Personal Access Token is missing in .env (VITE_FIGMA_TOKEN)");
  if (!fileKey) throw new Error("Figma file key is required");

  const ids = Array.isArray(nodeIds) ? nodeIds.join(",") : nodeIds;
  const format = options.format || "png";
  const scale = options.scale || 2;

  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=${format}&scale=${scale}`;

  const res = await fetch(url, {
    headers: {
      "X-Figma-Token": token,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Figma API Image Export Error (${res.status})`);
  }

  const data = await res.json();
  return data.images; // Object mapping nodeId -> imageUrl
}

/**
 * Fetch node details (e.g. layer names, dimensions, frame info)
 */
export async function getFigmaNodes(fileKey, nodeIds, token = FIGMA_TOKEN) {
  if (!token) throw new Error("Figma Personal Access Token is missing in .env (VITE_FIGMA_TOKEN)");
  if (!fileKey) throw new Error("Figma file key is required");

  const ids = Array.isArray(nodeIds) ? nodeIds.join(",") : nodeIds;
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`, {
    headers: {
      "X-Figma-Token": token,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Figma API Nodes Error (${res.status})`);
  }

  return await res.json();
}
