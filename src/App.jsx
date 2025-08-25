// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import Joyride, { STATUS } from "react-joyride";

import CardSaldo from "./components/CardSaldo.jsx";
import GrafikKategori from "./components/GrafikKategori.jsx";
import GrafikTrenHarian from "./components/GrafikTrenHarian.jsx";
import GrafikMingguan from "./components/GrafikMingguan.jsx";
import TableTransaksi from "./components/TableTransaksi.jsx";
import Button from "./components/ui/button.jsx";
import Settings from "./components/Settings.jsx";
import NetworkBanner from "./components/NetworkBanner.jsx";
import CategoryChips from "./components/CategoryChips.jsx";
import A2HSBanner from "./components/A2HSBanner.jsx";
import ReminderBanner from "./components/ReminderBanner.jsx";
import UpdateBanner from "./components/UpdateBanner.jsx";

import { SlidersHorizontal, RotateCcw, Sun, Moon, LogOut, FileDown, Search } from "lucide-react";
import { exportToExcel } from "./utils/exportExcel.js";
import { onlyDigits, formatID, rupiah } from "./utils/numberFormat.js";

import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { subTransactions, addTransaction, updateTransaction, removeTransaction, getSettings, setSettings } from "./services/db";
import { queue } from "./services/offlineQueue.js";
import logoHeader from "./assets/logo-header.png";

const defaultKategori = ["Makanan", "Minuman", "Transportasi", "Hiburan", "Belanja", "Lain-lain", "Jajan", "Clothing & Etc", "Kebutuhan Motor", "Kebutuhan Rumah", "Kebutuhan Kucing", "Skincare & Bodycare", "Buah"];

function HeaderSmart({ theme = "dark", onToggleTheme, onSignOut, displayName }) {
  const [compact, setCompact] = useState(false);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    const on = () => setCompact(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-header", compact ? "compact" : "expanded");
  }, [compact]);

  const handleToggle = () => {
    setAnim(true);
    onToggleTheme?.();
    setTimeout(() => setAnim(false), 320);
  };

  return (
    <header className={`smart-header ${compact ? "is-compact" : ""}`}>
      <div className="smart-inner">
        <div className="smart-title">
          <img src={logoHeader} alt="Logo" className="smart-logo" />
          <div className="title-wrap">
            <span className="line1">Dashboard</span>
            <span className="line2">Keuangan</span>
          </div>
          <span className="subtitle">{displayName ? `Halo, ${displayName} 👋` : "Kelola pengeluaran & pemasukan harian"}</span>
        </div>
        <div className="smart-right">
          <button data-tour="toggle-theme" className={`icon-btn ${anim ? "icon-anim" : ""}`} onClick={handleToggle} title="Toggle Tema">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button data-tour="logout" className="icon-btn" onClick={onSignOut} title="Keluar">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App({ user }) {
  const safeLS = typeof window !== "undefined" ? window.localStorage : null;

  // THEME
  const [theme, setTheme] = useState(() => safeLS?.getItem("theme") || "dark");
  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    try {
      safeLS?.setItem("theme", theme);
    } catch {}
  }, [theme]);
  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.body.classList.add("theme-fading");
      setTimeout(() => document.body.classList.remove("theme-fading"), 300);
      return next;
    });
  };

  // DATA & SETTINGS
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [kategoriList, setKategoriList] = useState(() => {
    const s = safeLS?.getItem("kategoriList");
    return s ? JSON.parse(s) : defaultKategori;
  });
  const [saldoAwal, setSaldoAwal] = useState(0);

  useEffect(() => {
    if (!user) {
      setDataTransaksi(JSON.parse(safeLS?.getItem("dataTransaksi") || "[]"));
      setSaldoAwal(parseInt(safeLS?.getItem("saldoAwal") || "0", 10));
      return;
    }
    (async () => {
      const s = await getSettings(user.uid);
      setSaldoAwal(s?.saldoAwal ?? 0);
    })();
    const unsub = subTransactions(user.uid, setDataTransaksi, console.error);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) safeLS?.setItem("dataTransaksi", JSON.stringify(dataTransaksi));
  }, [user, dataTransaksi]);
  useEffect(() => {
    if (!user) safeLS?.setItem("saldoAwal", String(saldoAwal));
    else setSettings(user.uid, { saldoAwal }).catch(console.error);
  }, [user, saldoAwal]);
  useEffect(() => {
    safeLS?.setItem("kategoriList", JSON.stringify(kategoriList));
  }, [kategoriList]);

  // offline queue flush
  useEffect(() => {
    const flush = async () => {
      if (!user) return;
      const pend = queue.all();
      if (!pend.length) return;
      for (const p of pend) await addTransaction(user.uid, p);
      queue.clear();
    };
    flush();
  }, [user]);

  // FILTERS & FORM
  const [filterTipe, setFilterTipe] = useState("Semua");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const resetFilters = () => {
    setTanggalDari("");
    setTanggalSampai("");
    setFilterTipe("Semua");
    setSearchKeyword("");
  };

  const [formInput, setFormInput] = useState({
    tipe: "Pengeluaran",
    tanggal: "",
    kategori: defaultKategori[0],
    prioritas: "Butuh",
    jumlah: "",
    deskripsi: "",
  });
  const pickKategori = (k) => setFormInput((f) => ({ ...f, kategori: k }));

  const tambahTransaksi = async (e) => {
    e.preventDefault();
    const { tipe, tanggal, kategori, prioritas, jumlah, deskripsi } = formInput;
    const j = parseInt(onlyDigits(jumlah) || "0", 10);
    if (!tanggal || !j || !deskripsi) return;

    const payload = {
      tanggal,
      kategori: tipe === "Pemasukan" ? "—" : kategori,
      prioritas: tipe === "Pemasukan" ? "—" : prioritas,
      jumlah: j,
      deskripsi,
      tipe,
    };

    if (user) {
      await addTransaction(user.uid, payload);
    } else {
      queue.add(payload);
      setDataTransaksi((prev) => {
        const u = [...prev, payload];
        safeLS?.setItem("dataTransaksi", JSON.stringify(u));
        return u;
      });
    }
    setFormInput({
      tipe: "Pengeluaran",
      tanggal: "",
      kategori: kategoriList[0] || "Makanan",
      prioritas: "Butuh",
      jumlah: "",
      deskripsi: "",
    });
  };

  // EDIT / DELETE
  const [editing, setEditing] = useState(null);
  const startEdit = (row) => setEditing({ ...row });
  const cancelEdit = () => setEditing(null);
  const saveEdit = async () => {
    const data = { ...editing, jumlah: parseInt(onlyDigits(editing.jumlah) || "0", 10) };
    if (user && editing.id) await updateTransaction(user.uid, editing.id, data);
    else {
      const updated = dataTransaksi.map((t, i) => (i === editing._idx ? data : t));
      setDataTransaksi(updated);
      safeLS?.setItem("dataTransaksi", JSON.stringify(updated));
    }
    setEditing(null);
  };
  const deleteRow = async (row) => {
    if (user && row.id) await removeTransaction(user.uid, row.id);
    else {
      const updated = dataTransaksi.filter((_, i) => i !== row._idx);
      setDataTransaksi(updated);
      safeLS?.setItem("dataTransaksi", JSON.stringify(updated));
    }
  };

  // Reminder (sudah ada sebelumnya)
  const [reminderEnabled, setReminderEnabled] = useState(() => (safeLS?.getItem("reminderEnabled") ?? "1") === "1");
  const [reminderTime, setReminderTime] = useState(() => safeLS?.getItem("reminderTime") || "20:00");
  useEffect(() => {
    safeLS?.setItem("reminderEnabled", reminderEnabled ? "1" : "0");
  }, [reminderEnabled]);
  useEffect(() => {
    safeLS?.setItem("reminderTime", reminderTime);
  }, [reminderTime]);

  const [showReminder, setShowReminder] = useState(false);
  useEffect(() => {
    if (!reminderEnabled) return;
    const [hStr, mStr] = (reminderTime || "20:00").split(":");
    const H = parseInt(hStr || "20", 10);
    const M = parseInt(mStr || "0", 10);
    const key = "reminder_shown_date";
    const tick = () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const last = safeLS?.getItem(key);
      if (now.getHours() === H && Math.abs(now.getMinutes() - M) <= 2 && last !== today) {
        setShowReminder(true);
        safeLS?.setItem(key, today);
      }
    };
    const id = setInterval(tick, 30000);
    tick();
    return () => clearInterval(id);
  }, [reminderEnabled, reminderTime]);

  // DERIVED
  const transaksiTersaring = useMemo(
    () =>
      dataTransaksi
        .map((t, idx) => ({ ...t, _idx: idx }))
        .filter((t) => {
          const d = new Date(t.tanggal + "T00:00:00");
          const f = tanggalDari ? new Date(tanggalDari + "T00:00:00") : null;
          const to = tanggalSampai ? new Date(tanggalSampai + "T00:00:00") : null;
          const byDate = (!f || d >= f) && (!to || d <= to);
          const byType = filterTipe === "Semua" ? true : t.tipe === filterTipe;
          const kw = searchKeyword.trim().toLowerCase();
          const bySearch = !kw || t.deskripsi?.toLowerCase().includes(kw) || t.kategori?.toLowerCase().includes(kw);
          return byDate && byType && bySearch;
        }),
    [dataTransaksi, tanggalDari, tanggalSampai, filterTipe, searchKeyword]
  );

  const totalOut = useMemo(() => transaksiTersaring.filter((t) => t.tipe === "Pengeluaran").reduce((a, b) => a + b.jumlah, 0), [transaksiTersaring]);
  const totalIn = useMemo(() => transaksiTersaring.filter((t) => t.tipe === "Pemasukan").reduce((a, b) => a + b.jumlah, 0), [transaksiTersaring]);
  const saldoTerkini = useMemo(() => saldoAwal + totalIn - totalOut, [saldoAwal, totalIn, totalOut]);
  const displayName = auth?.currentUser?.displayName || "";

  // Limit & kategori Ingin (tetap)
  const [limitIngin, setLimitIngin] = useState(() => parseInt(safeLS?.getItem("limitIngin") || "500000", 10));
  const [inginCategories, setInginCategories] = useState(() => {
    const s = safeLS?.getItem("inginCategories");
    return s ? JSON.parse(s) : ["Jajan", "Minuman", "Hiburan", "Belanja", "Buah"];
  });
  useEffect(() => safeLS?.setItem("limitIngin", String(limitIngin)), [limitIngin]);
  useEffect(() => safeLS?.setItem("inginCategories", JSON.stringify(inginCategories)), [inginCategories]);
  const totalIngin = useMemo(() => transaksiTersaring.filter((t) => t.tipe === "Pengeluaran" && inginCategories.includes(t.kategori)).reduce((a, b) => a + b.jumlah, 0), [transaksiTersaring, inginCategories]);

  // SETTINGS modal lock
  const [openSettings, setOpenSettings] = useState(false);
  useEffect(() => {
    if (openSettings) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [openSettings]);

  /* =========== Logout Confirm Modal =========== */
  const [confirmLogout, setConfirmLogout] = useState(false);
  const handleRequestLogout = () => setConfirmLogout(true);
  const doLogout = async () => {
    setConfirmLogout(false);
    await signOut(auth);
  };

  /* =========== Joyride (Onboarding Tour) =========== */
  const [runTour, setRunTour] = useState(() => (safeLS?.getItem("tour_done") === "1" ? false : true));
  const steps = [
    {
      target: '[data-tour="toggle-theme"]',
      title: "Ubah Tema",
      content: "Klik di sini untuk mengganti Dark/Light mode.",
      disableBeacon: true,
      placement: "left",
    },
    {
      target: '[data-tour="btn-settings"]',
      title: "Pengaturan",
      content: "Buka pengaturan: batas 'Ingin', kategori, dan pengingat harian.",
      placement: "bottom",
    },
    {
      target: '[data-tour="form-add"]',
      title: "Tambah Transaksi",
      content: "Isi tipe, tanggal, kategori/prioritas, jumlah & deskripsi lalu klik Tambah.",
      placement: "top",
    },
    {
      target: '[data-tour="filter-search"]',
      title: "Filter & Cari",
      content: "Filter tanggal/tipe dan cari deskripsi/kategori di sini.",
      placement: "bottom",
    },
    {
      target: '[data-tour="table"]',
      title: "Edit Cepat",
      content: "Di HP, geser kiri untuk Edit/Hapus transaksi. Di desktop, pakai tombol di kolom Aksi.",
      placement: "top",
    },
  ];
  const onTourCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      try {
        safeLS?.setItem("tour_done", "1");
      } catch {}
    }
  };

  return (
    <>
      {/* Joyride */}
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            zIndex: 1500,
            primaryColor: "#4ea1ff",
            textColor: "var(--text)",
            backgroundColor: "var(--card)",
          },
          tooltipContainer: { textAlign: "left" },
        }}
        callback={onTourCallback}
      />

      <UpdateBanner />
      <A2HSBanner />
      {showReminder && (
        <ReminderBanner
          onClose={() => setShowReminder(false)}
          message="Sudah catat transaksi hari ini?"
          cta="Tambah sekarang"
          onCta={() => {
            setShowReminder(false);
            document.querySelector("#form-transaksi")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      )}

      <HeaderSmart theme={theme} onToggleTheme={handleToggleTheme} onSignOut={handleRequestLogout} displayName={displayName} />
      <NetworkBanner />

      {/* --- STYLE (potongan penting tetap sama, dipersingkat) --- */}
      <style>{`
        :root{ --safe-top: env(safe-area-inset-top,0px); --hdr-h-expanded:92px; --hdr-h-compact:56px; }
        .container{ padding-top: calc(var(--safe-top) + var(--hdr-h-expanded)) !important; }
        :root[data-header="compact"] .container{ padding-top: calc(var(--safe-top) + var(--hdr-h-compact)) !important; }
        body.no-scroll{ overflow:hidden; }

        .smart-header{ position:fixed; top:0; left:0; right:0; z-index:1000; padding-top:var(--safe-top); padding-bottom:4px;
          height: calc(var(--safe-top) + var(--hdr-h-expanded));
          background: radial-gradient(1200px 240px at -10% -50%, color-mix(in hsl, var(--primary,#4ea1ff) 18%, transparent) 0%, transparent 50%),
                      color-mix(in hsl, var(--card, #0b1220) 96%, transparent);
          border-bottom:1px solid rgba(125,125,125,.10); box-shadow:0 4px 18px rgba(0,0,0,.06);
        }
        .smart-header.is-compact{ padding-bottom:2px; height: calc(var(--safe-top) + var(--hdr-h-compact)); background: color-mix(in hsl, var(--card, #0b1220) 98%, transparent); }
        .smart-inner{ max-width:1100px; margin:0 auto; height:calc(100% - var(--safe-top)); display:flex; align-items:center; justify-content:space-between; padding:0 16px; gap:8px; }
        .smart-title{ display:flex; align-items:center; gap:6px; }
        .smart-logo{ width:28px; height:28px; object-fit:contain; flex-shrink:0; filter: invert(1); }
        body.light .smart-logo{ filter: invert(0); }
        .title-wrap{ display:grid; line-height:1.06; font-weight:900; letter-spacing:.2px; }
        .subtitle{ font-size:12px; color:var(--muted); margin-left:6px; }
        .smart-right{ display:inline-flex; gap:8px; align-items:center; }
        .icon-btn{ width:34px; height:34px; display:grid; place-items:center; border-radius:10px; border:1px solid var(--border);
          background: color-mix(in hsl, var(--card,#0b1220) 90%, transparent); color: var(--text); }

        .kpi{ display:grid; gap:10px; grid-template-columns:1fr; margin-bottom:12px; }
        @media(min-width:760px){ .kpi{ grid-template-columns:repeat(3,1fr); } }
        .card{ background:var(--card); border:1px solid var(--border); border-radius:14px; padding:12px; margin-bottom:12px; }
        .grid.grid-3{ display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:8px; }
        @media(max-width:680px){ .grid.grid-3{ grid-template-columns:1fr; } }
        .input,.select{ width:100%; padding:10px 12px; border-radius:12px; border:1px solid var(--border);
          background:var(--surface,#0f1729); color:var(--text,#eaf0ff); }
        body.light .input, body.light .select{ background:#fff; color:#0b1220; }

        /* Modal confirm */
        .modal-backdrop{ position: fixed; inset: 0; z-index: 1200; background: color-mix(in hsl, #000 55%, transparent); display: grid; place-items: center; padding: 16px; }
        .modal{ background: var(--card); color: var(--text); width: min(420px, 92vw); border: 1px solid var(--border); border-radius: 14px; overflow:hidden; }
        .modal .hd{ padding: 12px 14px; font-weight: 800; border-bottom:1px solid var(--border); }
        .modal .bd{ padding: 14px; }
        .modal .ft{ padding: 10px 14px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:8px; }
      `}</style>

      <div className="container">
        <div className="actions-row dashboard-actions">
          <Button data-tour="btn-settings" variant="ghost" onClick={() => setOpenSettings(true)}>
            <SlidersHorizontal size={16} /> Pengaturan
          </Button>
          <Button variant="ghost" onClick={() => exportToExcel(transaksiTersaring, `Transaksi_${Date.now()}.csv`)}>
            <FileDown size={16} /> Excel
          </Button>
        </div>

        {/* KPI */}
        <div className="kpi">
          <div className="item card">
            <div className="label">Sisa Saldo Bulan Lalu</div>
            <div>Rp{rupiah(saldoAwal)}</div>
          </div>
          <div className="item card">
            <div className="label">Total Pemasukan (filter)</div>
            <div>Rp{rupiah(totalIn)}</div>
          </div>
          <div className="item card">
            <div className="label">Total Pengeluaran (filter)</div>
            <div>Rp{rupiah(totalOut)}</div>
          </div>
        </div>

        {/* Form Tambah */}
        <div className="card" data-tour="form-add">
          <div className="section-title">➕ Tambah Transaksi</div>
          <form id="form-transaksi" onSubmit={tambahTransaksi} className="grid grid-3">
            <select className="select" value={formInput.tipe} onChange={(e) => setFormInput({ ...formInput, tipe: e.target.value })}>
              <option value="Pengeluaran">Pengeluaran</option>
              <option value="Pemasukan">Pemasukan</option>
            </select>
            <input type="date" className="input" value={formInput.tanggal} onChange={(e) => setFormInput({ ...formInput, tanggal: e.target.value })} />
            {formInput.tipe === "Pengeluaran" && (
              <select className="select" value={formInput.kategori} onChange={(e) => setFormInput({ ...formInput, kategori: e.target.value })}>
                {kategoriList.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            )}
            {formInput.tipe === "Pengeluaran" && (
              <select className="select" value={formInput.prioritas} onChange={(e) => setFormInput({ ...formInput, prioritas: e.target.value })}>
                <option value="Wajib">Wajib</option>
                <option value="Butuh">Butuh</option>
                <option value="Ingin">Ingin</option>
              </select>
            )}
            <input type="text" inputMode="numeric" className="input" placeholder="Jumlah (Rp)" value={formatID(formInput.jumlah)} onChange={(e) => setFormInput({ ...formInput, jumlah: onlyDigits(e.target.value) })} />
            <input type="text" className="input" placeholder="Deskripsi" value={formInput.deskripsi} onChange={(e) => setFormInput({ ...formInput, deskripsi: e.target.value })} />
            <Button type="submit">Tambah</Button>
          </form>
          <CategoryChips transaksi={dataTransaksi} onPick={pickKategori} fallback={kategoriList} />
        </div>

        {/* Filter */}
        <div className="card">
          <div className="section-title">📅 Filter</div>
          <div className="row" data-tour="filter-search" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <input type="date" className="input" value={tanggalDari} onChange={(e) => setTanggalDari(e.target.value)} />
            <span className="small" style={{ alignSelf: "center" }}>
              s.d.
            </span>
            <input type="date" className="input" value={tanggalSampai} onChange={(e) => setTanggalSampai(e.target.value)} />
            <select className="select" value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}>
              <option value="Semua">Semua</option>
              <option value="Pengeluaran">Pengeluaran</option>
              <option value="Pemasukan">Pemasukan</option>
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              <div className="searchbox" style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 10, top: 10, opacity: 0.7 }} />
                <input className="input" placeholder="Cari deskripsi/kategori…" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} style={{ paddingLeft: 32, width: 220 }} />
              </div>
              <Button variant="ghost" onClick={resetFilters}>
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Tabel / Mobile list */}
        <div data-tour="table">
          <TableTransaksi transaksi={transaksiTersaring} onEdit={setEditing} onDelete={deleteRow} enableSwipe />
        </div>

        <GrafikKategori transaksi={transaksiTersaring} />
        <GrafikTrenHarian transaksi={transaksiTersaring} />
        <GrafikMingguan transaksi={transaksiTersaring} />

        {/* Edit Modal */}
        {editing && (
          <div className="modal-backdrop" onClick={cancelEdit}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="hd">✏️ Edit Transaksi</div>
              <div className="bd" style={{ display: "grid", gap: 8 }}>
                <select className="select" value={editing.tipe} onChange={(e) => setEditing({ ...editing, tipe: e.target.value })}>
                  <option value="Pengeluaran">Pengeluaran</option>
                  <option value="Pemasukan">Pemasukan</option>
                </select>
                <input type="date" className="input" value={editing.tanggal} onChange={(e) => setEditing({ ...editing, tanggal: e.target.value })} />
                {editing.tipe === "Pengeluaran" && <input className="input" value={editing.kategori} onChange={(e) => setEditing({ ...editing, kategori: e.target.value })} placeholder="Kategori" />}
                {editing.tipe === "Pengeluaran" && (
                  <select className="select" value={editing.prioritas || "Butuh"} onChange={(e) => setEditing({ ...editing, prioritas: e.target.value })}>
                    <option value="Wajib">Wajib</option>
                    <option value="Butuh">Butuh</option>
                    <option value="Ingin">Ingin</option>
                  </select>
                )}
                <input type="text" inputMode="numeric" className="input" value={formatID(String(editing.jumlah ?? ""))} onChange={(e) => setEditing({ ...editing, jumlah: onlyDigits(e.target.value) })} />
                <input className="input" value={editing.deskripsi} onChange={(e) => setEditing({ ...editing, deskripsi: e.target.value })} />
              </div>
              <div className="ft">
                <Button onClick={saveEdit}>Simpan</Button>
                <Button variant="ghost" onClick={cancelEdit}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal (punya kamu sebelumnya, tetap) */}
        {openSettings && (
          <div className="modal-backdrop" onClick={() => setOpenSettings(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="hd">Pengaturan</div>
              <div className="bd" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <Settings
                  open={true}
                  onClose={() => setOpenSettings(false)}
                  defaultLimit={limitIngin}
                  onSave={(n) => setLimitIngin(n)}
                  inginCategories={inginCategories}
                  onSaveCategories={(arr) => setInginCategories(arr)}
                  kategoriList={kategoriList}
                  onSaveKategoriList={(arr) => setKategoriList(arr)}
                  reminderEnabled={reminderEnabled}
                  onToggleReminder={setReminderEnabled}
                  reminderTime={reminderTime}
                  onChangeReminderTime={setReminderTime}
                />
              </div>
              <div className="ft">
                <Button variant="ghost" onClick={() => setOpenSettings(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Logout Modal */}
        {confirmLogout && (
          <div className="modal-backdrop" onClick={() => setConfirmLogout(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="hd">Konfirmasi</div>
              <div className="bd">Kamu yakin ingin keluar?</div>
              <div className="ft">
                <Button onClick={doLogout}>Ya</Button>
                <Button variant="ghost" onClick={() => setConfirmLogout(false)}>
                  Tidak
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
