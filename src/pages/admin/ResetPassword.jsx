import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Login.module.css";

const MIN_LENGTH = 8;

/** Supabase puts link errors (expired / already used) in the URL hash or query. */
function readLinkError() {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
  return params.get("error_description")?.replace(/\+/g, " ") || "";
}

/**
 * /admin/reset-password — opened from the "reset password" email.
 * supabase-js reads the token in the URL and signs the user in
 * (detectSessionInUrl); this page then lets them set a new password.
 */
export default function ResetPassword() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [linkError] = useState(readLinkError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_LENGTH) return setError(`密碼至少 ${MIN_LENGTH} 個字元。`);
    if (password !== confirm) return setError("兩次輸入的密碼不一樣。");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return setError(error.message);
    navigate("/admin/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.box}>
          <p className={styles.hint}>驗證連結中…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.page}>
        <div className={styles.box}>
          <h1 className={styles.title}>連結無效或已過期</h1>
          <p className={styles.hint}>
            {linkError || "重設密碼的連結只能用一次，而且有時效。"}請回登入頁按「忘記密碼？」重新寄一封。
          </p>
          <Link to="/admin" className={styles.link}>← 回到登入</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <h1 className={styles.title}>設定新密碼</h1>
        <p className={styles.hint}>{session.user?.email}</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`新密碼（至少 ${MIN_LENGTH} 個字元）`}
            autoComplete="new-password"
            required
            className={styles.input}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="再輸入一次"
            autoComplete="new-password"
            required
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={saving} className={styles.btn}>
            {saving ? "儲存中…" : "儲存新密碼"}
          </button>
        </form>
      </div>
    </div>
  );
}
