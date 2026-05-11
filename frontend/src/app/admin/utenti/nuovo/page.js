"use client";
import { useState } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function NuovoUtente() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nome: '',
    cognome: '',
    password: '',
    data_di_nascita: '',
    role_id: '',
    stato_account: true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', { user: formData });
      alert("Utente creato con successo!");
      router.push('/admin/utenti');
    } catch (err) {
      alert(err.response?.data?.errors?.join(", ") || "Errore nella creazione");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <button onClick={() => router.back()} className="btn btn-link text-decoration-none mb-3 p-0 text-muted">
              <i className="fa-solid fa-arrow-left me-2"></i>Torna alla lista
            </button>
            
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h4 mb-4 fw-bold">👤 Crea Nuovo Utente</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Username</label>
                      <input type="text" className="form-control" required
                        placeholder="es. mario.rossi"
                        onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email</label>
                      <input type="email" className="form-control" required
                        placeholder="email@esempio.it"
                        onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Nome</label>
                      <input type="text" className="form-control" required
                        onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Cognome</label>
                      <input type="text" className="form-control" required
                        onChange={(e) => setFormData({...formData, cognome: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Data di Nascita</label>
                      <input type="date" className="form-control" required
                        onChange={(e) => setFormData({...formData, data_di_nascita: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Ruolo</label>
                      <select className="form-select" value={formData.role_id}
                        onChange={(e) => setFormData({...formData, role_id: e.target.value})}>
                        <option value="">Seleziona un ruolo (Default: Operatore)</option>
                        <option value="95a6e8e4-3fed-405a-8ced-975a8ee82e5d">Admin</option>
                        <option value="d4d87949-4e2b-4e29-a976-5037085b7fbf">Operatore</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Password</label>
                      <input type="password" className="form-control" required
                        onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Stato Iniziale</label>
                      <select className="form-select" value={formData.stato_account}
                        onChange={(e) => setFormData({...formData, stato_account: e.target.value === 'true'})}>
                        <option value="true">Attivo</option>
                        <option value="false">Disattivato</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 d-flex gap-2">
                    <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={saving}>
                      {saving ? 'Salvataggio...' : 'Salva Utente'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary px-4" onClick={() => router.back()}>
                      Annulla
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