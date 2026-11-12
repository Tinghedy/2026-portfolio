// Shared helpers for Vercel Serverless Functions.
// Files prefixed with "_" are not exposed as endpoints by Vercel.

/**
 * Verify the caller's Supabase access token and require the admin email.
 * Returns { ok: true, user } or { ok: false, status, message }.
 */
export async function requireAdmin(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return { ok: false, status: 401, message: "未登入" };

  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!url || !anonKey || !adminEmail) {
    return { ok: false, status: 500, message: "伺服器環境變數未設定（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / ADMIN_EMAIL）" };
  }

  let r;
  try {
    r = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    });
  } catch {
    return { ok: false, status: 502, message: "無法連線到 Supabase" };
  }
  if (!r.ok) return { ok: false, status: 401, message: "登入已失效，請重新登入" };

  const user = await r.json();
  if ((user.email || "").toLowerCase() !== adminEmail.trim().toLowerCase()) {
    return { ok: false, status: 403, message: "無權限" };
  }
  return { ok: true, user };
}

/** Parse a JSON body whether or not the runtime already parsed it. */
export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || "{}"); } catch { return null; }
}

export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}
