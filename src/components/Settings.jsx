// src/components/Settings.jsx
import React, { useEffect, useState } from "react";
import Button from "./ui/button.jsx";
import { onlyDigits, formatID } from "../utils/numberFormat.js";

export default function Settings({
  open,
  onClose,
  defaultLimit = 500000,
  onSave,
  inginCategories = [],
  onSaveCategories,
  kategoriList = [],
  onSaveKategoriList,

  // NEW: reminder controls
  reminderEnabled = true,
  onToggleReminder = () => {},
  reminderTime = "20:00",
  onChangeReminderTime = () => {},
}) {
  const [limit, setLimit] = useState(String(defaultLimit));
  useEffect(() => setLimit(String(defaultLimit)), [defaultLimit]);

  const [newKategori, setNewKategori] = useState("");

  const addKategori = () => {
    const v = newKategori.trim();
    if (!v) return;
    const exists = kategoriList.find((k) => k.toLowerCase() === v.toLowerCase());
    if (exists) return;
    onSaveKategoriList?.([...kategoriList, v]);
    setNewKategori("");
  };

  const removeKategori = (k) => {
    onSaveKategoriList?.(kategoriList.filter((x) => x !== k));
  };

  const [ingin, setIngin] = useState(inginCategories);
  useEffect(() => setIngin(inginCategories), [inginCategories]);

  const toggleIngin = (k) => {
    if (ingin.includes(k)) setIngin(ingin.filter((x) => x !== k));
    else setIngin([...ingin, k]);
  };

  const submitLimit = () => {
    const n = parseInt(onlyDigits(limit) || "0", 10);
    onSave?.(n);
  };

  return (
    <div>
      {/* Limit & Kategori Ingin */}
      <section className="card" style={{ marginBottom: 12 }}>
        <div className="section-title">Batas Belanja “Ingin”</div>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Limit bulanan (Rp)</label>
          <input className="input" inputMode="numeric" value={formatID(limit)} onChange={(e) => setLimit(onlyDigits(e.target.value))} placeholder="cth: 500.000" />
          <Button onClick={submitLimit}>Simpan Limit</Button>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 12 }}>
        <div className="section-title">Kategori</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {kategoriList.map((k) => (
            <span
              key={k}
              className="chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                border: "1px solid var(--border)",
                borderRadius: 999,
              }}
            >
              {k}
              <button onClick={() => removeKategori(k)} className="mini-btn" title="Hapus" aria-label={`Hapus ${k}`}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="Tambah kategori baru" value={newKategori} onChange={(e) => setNewKategori(e.target.value)} />
          <Button onClick={addKategori}>Tambah</Button>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 12 }}>
        <div className="section-title">Tandai sebagai “Ingin”</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {kategoriList.map((k) => (
            <label
              key={k}
              className="chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                border: "1px solid var(--border)",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              <input type="checkbox" checked={ingin.includes(k)} onChange={() => toggleIngin(k)} />
              {k}
            </label>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <Button onClick={() => onSaveCategories?.(ingin)}>Simpan Kategori Ingin</Button>
        </div>
      </section>

      {/* NEW: Pengingat Harian */}
      <section className="card" style={{ marginBottom: 12 }}>
        <div className="section-title">Pengingat Harian</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={reminderEnabled} onChange={(e) => onToggleReminder?.(e.target.checked)} />
            Aktifkan pengingat
          </label>
          <input type="time" className="input" style={{ width: 160 }} value={reminderTime} onChange={(e) => onChangeReminderTime?.(e.target.value)} />
          <div style={{ opacity: 0.7 }}>Muncul sebagai in-app reminder sekitar jam tersebut.</div>
        </div>
      </section>
    </div>
  );
}
