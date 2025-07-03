import React, { useState } from 'react';
import axios from './axiosInstance';

interface LoginProps {
  onLogin: (accessToken: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      interface TokenResponse {
        access: string;
        refresh: string;
      }
      const response = await axios.post<TokenResponse>('token/', {
        username,
        password
      });
      const { access, refresh } = response.data;
      onLogin(access);
      localStorage.setItem('refreshToken', refresh); // opcional
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>
        {error && <p className="text-red-600 text-center mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Usuario"
          className="w-full mb-3 p-2 border border-gray-300 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-3 p-2 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
