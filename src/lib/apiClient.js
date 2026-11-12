import { supabase } from "./supabase";

/**
 * POST to one of our own /api serverless functions with the admin's
 * Supabase access token. Throws with the server's error message on failure.
 */
export async function callApi(path, body) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("請先登入後台");

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `API Error (${res.status})`);
  return data;
}
