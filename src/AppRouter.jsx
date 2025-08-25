// src/AppRouter.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import App from "./App.jsx";
import Auth from "./pages/Auth.jsx";

function Routed() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) {
    // kecilkan kemungkinan “blank”: tampilkan loader ringan
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          color: "var(--muted)",
        }}
      >
        Memuat…
      </div>
    );
  }

  // Kunci animasi ke pathname supaya tiap pindah route nge-fade
  return (
    <div key={loc.pathname} className="page-frame">
      <Routes>
        <Route path="/login" element={<Auth onSignedIn={() => (window.location.href = "/")} />} />
        <Route path="/*" element={user ? <App user={user} /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routed />
    </BrowserRouter>
  );
}
