"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function NuovoMovimento() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdFromQuery = searchParams.get('product_id');

  const [products, setProducts] = useState([]); // Per selezionare il prodotto
  const [users, setUsers] = useState([]);      // Per selezionare l'esecutore
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    product_id: productIdFromQuery || '',
    quantity: '',
    movement_type: 'scarico',
    executor_id: '', 
    movement_date: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [prodRes, userRes] = await Promise.all([
        api.get('/products'),
        api.get('/users?page=1&per=100') // Chiediamo più utenti se necessario
      ]);

      console.log("Risposta API Utenti:", userRes.data);

      // CORREZIONE QUI: Puntiamo a userRes.data.users
      const userData = userRes.data.users || userRes.data;
      
      setProducts(prodRes.data.products || prodRes.data || []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("Errore nel caricamento dati:", err);
      setMessage({ 
        type: 'danger', 
        text: 'Errore: Verifica di avere i permessi Admin per vedere la lista operatori.' 
      });
    } finally {
      setLoading(false);
    }};
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/stock_movements', { stock_movement: formData });
      setMessage({ type: 'success', text: 'Movimento registrato con successo!' });
      setTimeout(() => router.push('/inventario'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.join(', ') || "Errore durante il salvataggio.";
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-5 text-center small text-muted">Inizializzazione registro...</div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 border-bottom">
                <h4 className="mb-0 fw-bold text-primary">📦 Registra Movimento</h4>
              </div>
              
              <div className="card-body p-4">
                {message.text && (
                  <div className={`alert alert-${message.type} mb-4`}>{message.text}</div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* SELEZIONE PRODOTTO */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Prodotto</label>
                    <select 
                      className="form-select"
                      value={formData.product_id}
                      onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                      required
                      disabled={!!productIdFromQuery}
                    >
                      <option value="">Scegli il prodotto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {p.description}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    {/* TIPO MOVIMENTO */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold small">Tipo</label>
                      <select 
                        className="form-select"
                        value={formData.movement_type}
                        onChange={(e) => setFormData({...formData, movement_type: e.target.value})}
                      >
                        <option value="scarico">🔻 Scarico (Prelievo)</option>
                        <option value="carico">▲ Carico (Rifornimento)</option>
                      </select>
                    </div>
                    {/* QUANTITÀ */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold small">Quantità</label>
                      <input 
                        type="number" className="form-control" 
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        required min="1"
                      />
                    </div>
                  </div>

                  {/* ESECUTORE MATERIALE (Menu a tendina richiesto) */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Esecutore Materiale (Chi ha spostato la merce?)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="fa-solid fa-user-check text-muted"></i></span>
                      <select 
                        className="form-select border-primary"
                        value={formData.executor_id}
                        onChange={(e) => setFormData({...formData, executor_id: e.target.value})}
                        required
                      >
                        <option value="">Seleziona l&apos;operatore responsabile...</option>
                        {users?.map && users.map(u=> (
                          <option key={u.id} value={u.id}>
                            {u.username} — ({u.first_name} {u.last_name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <small className="text-muted" style={{fontSize: '0.75rem'}}>
                      L&apos;utente che inserisce il dato (Tu) verrà registrato automaticamente dal sistema.
                    </small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold small">Note / Causale</label>
                    <textarea 
                      className="form-control" rows="2"
                      placeholder="Esempio: Consegna ufficio tecnico, reso fornitore..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <Link href="/inventario" className="btn btn-light border flex-fill">Annulla</Link>
                    <button type="submit" className="btn btn-primary flex-fill" disabled={submitting}>
                      {submitting ? 'Registrazione...' : 'Conferma Movimento'}
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