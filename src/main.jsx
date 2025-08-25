// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./AppRouter.jsx";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(<AppRouter />);

// === Service Worker registration (PWA Update Banner) ===
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // ada SW baru & yang lama lagi aktif -> beri tahu UI
              window.dispatchEvent(new CustomEvent("swWaiting", { detail: { registration: reg } }));
            }
          });
        });
      })
      .catch(console.error);
  });
}
