"use client";
import { useRouter } from 'next/navigation';
import { getAuthUser } from '@/lib/auth'; // Importiamo la logica centralizzata
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  
  // Utilizziamo l'helper per ottenere i dati dell'utente
  const user = getAuthUser();

  const handleLogout = () => {
    // Pulizia totale dei cookie
    Cookies.remove('token');
    Cookies.remove('userName');
    Cookies.remove('userRole');
    router.push('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        {/* Logo / Titolo */}
        <Link href="/dashboard" className="navbar-brand font-weight-bold d-flex align-items-center">
          <span className="me-2">📦</span> Magazzino Erasmus
        </Link>
        
        {/* Toggle per Mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* Link comuni a tutti */}
            <li className="nav-item">
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link href="/inventario" className="nav-link">Gestione Inventario</Link>
            </li>
            
            {/* TRASFORMAZIONE: Se è Admin, aggiungiamo la voce extra */}
            {user.isAdmin && (
              <li className="nav-item">
                <Link href="/admin/utenti" className="nav-link text-warning fw-bold">
                  <i className="fa-solid fa-user-shield me-1"></i> Gestione Utenti (Admin)
                </Link>
              </li>
            )}
          </ul>

          {/* Area Utente e Logout */}
          <div className="d-flex align-items-center border-start ps-lg-3 ms-lg-3 mt-3 mt-lg-0 border-light-subtle">
             <div className="text-white me-3 d-flex flex-column text-end">
               <span className="small opacity-75" style={{ fontSize: '0.75rem' }}>
                 {user?.role?.toUpperCase() || 'RUOLO'}
               </span>
               <span className="fw-bold">
                 <i className="fa-solid fa-user me-2"></i>{user?.name || 'Utente'}
               </span>
             </div>
             
             <button 
               onClick={handleLogout} 
               className="btn btn-outline-light btn-sm px-3 rounded-pill"
             >
               Esci
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
}