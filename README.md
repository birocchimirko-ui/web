# web
# sistema amministrativo per un magazzino - preogetto eramus
## tecnologie Utilizzate 
* **Backend:** Ruby on Rails 8.1 (API Mode)
* **Frontend:** Next.js 15
* **Database:** PostgreSQL (con estensione pgcrypto per UUID)
* **Autenticazione:** JWT (JSON Web Token)

## installazione e avvio
### Backend (Rails)
1. Entra nella cartella: `cd progetto_eramus`
2. Installa le gemme: `bundle install`
3. Configura il database: `rails db:create db:migrate db:seed`
4. Avvia il server: `rails s -p 3000`

###frontend (next.js)
1. Entra nella cartella: `cd frontend`
2. Installa i pacchetti: `npm install`
3. Avvia l'interfaccia: `npm run dev` (disponibile su http://localhost:3001)

## 🔐 Credenziali di Test (Admin)
* **Username:** `admin_test`
* **Password:** `Password_sicura1!`

## Funzionalità Principali
* **Dashboard:** Grafico prodotti per categoria, riepilogo movimenti, numero totale utenti e valore magazzino.
* **Sicurezza:** Blocco account dopo 5 tentativi falliti e log degli accessi.
* **Inventario:** tabella prodotti  con impaginazione dotata di filtri per la ricerca, con possibilità di modificare/eliminare i prodotti e pagina dedicata al lo storico novimenti di magazzino
* **Gestione Utenti:** pagina esclusiva per l'admin in cui può vedere, creare e bloccare gli utenti
