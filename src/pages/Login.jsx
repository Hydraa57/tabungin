import React, { useState } from "react";
import logo from "../assets/logo.png"; // ← taruh file logo di: src/assets/logo.png
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

const mapError = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/user-not-found":
      return "Email tidak terdaftar.";
    case "auth/wrong-password":
      return "Password salah.";
    case "auth/email-already-in-use":
      return "Email sudah digunakan.";
    case "auth/weak-password":
      return "Password terlalu lemah (min. 6 karakter).";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi beberapa saat.";
    default:
      return "Terjadi kesalahan. Coba lagi.";
  }
};

export default function Login() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        if (pass.length < 6) throw { code: "auth/weak-password" };
        await createUserWithEmailAndPassword(auth, email, pass);
      }
      nav("/");
    } catch (e) {
      setErr(mapError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    setErr("");
    setInfo("");
    if (!email) {
      setErr("Masukkan email dulu untuk reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("Tautan reset password telah dikirim ke email kamu.");
    } catch (e) {
      setErr(mapError(e.code));
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        {/* Logo & heading */}
        <div className="auth-logo">
          <img src={logo} alt="Logo" width="72" height="72" />
          <div className="auth-title">Dashboard Kontolllll</div>
          <div className="auth-subtitle">{mode === "login" ? "Masuk untuk melanjutkan" : "Buat akun baru"}</div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="auth-form">
          {/* Email */}
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <div className="auth-field">
            <Mail size={18} className="auth-icon" />
            <input id="email" className="input auth-input" type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {/* Password */}
          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <div className="auth-field">
            <Lock size={18} className="auth-icon" />
            <input
              id="password"
              className="input auth-input"
              type={show ? "text" : "password"}
              placeholder="Password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <button type="button" className="auth-eye" aria-label={show ? "Sembunyikan password" : "Lihat password"} onClick={() => setShow((s) => !s)} title={show ? "Sembunyikan" : "Lihat"}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember + Lupa Password */}
          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Ingat saya</span>
            </label>
            <button type="button" className="auth-link" onClick={onForgot}>
              Lupa password?
            </button>
          </div>

          {/* Alert */}
          {err && <div className="alert">{err}</div>}
          {!err && info && (
            <div className="alert" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
              {info}
            </div>
          )}

          {/* Submit */}
          <button className="button auth-submit" type="submit" disabled={loading}>
            {loading && <Loader2 className="spin" size={16} style={{ marginRight: 8 }} />}
            {mode === "login" ? "Masuk" : "Daftar"}
          </button>

          {/* Toggle mode */}
          <div className="auth-switch">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button type="button" className="auth-link" onClick={() => setMode("register")}>
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button type="button" className="auth-link" onClick={() => setMode("login")}>
                  Masuk
                </button>
              </>
            )}
          </div>

          <div className="auth-footnote">Dengan masuk, kamu menyetujui ketentuan & kebijakan privasi aplikasi ini.</div>
        </form>
      </div>
    </div>
  );
}
