// src/components/UpdateBanner.jsx
import React, { useEffect, useState } from "react";
import Button from "./ui/button.jsx";

export default function UpdateBanner() {
  const [reg, setReg] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onWaiting = (e) => {
      setReg(e.detail.registration);
      setOpen(true);
    };
    window.addEventListener("swWaiting", onWaiting);
    return () => window.removeEventListener("swWaiting", onWaiting);
  }, []);

  useEffect(() => {
    if (!reg) return;
    // reload otomatis saat controller berganti
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, [reg]);

  if (!open) return null;

  const doUpdate = () => {
    if (!reg?.waiting) return;
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
    setOpen(false);
  };

  return (
    <div className="upd-banner">
      <style>{`
        .upd-banner{
          position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 1300;
          background: var(--card); color: var(--text);
          border:1px solid var(--border); border-radius: 14px;
          padding: 10px 12px; display:flex; gap:10px; align-items:center;
          box-shadow: 0 10px 30px rgba(0,0,0,.18);
          animation: pop .2s ease both;
        }
        @keyframes pop { from { transform: translateY(8px); opacity:.6 } to { transform: translateY(0); opacity:1 } }
        .upd-banner .sp{ flex:1; }
      `}</style>
      <div>
        <b>Update tersedia</b> — Versi baru siap dipakai.
      </div>
      <div className="sp" />
      <Button onClick={doUpdate}>Perbarui</Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Nanti
      </Button>
    </div>
  );
}
