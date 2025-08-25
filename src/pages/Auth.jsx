import React, { useMemo, useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo-header.png';

const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; const hasLetter=/[A-Za-z]/; const hasNumber=/[0-9]/;

export default function Auth({ onSignedIn }){
  const [mode,setMode]=useState('login'); const [name,setName]=useState(''); const [email,setEmail]=useState('');
  const [pw,setPw]=useState(''); const [pw2,setPw2]=useState(''); const [loading,setLoading]=useState(false);
  const [showPw,setShowPw]=useState(false); const [showPw2,setShowPw2]=useState(false); const [err,setErr]=useState('');
  const pwValid=useMemo(()=> pw.length>=8 && hasLetter.test(pw) && hasNumber.test(pw),[pw]);
  const pwMatch=useMemo(()=> pw && pw2 && pw===pw2,[pw,pw2]); const emailValid=useMemo(()=> emailRegex.test(email),[email]);
  const canSignUp=useMemo(()=> name.trim() && emailValid && pwValid && pwMatch,[name,emailValid,pwValid,pwMatch]);
  const canLogin=useMemo(()=> emailValid && pw.length>=1,[emailValid,pw]);

  const parse=(e)=>{ const m=(e?.code||e?.message||'').toString();
    if(m.includes('auth/weak-password')) return 'Kata sandi lemah (huruf+angka, min 8).';
    if(m.includes('auth/email-already-in-use')) return 'Email sudah terdaftar.';
    if(m.includes('auth/invalid-email')) return 'Email tidak valid.';
    if(m.includes('auth/invalid-credential')||m.includes('auth/wrong-password')) return 'Email atau kata sandi salah.';
    if(m.includes('auth/user-not-found')) return 'Akun tidak ditemukan.'; return 'Terjadi kesalahan. Coba lagi.'; };

  const doLogin=async(e)=>{ e.preventDefault(); if(!canLogin||loading) return; setLoading(true); setErr('');
    try{ await signInWithEmailAndPassword(auth,email.trim(),pw); onSignedIn?.(); }catch(ex){ setErr(parse(ex)); }finally{ setLoading(false); } };

  const doSignup=async(e)=>{ e.preventDefault(); if(!canSignUp||loading) return; setLoading(true); setErr('');
    try{ const cred=await createUserWithEmailAndPassword(auth,email.trim(),pw);
      if(name.trim()) await updateProfile(cred.user,{ displayName: name.trim() }); onSignedIn?.(); }
    catch(ex){ setErr(parse(ex)); } finally{ setLoading(false); } };

  const doReset=async()=>{ if(!emailValid){ setErr('Masukkan email valid untuk reset kata sandi.'); return; }
    setLoading(true); setErr(''); try{ await sendPasswordResetEmail(auth,email.trim()); setErr('✅ Link reset dikirim ke email.'); }
    catch(ex){ setErr(parse(ex)); } finally{ setLoading(false); } };

  return (<div className="auth-wrap">
    <style>{`/* minimal css from earlier */ .auth-wrap{min-height:100dvh;display:grid;place-items:center;padding:24px;background:var(--page,#f7f9ff);} body:not(.light) .auth-wrap{background:#0b1220;} .auth-card{width:100%;max-width:420px;background:var(--card);border:1px solid var(--border);border-radius:18px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.12);} .logo-wrap{display:flex;align-items:center;gap:10px;margin-bottom:10px;} .brand .b1,.brand .b2{font-size:18px;font-weight:800;line-height:1;} .brand .b2{color:var(--muted);} .tabs{display:flex;gap:6px;background:var(--surface,#0f1729);border:1px solid var(--border);border-radius:12px;padding:4px;margin:10px 0 12px;} body.light .tabs{background:#f6f8fe;border-color:#e6eaf3;} .tab{flex:1;padding:10px 12px;border-radius:10px;border:none;background:transparent;color:var(--text);font-weight:700;} .tab.active{background:#2a3650;color:#eaf0ff;} body.light .tab{color:#0b1220;} body.light .tab.active{background:#ffffff;box-shadow:0 1px 0 #e6eaf3 inset;} .field{display:grid;gap:6px;margin-bottom:10px;} label{font-size:12.5px;color:var(--muted);} .inp{width:100%;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--surface,#101a2e);color:var(--text);} body.light .inp{background:#fff;color:#0b1220;border-color:#e6eaf3;} .pw-wrap{position:relative;} .eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:30px;height:30px;display:grid;place-items:center;border:none;background:transparent;color:var(--muted);} .hint{font-size:12px;color:#f59e0b;} .alert{background:#ffefef;color:#b91c1c;border:1px solid #fecaca;padding:10px 12px;border-radius:12px;font-weight:700;margin:6px 0;} body:not(.light) .alert{background:#2a1111;border-color:#4a1e1e;color:#fecaca;} .cta{width:100%;padding:12px;border:none;border-radius:12px;font-weight:800;color:#fff;background:linear-gradient(180deg,#4776ff,#335dff);box-shadow:0 6px 18px rgba(71,118,255,.25);} .cta:disabled{opacity:.6;} .link{margin-top:10px;width:100%;background:transparent;border:none;color:#3b82f6;font-weight:700;} `}</style>
    <div className="auth-card">
      <div className="logo-wrap">
        <img src={logo} alt="Logo" width="72" height="72"/>
        <div className="brand"><div className="b1">Dashboard</div><div className="b2">Keuangan</div></div>
      </div>
      <div className="tabs">
        <button className={`tab ${mode==='login'?'active':''}`} onClick={()=>setMode('login')}>Masuk</button>
        <button className={`tab ${mode==='signup'?'active':''}`} onClick={()=>setMode('signup')}>Daftar</button>
      </div>
      {mode==='signup' ? (
        <form onSubmit={doSignup} className="form">
          <div className="field"><label>Nama panggilan</label>
            <input className="inp" placeholder="Mis. Hafidz" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div className="field"><label>Email</label>
            <input className="inp" placeholder="nama@email.com" value={email} onChange={e=>setEmail(e.target.value)} type="email"/></div>
          <div className="field"><label>Kata sandi</label>
            <div className="pw-wrap">
              <input className="inp" placeholder="Minimal 8 karakter, huruf & angka" value={pw} onChange={e=>setPw(e.target.value)} type={showPw?'text':'password'}/>
              <button type="button" className="eye" onClick={()=>setShowPw(s=>!s)}>{showPw? <span>🙈</span>:<span>👁️</span>}</button>
            </div>
            {pw && !pwValid && <div className="hint">Sandi harus ≥8 karakter dan mengandung huruf & angka.</div>}
          </div>
          <div className="field"><label>Konfirmasi kata sandi</label>
            <div className="pw-wrap">
              <input className="inp" placeholder="Ulangi kata sandi" value={pw2} onChange={e=>setPw2(e.target.value)} type={showPw2?'text':'password'}/>
              <button type="button" className="eye" onClick={()=>setShowPw2(s=>!s)}>{showPw2? <span>🙈</span>:<span>👁️</span>}</button>
            </div>
            {pw2 && !pwMatch && <div className="hint">Konfirmasi tidak cocok.</div>}
          </div>
          {err && <div className="alert">{err}</div>}
          <button className="cta" disabled={!canSignUp || loading}>{loading ? 'Memproses…' : 'Daftar'}</button>
        </form>
      ):(
        <form onSubmit={doLogin} className="form">
          <div className="field"><label>Email</label>
            <input className="inp" placeholder="nama@email.com" value={email} onChange={e=>setEmail(e.target.value)} type="email"/></div>
          <div className="field"><label>Kata sandi</label>
            <div className="pw-wrap">
              <input className="inp" placeholder="Kata sandi" value={pw} onChange={e=>setPw(e.target.value)} type={showPw?'text':'password'}/>
              <button type="button" className="eye" onClick={()=>setShowPw(s=>!s)}>{showPw? <span>🙈</span>:<span>👁️</span>}</button>
            </div>
          </div>
          {err && <div className="alert">{err}</div>}
          <button className="cta" disabled={!canLogin || loading}>{loading ? 'Memproses…' : 'Masuk'}</button>
          <button type="button" className="link" onClick={doReset} disabled={loading}>Lupa kata sandi?</button>
        </form>
      )}
    </div>
  </div>);
}
