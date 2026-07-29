import http from "node:http";

const PORT = 3845;
const FIGMA_TOKEN = process.env.VITE_FIGMA_TOKEN || process.env.FIGMA_PERSONAL_ACCESS_TOKEN || "";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

async function fetchFigma(path, params = {}) {
  const url = new URL(`https://api.figma.com/v1${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  const res = await fetch(url, {
    headers: { "X-Figma-Token": FIGMA_TOKEN },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Figma API (${res.status}): ${errText}`);
  }

  return await res.json();
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const msg = JSON.parse(body || "{}");
      const { jsonrpc, id, method, params } = msg;

      if (method === "initialize") {
        res.writeHead(200, headers);
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: params?.protocolVersion || "2024-11-05",
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: "Figma Dev Mode MCP Server",
                version: "1.0.0",
              },
            },
          })
        );
        return;
      }

      if (method === "notifications/initialized") {
        res.writeHead(200, headers);
        res.end(JSON.stringify({ jsonrpc: "2.0" }));
        return;
      }

      if (method === "tools/list") {
        res.writeHead(200, headers);
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            result: {
              tools: [
                {
                  name: "get_figma_file",
                  description: "Get metadata and layer structure of a Figma file by file_key",
                  inputSchema: {
                    type: "object",
                    properties: {
                      file_key: { type: "string", description: "Figma file key from URL" },
                    },
                    required: ["file_key"],
                  },
                },
                {
                  name: "get_figma_node_images",
                  description: "Export high-resolution PNG image URLs for specific node IDs in a Figma file",
                  inputSchema: {
                    type: "object",
                    properties: {
                      file_key: { type: "string", description: "Figma file key from URL" },
                      node_ids: { type: "array", items: { type: "string" }, description: "Node IDs to export" },
                      scale: { type: "number", description: "Image scale (e.g. 2 for 2x)" },
                    },
                    required: ["file_key", "node_ids"],
                  },
                },
              ],
            },
          })
        );
        return;
      }

      if (method === "tools/call") {
        const { name, arguments: args } = params || {};
        let resultData = null;

        if (name === "get_figma_file") {
          resultData = await fetchFigma(`/files/${args.file_key}`);
        } else if (name === "get_figma_node_images") {
          const ids = args.node_ids.join(",");
          const scale = args.scale || 2;
          resultData = await fetchFigma(`/images/${args.file_key}`, { ids, scale, format: "png" });
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }

        res.writeHead(200, headers);
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(resultData, null, 2),
                },
              ],
            },
          })
        );
        return;
      }

      res.writeHead(200, headers);
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: id ?? null,
          result: {},
        })
      );
    } catch (err) {
      res.writeHead(500, headers);
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32603, message: err.message },
        })
      );
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`✅ [Figma Dev Mode MCP Server] Successfully listening on http://127.0.0.1:${PORT}/mcp`);
});
