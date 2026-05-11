"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { getAuthUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GestioneUtenti() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const router = useRouter();
  const auth = getAuthUser();

  // Funzione per formattare le date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchUsers = useCallback(async (signal = null) => {
    try {
      setLoading(true);
      const response = await api.get(`/users?search=${search}&page=${page}`, { signal });
      console.log("Dati ricevuti dal server:", response.data);
      // Struttura attesa: { users: [], meta: { total_pages: X } }
      if (response.data && response.data.users) {
        setUsers(response.data.users);
        setTotalPages(response.data.meta?.total_pages || 1);} 
      else {setUsers(Array.isArray(response.data) ? response.data : []);}}
      catch (err) {
        if (err.name !== 'AbortError') {console.error("Errore caricamento utenti:", err);}} finally {setLoading(false);}},
       [search, page]);

  useEffect(() => {
    if (!auth?.isAdmin) { router.push('/dashboard'); return; }
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchUsers(abortController.signal);
    }, 300);
    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [fetchUsers, auth?.isAdmin, router]);

  // Gestione cambio RUOLO
  const handleChangeRole = async (id, newRoleId) => {
    try {
      await api.patch(`/users/${id}`, { user: { role_id: newRoleId } });
      fetchUsers();
    } catch (err) { alert("Errore nel cambio ruolo"); }
  };

  // Gestione cambio STATO (Tendina)
  const handleChangeStatus = async (id, newStatus) => {
    try {
      // Inviamo il valore booleano al backend
      await api.patch(`/users/${id}`, { user: { stato_account: newStatus === 'true' } });
      fetchUsers();
    } catch (err) { alert("Errore nel cambio stato"); }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-5 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0 text-gray-800">🛠️ Gestione Utenti</h1>
          <Link href="/admin/utenti/nuovo" className="btn btn-primary shadow-sm px-4">
            <i className="fa-solid fa-user-plus me-2"></i>Nuovo Utente
          </Link>
        </div>

        {/* Barra di ricerca */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Cerca per username, nome o email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* Tabella Completa */}
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="ps-4">Username</th>
                  <th>Anagrafica</th>
                  <th>Email</th>
                  <th>Ruolo</th>
                  <th>Data Nascita</th>
                  <th>Ultimo Login</th>
                  <th>Stato Account</th>
                  <th className="text-end pe-4">Azioni</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-5">Caricamento...</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className={!u.stato_account ? "table-light opacity-75" : ""}>
                    <td className="ps-4 fw-bold text-primary">{u.username}</td>
                    <td>{u.nome} {u.cognome}</td>
                    <td>{u.email}</td>
                    <td>
                      <select 
                        className="form-select form-select-sm border-0 bg-light w-auto"
                        value={u.role_id}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      >
                        <option value="95a6e8e4-3fed-405a-8ced-975a8ee82e5d">Admin</option>
                        <option value="d4d87949-4e2b-4e29-a976-5037085b7fbf">Operatore</option>
                      </select>
                    </td>
                    <td>{u.data_di_nascita ? new Date(u.data_di_nascita).toLocaleDateString('it-IT') : "-"}</td>
                    <td className="text-muted">{u.ultimo_login ? formatDate(u.ultimo_login) : "Mai effettuato"}</td>
                    <td>
                      <select 
                        className={`form-select form-select-sm fw-bold w-auto ${u.stato_account ? 'text-success' : 'text-danger'}`}
                        value={u.stato_account}
                        onChange={(e) => handleChangeStatus(u.id, e.target.value)}
                      >
                        <option value="true">● Attivo</option>
                        <option value="false">○ Disattivato</option>
                      </select>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-light text-muted" title="Modifica dettagli">
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginazione */}
          <div className="card-footer bg-white border-0 py-3 d-flex justify-content-between align-items-center">
            <span className="text-muted small">Pagina <strong>{page}</strong> di {totalPages}</span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}>Precedente</button>
                </li>
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}>Successivo</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}