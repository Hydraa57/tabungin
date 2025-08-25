// src/pages/Onboarding.jsx
import React, { useState } from "react";
import Button from "../components/ui/button.jsx";

const slides = [
  { title: "Catat tanpa ribet", text: "Tambah pemasukan/pengeluaran hitungan detik." },
  { title: "Terlihat jelas", text: "Grafik mingguan & kategori + batas 'Ingin'." },
  { title: "Sync & offline", text: "Tetap jalan tanpa internet, sinkron saat online." },
];

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;

  return (
    <div className="obd-wrap" onClick={(e) => e.stopPropagation()}>
      <style>{`
        .obd-wrap{
          position: fixed; inset:0; z-index:1400;
          background: color-mix(in hsl, #0b1220 88%, transparent);
          display:grid; place-items:center; padding:18px;
        }
        body.light .obd-wrap{ background: color-mix(in hsl, #ffffff 92%, transparent); }
        .obd-card{ width:min(560px,92vw); background:var(--card); color:var(--text);
          border:1px solid var(--border); border-radius:16px; padding:18px; display:grid; gap:12px; }
        .obd-title{ font-weight:900; font-size:20px; }
        .obd-text{ color:var(--muted); }
        .obd-ctrl{ display:flex; justify-content:space-between; align-items:center; gap:8px; }
        .dots{ display:flex; gap:6px; }
        .dot{ width:8px; height:8px; border-radius:999px; background:var(--border); }
        .dot.active{ background:var(--primary,#4ea1ff); }
      `}</style>

      <div className="obd-card">
        <div className="obd-title">{slides[i].title}</div>
        <div className="obd-text">{slides[i].text}</div>
        <div className="obd-ctrl">
          <Button variant="ghost" onClick={onDone}>
            Lewati
          </Button>
          <div className="dots">
            {slides.map((_, idx) => (
              <span key={idx} className={`dot ${i === idx ? "active" : ""}`} />
            ))}
          </div>
          {last ? <Button onClick={onDone}>Mulai Sekarang</Button> : <Button onClick={() => setI(i + 1)}>Lanjut</Button>}
        </div>
      </div>
    </div>
  );
}
