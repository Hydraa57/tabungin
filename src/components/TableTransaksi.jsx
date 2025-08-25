// src/components/TableTransaksi.jsx
import React, { useEffect, useRef, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import { rupiah } from "../utils/numberFormat.js";

export default function TableTransaksi({ transaksi = [], onEdit, onDelete, enableSwipe = true }) {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on, { passive: true });
    return () => window.removeEventListener("resize", on);
  }, []);
  const isMobile = w < 560;

  if (isMobile) {
    return <MobileCardList transaksi={transaksi} onEdit={onEdit} onDelete={onDelete} enableSwipe={enableSwipe} />;
  }
  return <DesktopTable transaksi={transaksi} onEdit={onEdit} onDelete={onDelete} />;
}

/* ================= Desktop Table ================= */

function DesktopTable({ transaksi, onEdit, onDelete }) {
  return (
    <div className="table-scroll" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table className="table" style={{ minWidth: 860, width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Tanggal</th>
            <th style={th}>Tipe</th>
            <th style={th}>Kategori</th>
            <th style={th}>Prioritas</th>
            <th style={th}>Deskripsi</th>
            <th style={thRight}>Jumlah</th>
            <th className="th-actions" style={{ ...th, position: "sticky", right: 0, background: "var(--card)", minWidth: 84, width: 84 }}>
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {transaksi.map((t, idx) => (
            <tr key={t.id ?? idx}>
              <td style={td}>{t.tanggal}</td>
              <td style={td}>{t.tipe}</td>
              <td style={td}>{t.kategori}</td>
              <td style={td}>{t.prioritas}</td>
              <td style={{ ...td, maxWidth: 360, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{t.deskripsi}</td>
              <td style={{ ...tdRight, fontWeight: 700 }}>Rp{rupiah(t.jumlah)}</td>
              <td
                className="td-actions"
                style={{
                  ...td,
                  position: "sticky",
                  right: 0,
                  background: "var(--card)",
                  minWidth: 84,
                  width: 84,
                  paddingRight: 8,
                }}
              >
                <button className="mini-btn" onClick={() => onEdit?.(t)} title="Edit" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button className="mini-btn" onClick={() => onDelete?.(t)} title="Hapus" aria-label="Hapus">
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
          {transaksi.length === 0 && (
            <tr>
              <td colSpan={7} style={{ ...td, textAlign: "center", padding: 14 }}>
                Belum ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <style>{`
        .table-scroll{ border-radius:14px; border:1px solid var(--border); background:var(--card); }
        .table thead th{ background:var(--card); box-shadow: inset 0 -1px 0 var(--border); }
        .table th, .table td{ border-bottom:1px solid var(--border); }
        .mini-btn{ width:28px; height:28px; border-radius:8px; display:grid; place-items:center; border:1px solid var(--border);
          background: color-mix(in hsl, var(--card,#0b1220) 92%, transparent); color: var(--text); }
      `}</style>
    </div>
  );
}

/* ================= Mobile Card List (Swipe) ================= */

function MobileCardList({ transaksi, onEdit, onDelete, enableSwipe }) {
  return (
    <div className="card-list" style={{ display: "grid", gap: 8 }}>
      {transaksi.map((t, idx) => (
        <SwipeCard key={t.id ?? idx} data={t} enableSwipe={enableSwipe} onEdit={() => onEdit?.(t)} onDelete={() => onDelete?.(t)} />
      ))}
      {transaksi.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 12, border: "1px solid var(--border)", borderRadius: 14 }}>
          Belum ada data.
        </div>
      )}
      <style>{`
        .card-item{ position:relative; overflow:hidden; border:1px solid var(--border); border-radius:14px; background:var(--card); }
        /* aksi disembunyikan sampai diswipe */
        .actions{
          position:absolute; inset:0 0 0 auto; width:120px; display:flex; align-items:center; justify-content:flex-end; gap:8px;
          padding-right:8px; background:var(--card);
          opacity:0; transform: translateX(120px); pointer-events:none;
          transition: opacity .18s ease, transform .18s ease;
        }
        .card-item.is-swiped .actions{
          opacity:1; transform: translateX(0); pointer-events:auto;
        }
        .row{
          padding:10px; display:grid; gap:6px;
          transform: translateX(0); transition: transform .18s ease; will-change: transform;
        }
        .card-item.is-swiped .row{ transform: translateX(-120px); }

        .kv{ display:flex; justify-content:space-between; gap:8px; font-size:13.5px; }
        .muted{ opacity:.72 }
        .amount{ font-weight:800; }
        .mini-btn{ width:28px; height:28px; border-radius:8px; display:grid; place-items:center; border:1px solid var(--border);
          background: color-mix(in hsl, var(--card,#0b1220) 92%, transparent); color: var(--text); }
      `}</style>
    </div>
  );
}

function SwipeCard({ data, onEdit, onDelete, enableSwipe }) {
  const containerRef = useRef(null);
  const start = useRef({ x: 0, y: 0 });
  const swiped = useRef(false);

  const onTouchStart = (e) => {
    if (!enableSwipe) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchMove = (e) => {
    if (!enableSwipe) return;
    const t = e.touches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;

    if (Math.abs(dx) < 16 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < -20) {
      if (!swiped.current) {
        swiped.current = true;
        containerRef.current?.classList.add("is-swiped");
      }
    } else if (dx > 20) {
      if (swiped.current) {
        swiped.current = false;
        containerRef.current?.classList.remove("is-swiped");
      }
    }
  };

  const onTouchEnd = () => {};

  // ⬇️ auto close saat user tap konten
  const closeIfOpen = () => {
    if (swiped.current) {
      swiped.current = false;
      containerRef.current?.classList.remove("is-swiped");
    }
  };

  return (
    <div ref={containerRef} className="card-item" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="actions">
        <button className="mini-btn" onClick={onEdit} title="Edit" aria-label="Edit">
          <Pencil size={16} />
        </button>
        <button className="mini-btn" onClick={onDelete} title="Hapus" aria-label="Hapus">
          <Trash size={16} />
        </button>
      </div>
      <div className="row" onClick={closeIfOpen}>
        <div className="kv">
          <span className="muted">{data.tanggal}</span>
          <span className="muted">{data.tipe}</span>
        </div>
        <div className="kv">
          <span>
            {data.kategori}
            {data.prioritas && data.prioritas !== "—" ? ` · ${data.prioritas}` : ""}
          </span>
          <span className="amount">Rp{rupiah(data.jumlah)}</span>
        </div>
        {data.deskripsi && (
          <div className="muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {data.deskripsi}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== Shared cell styles ================== */

const th = {
  textAlign: "left",
  padding: "8px 10px",
  fontWeight: 800,
  whiteSpace: "nowrap",
};
const thRight = { ...th, textAlign: "right" };
const td = {
  padding: "8px 10px",
  whiteSpace: "nowrap",
};
const tdRight = { ...td, textAlign: "right" };
