import React, { useState } from 'react';
import axios from './axiosInstance';
import LogoKoal from './assets/hola.png';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (accessToken: string, refreshToken: string) => void;
}

// INTERFACES para tipado de las respuestas
interface TokenResponse {
  access: string;
  refresh: string;
}

interface PasswordResetResponse {
  message: string;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<TokenResponse>('token/', { username, password });
      const { access, refresh } = response.data;
      onLogin(access, refresh);
      localStorage.setItem('refreshToken', refresh);
      setError('');
    } catch (err: any) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<PasswordResetResponse>('password-reset/request/', { email: resetEmail });
      setResetMessage(response.data.message);
      setResetError('');
      setResetEmail('');
    } catch (err: any) {
      setResetError(err.response?.data?.email?.[0] || 'Error al enviar el correo de restablecimiento');
      setResetMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4">
      <div className="w-full max-w-lg bg-gray-850 p-10 rounded-xl shadow-xl border border-gray-700">
        <div className="flex flex-col items-center mb-6">
          <img
            src={LogoKoal}
            alt="Koal Group Logo"
            className="h-24 w-24 rounded-full border-4 border-gray-500 shadow-lg mb-3"
          />
          <h1 className="text-white text-2xl font-bold tracking-wide">KOAL GROUP</h1>
          <p className="text-gray-400 text-sm">Minería profesional y segura</p>
        </div>

        {!showResetForm ? (
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <div className="mb-5 relative">
              <label htmlFor="username" className="block text-gray-300 mb-2">
                Usuario
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="username"
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-6 relative">
              <label htmlFor="password" className="block text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-3 rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-500 text-black py-3 rounded-md font-bold hover:bg-gray-600 transition"
            >
              Iniciar Sesión
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-gray-500"
                onClick={() => setShowResetForm(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordResetRequest}>
            {resetMessage && <p className="text-green-500 text-center mb-4">{resetMessage}</p>}
            {resetError && <p className="text-red-500 text-center mb-4">{resetError}</p>}

            <div className="mb-6">
              <label htmlFor="resetEmail" className="block text-gray-300 mb-2">
                Correo electrónico
              </label>
              <input
                id="resetEmail"
                type="email"
                className="w-full px-4 py-3 rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Tu correo"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-500 text-black py-3 rounded-md font-bold hover:bg-gray-600 transition"
            >
              Enviar enlace de recuperación
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-gray-500"
                onClick={() => {
                  setShowResetForm(false);
                  setResetEmail('');
                  setResetMessage('');
                  setResetError('');
                }}
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}