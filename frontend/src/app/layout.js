import { Titillium_Web } from "next/font/google";
import "bootstrap-italia/dist/css/bootstrap-italia.min.css";
import BootstrapJSLoader from "./BootstrapJSLoader"; // Creeremo questo file tra un secondo

// Configurazione ottimizzata del font (Risolve l'errore font-display)
const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap", // "swap" è lo standard consigliato per evitare testi invisibili
});

export const metadata = {
  title: "Gestione Magazzino - Progetto Erasmus",
  description: "Interfaccia basata su Bootstrap Italia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={titillium.className}>
        {/* Questo componente caricherà il JS di Bootstrap solo sul client */}
        <BootstrapJSLoader />
        {children}
      </body>
    </html>
  );
}
