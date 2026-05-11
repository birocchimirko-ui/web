"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/login', { login, password });
      Cookies.set('token', response.data.token, { expires: 7 });
      Cookies.set('userName', response.data.user.username);
      Cookies.set('userRole', response.data.user.role);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenziali non valide');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center vh-100 align-items-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm border-light p-4">
            <div className="card-body">
              <h2 className="text-center mb-4 text-primary">Accesso Magazzino</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="form-group mb-5">
                  <label htmlFor="login" className="active">Email o Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="login" 
                    placeholder="Inserisci le tue credenziali"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-4">
                  <label htmlFor="password" className="active">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="text mt-1">
                  <Link href="/forgot-password">Password dimenticata?</Link>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-lg">
                  Accedi
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}