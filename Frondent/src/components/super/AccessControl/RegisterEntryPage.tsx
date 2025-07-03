import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';

export const RegisterEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    entryTime: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Datos de entrada:', formData);
    navigate('/access-control');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          className="p-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/access-control')}
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Registrar Entrada</h1>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">
              Nombre del Empleado
            </label>
            <input
              type="text"
              id="employeeName"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              placeholder="Ingrese el nombre"
              required
            />
          </div>
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
              ID del Empleado
            </label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              placeholder="Ingrese el ID"
              required
            />
          </div>
          <div>
            <label htmlFor="entryTime" className="block text-sm font-medium text-gray-700">
              Hora de Entrada
            </label>
            <input
              type="datetime-local"
              id="entryTime"
              name="entryTime"
              value={formData.entryTime}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              onClick={() => navigate('/access-control')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};