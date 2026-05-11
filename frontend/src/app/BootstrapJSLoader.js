"use client";

import { useEffect } from "react";

export default function BootstrapJSLoader() {
  useEffect(() => {
    // Carichiamo il JS di Bootstrap Italia solo quando il browser è pronto
    import("bootstrap-italia/dist/js/bootstrap-italia.bundle.min.js")
      .then(() => {
        console.log("Bootstrap Italia JS caricato correttamente");
      })
      .catch((err) => console.error("Errore nel caricamento del JS:", err));
  }, []);

  return null; // Questo componente non disegna nulla, serve solo a caricare il JS
}