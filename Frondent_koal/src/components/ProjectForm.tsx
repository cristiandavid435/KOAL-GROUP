import React, { useState } from 'react';
import { SaveIcon } from 'lucide-react';
export const ProjectForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: '',
    description: '',
    manager: ''
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the form submission
    console.log('Form submitted:', formData);
  };
  return <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Proyecto</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Proyecto
              </label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
                Supervicion de Proyecto
              </label>
              <select id="manager" name="manager" value={formData.manager} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
                <option value="">Seleccionar Supervisor</option>
                <option value="1">Carlos Rodríguez</option>
                <option value="2">Ana Martínez</option>
               
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"></textarea>
          </div>
          <div className="pt-4">
            <button type="submit" className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
              <SaveIcon size={16} />
              <span>Guardar Proyecto</span>
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Asignar Personal</h3>
        <p className="text-gray-500 mb-4">
          Primero guarde el proyecto para poder asignar personal.
        </p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                Sin personal asignado
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
};