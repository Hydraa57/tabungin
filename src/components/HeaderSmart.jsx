import React, { useEffect, useState } from "react";
import { Sun, Moon, LogOut } from "lucide-react";

export default function HeaderSmart({ theme = "dark", onToggleTheme, onSignOut }) {
  const [compact, setCompact] = useState(false);
  const [anim, setAnim] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        <div className="smart-title" aria-label="Dashboard Keuangan">
          <span className="line1">Dashboard</span>
          <span className="line2">Keuangan</span>
        </div>
        <div className="smart-right">
          <button className={`icon-btn ${anim ? "icon-anim" : ""}`} onClick={handleToggle} aria-label="Toggle Tema" title="Toggle Tema">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="icon-btn" onClick={onSignOut} aria-label="Keluar" title="Keluar">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
