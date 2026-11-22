import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Login.module.css";

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // "login" = email + password; "forgot" = send a reset-password email
  const [mode, setMode] = useState("login");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (session) navigate("/admin/dashboard", { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    if (mode === "forgot") {
      // The link in the email opens /admin/reset-password on this same site.
      // That URL must be in Supabase → Authentication → URL Configuration →
      // Redirect URLs, otherwise Supabase falls back to the Site URL
      // (AuthContext still routes the recovery to the reset page).
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) setError(error.message);
      else setNotice("已寄出重設密碼信，請到信箱點連結。（連結只能用一次，約 1 小時內有效）");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <h1 className={styles.title}>{mode === "forgot" ? "重設密碼" : "Admin"}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
            className={styles.input}
          />
          {mode === "login" && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className={styles.input}
            />
          )}
          {error && <p className={styles.error}>{error}</p>}
          {notice && <p className={styles.notice}>{notice}</p>}
          <button type="submit" disabled={loading} className={styles.btn}>
            {mode === "forgot"
              ? (loading ? "寄送中…" : "寄送重設密碼信")
              : (loading ? "Signing in…" : "Sign In")}
          </button>
        </form>
        <button
          type="button"
          className={styles.link}
          onClick={() => switchMode(mode === "forgot" ? "login" : "forgot")}
        >
          {mode === "forgot" ? "← 回到登入" : "忘記密碼？"}
        </button>
      </div>
    </div>
  );
}
