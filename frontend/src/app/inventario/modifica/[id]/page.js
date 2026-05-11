"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ModificaProdotto() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    min_threshold: 0,
    product_type_attributes: {
      id: '', 
      data_invio: '',
      esito_invio: '',
      corpo_messaggio: ''
    }
  });

  // Caricamento dati iniziali
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data;
        setFormData({
          name: p.name || '',
          description: p.description || '',
          quantity: p.quantity || 0,
          price: p.price || 0,
          min_threshold: p.min_threshold || 0,
          product_type_attributes: {
            id: p.product_type?.id || '',
            data_invio: p.product_type?.data_invio ? p.product_type.data_invio.slice(0, 16) : '',
            esito_invio: p.product_type?.esito_invio || 'transito',
            corpo_messaggio: p.product_type?.corpo_messaggio || ''
          }
        });
      } catch (err) {
        setErrors(["Impossibile recuperare i dati del prodotto. Verificare la connessione al backend."]);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
    setSaving(true);
    setErrors([]);

    try {
      await api.patch(`/products/${id}`, { product: formData });
      router.push('/inventario');
    } catch (err) {
      setErrors(err.response?.data?.errors || ["Errore durante l'aggiornamento. Riprova."]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                <h4 className="mb-0 text-primary fw-bold">✏️ Modifica Scheda Prodotto</h4>
                <Link href="/inventario" className="btn btn-sm btn-outline-secondary">Annulla</Link>
              </div>
              
              <div className="card-body p-4">
                {errors.length > 0 && (
                  <div className="alert alert-danger shadow-sm">
                    <ul className="mb-0">
                      {errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* SEZIONE 1: ANAGRAFICA E CATEGORIA */}
                  <div className="mb-4">
                    <h5 className="text-muted border-bottom pb-2 mb-3">Dati Inventario</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold small">Tipo Prodotto (Categoria)</label>
                        <select 
                          name="name" 
                          className="form-select" 
                          value={formData.name} 
                          onChange={handleChange} 
                          required
                        >
                          <option value="Buste">Buste</option>
                          <option value="Carta">Carta</option>
                          <option value="Toner">Toner</option>
                          <option value="Altro">Altro</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold small">Descrizione / Modello / Serie</label>
                        <input 
                          type="text" 
                          name="description" 
                          className="form-control" 
                          placeholder="Es: Serie A4, Marca XYZ..."
                          value={formData.description} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEZIONE 2: ECONOMICA E SCORTE */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label fw-bold small">Prezzo Unitario (€)</label>
                      <input type="number" step="0.01" name="price" className="form-control" value={formData.price} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold small">Giacenza (Rettifica)</label>
                      <input type="number" name="quantity" className="form-control" value={formData.quantity} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold small">Soglia Allerta Mail</label>
                      <input type="number" name="min_threshold" className="form-control text-danger fw-bold" value={formData.min_threshold} onChange={handleChange} />
                    </div>
                  </div>

                  {/* SEZIONE 3: STATO SPEDIZIONE */}
                  <div className="p-3 border rounded-3 bg-light mb-4">
                    <h5 className="text-muted mb-3 small fw-bold text-uppercase">Logistica e Spedizione</h5>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold small">Esito Spedizione</label>
                        <select 
                          name="esito_invio" 
                          className="form-select border-primary" 
                          value={formData.product_type_attributes.esito_invio}
                          onChange={handleShippingChange}
                        >
                          <option value="transito">🚚 In transito</option>
                          <option value="consegnato">✅ Consegnato</option>
                          <option value="problema">⚠️ Problema / Danni</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold small">Data Ultimo Invio</label>
                        <input 
                          type="datetime-local" 
                          name="data_invio" 
                          className="form-control" 
                          value={formData.product_type_attributes.data_invio}
                          onChange={handleShippingChange} 
                        />
                      </div>
                      
                      {/* Nota visibile se c'è un problema */}
                      {formData.product_type_attributes.esito_invio === 'problema' && (
                        <div className="col-12 animate-fade-in">
                          <label className="form-label text-danger fw-bold small">Descrizione Problema Tecnico</label>
                          <textarea 
                            name="corpo_messaggio" 
                            className="form-control border-danger" 
                            rows="2"
                            placeholder="Descrivere il danno o l'anomalia..."
                            value={formData.product_type_attributes.corpo_messaggio}
                            onChange={handleShippingChange}
                          ></textarea>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="submit" className="btn btn-primary px-5 py-2 shadow-sm" disabled={saving}>
                      {saving ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Salvataggio...</>
                      ) : (
                        'Applica Modifiche'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}