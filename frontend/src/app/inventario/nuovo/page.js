
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function NuovoProdotto() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    name: 'Buste', // Valore predefinito categoria
    description: '',
    quantity: '',
    price: '',
    min_threshold: '10',
    executor_id: '', // Verrà popolato nell'useEffect
    product_type_attributes: {
      data_invio: new Date().toISOString().slice(0, 16),
      esito_invio: 'transito',
      corpo_messaggio: 'Registrazione prodotto inventario'
    }
  });

  useEffect(() => {
  const fetchData = async () => {
    try {
      // 1. Carica la lista utenti
      const res = await api.get('/users');
      
      // CORREZIONE: La lista utenti è probabilmente in res.data.users, non direttamente in res.data
      const listaUtenti = res.data.users || res.data; 
      setUsers(Array.isArray(listaUtenti) ? listaUtenti : []);

      // 2. Recupera l'utente loggato
      const savedUser = localStorage.getItem('user'); 
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Assicurati che nel tuo stato formData la chiave sia corretta (user_id o executor_id)
        setFormData(prev => ({ ...prev, user_id: user.id }));
      }
    } catch (err) {
      console.error("Errore inizializzazione:", err);
      setUsers([]); // Reset per evitare errori di .map
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      product_type_attributes: { ...prev.product_type_attributes, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      await api.post('/products', { product: formData });
      router.push('/inventario');
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Errore durante il salvataggio."]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-5 text-center text-muted">Caricamento configurazione...</div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 border-bottom">
                <h4 className="mb-0 fw-bold text-primary">📦 Nuovo Prodotto Inventario</h4>
              </div>
              
              <div className="card-body p-4">
                {errors.length > 0 && (
                  <div className="alert alert-danger">
                    <ul className="mb-0">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* ANAGRAFICA */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Tipo Prodotto</label>
                      <select name="name" className="form-select" value={formData.name} onChange={handleChange} required>
                        <option value="Buste">Buste</option>
                        <option value="Carta">Carta</option>
                        <option value="Toner">Toner</option>
                        <option value="Altro">Altro</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small">Descrizione Commerciale</label>
                      <input 
                        type="text" name="description" className="form-control" 
                        placeholder="Marca, serie, dettagli..." 
                        value={formData.description} onChange={handleChange} required 
                      />
                    </div>
                  </div>

                  {/* GIACENZA E SOGLIE */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label fw-bold small">Quantità Iniziale</label>
                      <input type="number" name="quantity" className="form-control" value={formData.quantity} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold small">Prezzo Unitario (€)</label>
                      <input type="number" step="0.01" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold small">Soglia Minima Allerta</label>
                      <input type="number" name="min_threshold" className="form-control text-danger" value={formData.min_threshold} onChange={handleChange} />
                    </div>
                  </div>

                  {/* ESECUTORE MATERIALE (Con valore predefinito) */}
                  <div className="mb-4 p-3 bg-white border rounded">
                    <label className="form-label fw-bold text-uppercase small text-primary">
                      <i className="fa-solid fa-user-check me-2"></i>Responsabile Fisico del Carico
                    </label>
                    <select 
                      className="form-select border-primary"
                      value={formData.executor_id}
                      onChange={(e) => setFormData({...formData, executor_id: e.target.value})}
                      required
                    >
                      <option value="">Seleziona chi ha ricevuto la merce...</option>
                      {users?.map && users.map((u)=> (
                        <option key={u.id} value={u.id}>
                          {u.username} ({u.first_name} {u.last_name})
                        </option>
                      ))}
                    </select>
                    <div className="form-text mt-2">
                      Di default è impostato il tuo utente, ma puoi cambiarlo se stai registrando per un collega.
                    </div>
                  </div>

                  {/* LOGISTICA */}
                  <div className="p-3 border rounded bg-light mb-4">
                    <h6 className="fw-bold mb-3 small text-muted text-uppercase">Dati Spedizione AgID</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Stato Attuale</label>
                        <select 
                          name="esito_invio" className="form-select" 
                          value={formData.product_type_attributes.esito_invio} onChange={handleShippingChange}
                        >
                          <option value="transito">In Transito</option>
                          <option value="consegnato">Consegnato</option>
                          <option value="problema">Problema</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Data Evento</label>
                        <input 
                          type="datetime-local" name="data_invio" className="form-control" 
                          value={formData.product_type_attributes.data_invio} onChange={handleShippingChange} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end">
                    <Link href="/inventario" className="btn btn-light border px-4">Annulla</Link>
                    <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={submitting}>
                      {submitting ? 'Creazione in corso...' : 'Crea Prodotto e Registra Carico'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}