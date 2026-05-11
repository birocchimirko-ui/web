"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function StoricoMovimenti() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState(''); // '' (tutti), 'carico', 'scarico'

  const fetchMovements = async () => {
    try {
      setLoading(true);
      // Chiamata alla nuova rotta che hai aggiunto
      const response = await api.get('/stock_movements', { 
        params: { tipo: filtroTipo } 
      });
      setMovements(response.data);
    } catch (err) {
      console.error("Errore nel caricamento dei movimenti:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stock_movements', { 
          params: { tipo: filtroTipo } 
        });
        setMovements(response.data);
      } catch (err) {
        console.error("Errore nel caricamento dei movimenti:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [filtroTipo]);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-5 px-4">
        
        {/* Header Pagina */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1 text-gray-800 fw-bold">📜 Storico Movimenti</h1>
            <p className="text-muted small mb-0">Registro cronologico di tutte le operazioni di magazzino</p>
          </div>
          <Link href="/inventario" className="btn btn-outline-primary shadow-sm">
            <i className="fa-solid fa-boxes-stacked me-2"></i>Torna all&apos;Inventario
          </Link>
        </div>

        {/* Barra Filtri Rapidi */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-2">
            <div className="d-flex align-items-center gap-3">
              <span className="small fw-bold text-muted text-uppercase">Filtra per:</span>
              <div className="btn-group shadow-sm">
                <button 
                  className={`btn btn-sm ${filtroTipo === '' ? 'btn-primary' : 'btn-white border'}`}
                  onClick={() => setFiltroTipo('')}
                >Tutti</button>
                <button 
                  className={`btn btn-sm ${filtroTipo === 'carico' ? 'btn-success' : 'btn-white border'}`}
                  onClick={() => setFiltroTipo('carico')}
                ><i className="fa-solid fa-arrow-down me-1"></i>Carichi</button>
                <button 
                  className={`btn btn-sm ${filtroTipo === 'scarico' ? 'btn-danger' : 'btn-white border'}`}
                  onClick={() => setFiltroTipo('scarico')}
                ><i className="fa-solid fa-arrow-up me-1"></i>Scarichi</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Movimenti */}
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="ps-4">Data e Ora</th>
                  <th>Prodotto</th>
                  <th className="text-center">Tipo</th>
                  <th className="text-center">Quantità</th>
                  <th className="text-center">Operatore</th>
                  <th className="pe-4">Note / Causale</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary me-2"></div>Caricamento...</td></tr>
                ) : movements.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">Nessun movimento registrato</td></tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id}>
                      <td className="ps-4">
                        <div className="fw-medium text-dark">
                          {new Date(m.data).toLocaleDateString('it-IT')}
                        </div>
                        <div className="text-muted small">
                          {new Date(m.data).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">{m.prodotto}</span>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill px-3 ${m.tipo === 'carico' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}`}>
                          {m.tipo === 'carico' ? 'ENTRATA' : 'USCITA'}
                        </span>
                      </td>
                      <td className="text-center fw-bold h5 mb-0">
                        {m.tipo === 'carico' ? '+' : '-'}{m.quantita}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-white text-dark border fw-normal shadow-sm">
                          <i className="fa-solid fa-user-gear me-1 text-secondary"></i>
                          {m.operatore}
                        </span>
                      </td>
                      <td className="pe-4 text-muted small">
                        {m.note || <em className="opacity-50">Nessuna nota</em>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}