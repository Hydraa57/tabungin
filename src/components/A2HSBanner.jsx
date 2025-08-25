// src/components/A2HSBanner.jsx
import React, { useEffect, useState } from "react";
import Button from "./ui/button.jsx";

export default function A2HSBanner() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("a2hs_dismissed") === "1";
    const handler = (e) => {
      e.preventDefault();
      if (!seen) {
        setDeferred(e);
        setShow(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
    localStorage.setItem("a2hs_dismissed", "1");
  };

  return (
    <div className="a2hs">
      <style>{`
        .a2hs{
          position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 1300;
          background: var(--card); color: var(--text); border:1px solid var(--border);
          border-radius: 14px; padding: 10px 12px; display:flex; gap:10px; align-items:center;
          box-shadow: 0 10px 30px rgba(0,0,0,.18);
        }
        .a2hs .title{ font-weight:800; }
        .a2hs .spacer{ flex:1; }
      `}</style>

      <div>
        <div className="title">Pasang aplikasi</div>
        <div className="text" style={{ opacity: 0.8 }}>
          Buka lebih cepat dari Home Screen.
        </div>
      </div>
      <div className="spacer" />
      <Button onClick={install}>Pasang</Button>
      <Button
        variant="ghost"
        onClick={() => {
          setShow(false);
          localStorage.setItem("a2hs_dismissed", "1");
        }}
      >
        Nanti
      </Button>
    </div>
  );
}
