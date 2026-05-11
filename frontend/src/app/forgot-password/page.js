"use client";
import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/passwords/forgot', { email });
      setMessage({ type: 'success', text: "Controlla la tua email per le istruzioni." });
    } catch (err) {
      setMessage({ type: 'danger', text: "Errore durante la richiesta." });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h3 className="text-center mb-4">Recupero Password</h3>
        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email registrata</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Invia link di reset</button>
        </form>
        <div className="text-center mt-3">
          <Link href="/login">Torna al Login</Link>
        </div>
      </div>
    </div>
  );
}