"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { getAuthUser } from '@/lib/auth';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totaleUtenti: 0,
    totaleProdotti: 0,
    valoreInventario: 0,
    ultimiMovimenti: [],
    prodottiPerCategoria: [],
  });
  
  const [loading, setLoading] = useState(true);
  
  // Otteniamo l'utente
  const user = getAuthUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error("Errore dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid py-5 px-4">
        <div className="row mb-4">
          <div className="col-12">
            {/* Aggiunto user?.name per evitare crash se l'utente non è subito disponibile */}
            <h1 className="h3 mb-1 text-gray-800 fw-bold">Benvenuto, {user?.name || 'Utente'} 👋</h1>
            <p className="text-muted small mb-0">Ecco lo stato generale del magazzino.</p>
          </div>
        </div>

        {/* RIGA 1: Card Statistiche */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-primary border-4 h-100">
              <div className="card-body">
                <small className="text-uppercase text-muted fw-bold">Utenti Attivi</small>
                <div className="h2 mb-0 fw-bold text-dark">{stats.totaleUtenti}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-info border-4 h-100">
              <div className="card-body">
                <small className="text-uppercase text-muted fw-bold">Prodotti a Catalogo</small>
                <div className="h2 mb-0 fw-bold text-dark">{stats.totaleProdotti}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-success border-4 h-100">
              <div className="card-body">
                <small className="text-uppercase text-muted fw-bold">Valore Inventario</small>
                {/* Formattazione valuta con 2 decimali fissi */}
                <div className="h2 mb-0 text-success fw-bold">
                  € {stats.valoreInventario?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Tabella Movimenti (Allargata a col-lg-8 per far spazio all'esecutore) */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-2 fw-bold text-gray-800">
                <i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i>Ultimi Movimenti
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small text-uppercase">
                    <tr>
                      <th className="ps-4">Data e Ora</th>
                      <th>Prodotto</th>
                      <th className="text-center">Tipo</th>
                      <th className="text-center">Q.tà</th>
                      {/* NUOVA COLONNA ESECUTORE */}
                      <th className="text-center pe-4">Esecutore</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.ultimiMovimenti.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-5 text-muted">Nessun movimento recente registrato.</td></tr>
                    ) : (
                      stats.ultimiMovimenti.map((mov, i) => (
                        <tr key={i}>
                          <td className="ps-4 text-muted small">
                            {new Date(mov.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="fw-bold text-dark">{mov.product_name}</td>
                          <td className="text-center">
                            <span className={`badge rounded-pill px-3 ${mov.tipo?.toLowerCase() === 'carico' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}`}>
                              <i className={`fa-solid ${mov.tipo?.toLowerCase() === 'carico' ? 'fa-arrow-down' : 'fa-arrow-up'} me-1`}></i>
                              {mov.tipo?.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-center fw-medium text-dark">{mov.quantita}</td>
                          
                          {/* DATO ESECUTORE */}
                          <td className="text-center pe-4">
                            <span className="badge bg-light text-dark border fw-normal shadow-sm">
                              <i className="fa-solid fa-user-tag me-1 text-primary small"></i>
                              {mov.executor_name || 'N/D'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Grafico Categorie */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-2 fw-bold text-gray-800">
                <i className="fa-solid fa-chart-pie me-2 text-info"></i>Suddivisione Categorie
              </div>
              <div className="card-body">
                {stats.prodottiPerCategoria.length === 0 ? (
                  <div className="text-center text-muted py-5">Nessun dato categoria disponibile.</div>
                ) : (
                  stats.prodottiPerCategoria.map((cat, i) => {
                    // Prevenzione divisione per zero
                    const percentage = stats.totaleProdotti > 0 ? ((cat.quantita / stats.totaleProdotti) * 100).toFixed(1) : 0;
                    return (
                      <div key={i} className="mb-4">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="text-secondary fw-medium">{cat.nome}</span>
                          <span className="fw-bold text-dark">
                            {cat.quantita} <span className="text-muted fw-normal ms-1">({percentage}%)</span>
                          </span>
                        </div>
                        <div className="progress shadow-sm" style={{height: '8px'}}>
                          <div className="progress-bar bg-primary opacity-75" style={{width: `${percentage}%`}}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}