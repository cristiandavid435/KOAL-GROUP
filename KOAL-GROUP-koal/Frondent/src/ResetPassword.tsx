import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './axiosInstance';
import LogoKoal from './assets/hola.png';

export function ResetPassword() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword,
        new_password2: newPassword2,
      });
      setMessage(response.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 3000); // Redirige al login después de 3 segundos
    } catch (err: any) {
      console.error("Error al restablecer contraseña:", err);
      setError(err.response?.data?.new_password?.[0] || err.response?.data?.token?.[0] || 'Error al restablecer la contraseña');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-black">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-12 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-center mb-6">
          <img src={LogoKoal} alt="Koal Group Logo" className="h-20" />
        </div>
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Nueva Contraseña</h2>
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-6">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
          <input
            id="newPassword"
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            className="w-full px-4 py-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="newPassword2" className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
          <input
            id="newPassword2"
            type="password"
            placeholder="Confirma tu nueva contraseña"
            className="w-full px-4 py-3 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none"
        >
          Restablecer Contraseña
        </button>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-gray-400 hover:text-white"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </form>
    </div>
  );
}