"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function GestioneInventario() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stati per Filtri e Paginazione
  const [tipo, setTipo] = useState(''); 
  const [search, setSearch] = useState(''); 
  const [sortBy, setSortBy] = useState('name');
  const [direction, setDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Funzione per caricare i prodotti (Backend -> Frontend)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: { tipo, search, sort_by: sortBy, direction, page }
      });
      
      if (response.data) {
        // Gestisce sia se l'API manda un array semplice che un oggetto con meta-dati
        const data = response.data.products || response.data;
        setProducts(data);
        setTotalPages(response.data.meta?.total_pages || 1);
      }
    } catch (err) {
      console.error("Errore nel caricamento prodotti:", err);
    } finally {
      setLoading(false);
    }
  }, [tipo, search, sortBy, direction, page]);

  // 2. Funzione per eliminare un prodotto (Aggiunta)
  const handleDelete = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo prodotto? Verranno eliminati anche tutti i movimenti associati nello storico.")) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
        // Ricarica la lista per mostrare i dati aggiornati
        fetchProducts(); 
      } catch (err) {
        alert("Errore durante l'eliminazione del prodotto.");
        console.error(err);
      }
    }
  };

  // 3. Effetto per il caricamento iniziale e Debounce sulla ricerca
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  // Helper per le etichette di spedizione/esito
  const getShippingBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'consegnato': return <span className="badge bg-success-subtle text-success border border-success-subtle px-3">Consegnato</span>;
      case 'transito': return <span className="badge bg-info-subtle text-info border border-info-subtle px-3">In Transito</span>;
      case 'problema': return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3">Problema</span>;
      default: return <span className="badge bg-light text-muted border px-3">In attesa</span>;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid py-5 px-4">
        
        {/* HEADER E PULSANTI AZIONE */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1 text-gray-800 fw-bold">📦 Inventario Magazzino</h1>
            <p className="text-muted small mb-0">Gestione scorte e tracciamento dei carichi/scarichi</p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/inventario/movimenti/nuovo" className="btn btn-outline-dark shadow-sm">
              <i className="fa-solid fa-right-left me-2"></i>Registra Movimento
            </Link>
            <Link href="/inventario/movimenti" className="btn btn-outline-secondary shadow-sm">
              <i className="fa-solid fa-clock-rotate-left me-2"></i>Vedi Storico
            </Link>
            <Link href="/inventario/nuovo" className="btn btn-primary shadow-sm px-4">
              <i className="fa-solid fa-plus me-2"></i>Nuovo Prodotto
            </Link>
          </div>
        </div>

        {/* BOX FILTRI */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label small fw-bold">Categoria</label>
                <select className="form-select" value={tipo} onChange={(e) => { setTipo(e.target.value); setPage(1); }}>
                  <option value="">Tutte</option>
                  <option value="Buste">Buste</option>
                  <option value="Carta">Carta</option>
                  <option value="Toner">Toner</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Cerca Prodotto</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Cerca per nome o marca..." 
                  value={search} 
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">Ordina per</label>
                <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="name">Nome</option>
                  <option value="quantity">Giacenza</option>
                  <option value="price">Prezzo</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold">Ordine</label>
                <select className="form-select" value={direction} onChange={(e) => setDirection(e.target.value)}>
                  <option value="asc">Crescente ↑</option>
                  <option value="desc">Decrescente ↓</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* TABELLA PRODOTTI */}
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th className="ps-4">Prodotto</th>
                  <th>Descrizione</th>
                  <th className="text-center">Giacenza</th>
                  <th className="text-center">Stato Notifica</th>
                  <th className="text-center text-primary">Ultimo Esecutore</th>
                  <th className="text-center">Prezzo Un.</th>
                  <th className="text-end pe-4">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5">Caricamento in corso...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">Nessun prodotto trovato in inventario</td></tr>
                ) : (
                  products.map((p) => {
                    const isLowStock = p.quantity <= p.min_threshold;
                    return (
                      <tr key={p.id} className={isLowStock ? "table-danger-light" : ""}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark">{p.name}</div>
                          <div className="text-muted" style={{fontSize: '0.75rem'}}>Soglia minima: {p.min_threshold}</div>
                        </td>
                        <td className="text-muted small">{p.description || "-"}</td>
                        <td className="text-center">
                          <span className={`badge rounded-pill px-3 ${isLowStock ? 'bg-danger animate-pulse' : 'bg-success'}`}>
                            {p.quantity}
                          </span>
                        </td>
                        <td className="text-center">{getShippingBadge(p.product_type?.esito_invio)}</td>
                        <td className="text-center">
                          <span className="badge bg-white text-dark border fw-normal shadow-sm">
                            <i className="fa-solid fa-user-tag me-1 text-primary small"></i>
                            {p.last_executor_name || "N/D"}
                          </span>
                        </td>
                        <td className="text-center fw-medium">€ {parseFloat(p.price || 0).toFixed(2)}</td>
                        <td className="text-end pe-4">
                          <div className="btn-group shadow-sm">
                            <Link href={`/inventario/movimenti/nuovo?product_id=${p.id}`} className="btn btn-sm btn-light border" title="Registra Movimento">
                              <i className="fa-solid fa-boxes-stacked"></i>
                            </Link>
                            <Link href={`/inventario/modifica/${p.id}`} className="btn btn-sm btn-light border" title="Modifica">
                              <i className="fa-solid fa-pen-to-square"></i>
                            </Link>
                            {/* BOTTONE ELIMINA FUNZIONANTE */}
                            <button 
                              onClick={() => handleDelete(p.id)} 
                              className="btn btn-sm btn-outline-danger border" 
                              title="Elimina Prodotto"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINAZIONE */}
          <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center">
            <span className="text-muted small">Pagina {page} di {totalPages}</span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link shadow-none" onClick={() => setPage(p => Math.max(1, p - 1))}>Precedente</button>
                </li>
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link shadow-none" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Successivo</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <style jsx>{`
        .table-danger-light { background-color: #fff8f8; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}