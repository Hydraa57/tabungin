// src/components/ReminderBanner.jsx
import React from "react";
import Button from "./ui/button.jsx";

export default function ReminderBanner({ message, cta, onCta, onClose }) {
  return (
    <div className="reminder">
      <style>{`
        .reminder{
          position: fixed; top: calc(env(safe-area-inset-top,0px) + 8px); left: 50%; transform: translateX(-50%);
          z-index: 1300; background: var(--card); color: var(--text); border:1px solid var(--border);
          border-radius: 12px; padding: 10px 12px; display:flex; align-items:center; gap:8px;
          box-shadow: 0 10px 30px rgba(0,0,0,.18);
          animation: drop .25s ease both;
        }
        @keyframes drop { from { opacity:0; transform: translate(-50%,-8px); } to { opacity:1; transform: translate(-50%,0); } }
      `}</style>
      <div style={{ fontWeight: 700 }}>{message}</div>
      <Button onClick={onCta}>{cta}</Button>
      <Button variant="ghost" onClick={onClose}>
        Tutup
      </Button>
    </div>
  );
}
