import React, { useState } from 'react';
import { SearchIcon, PlusIcon, FileTextIcon, UserIcon, BarChart3Icon, XIcon } from 'lucide-react';
export const ProjectList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: '',
    description: '',
    manager: ''
  });
  // Dummy project data
  const projects = [{
    id: 1,
    name: 'Mina Norte',
    location: 'Región Norte',
    personnel: 12,
    status: 'Activo'
  }, {
    id: 2,
    name: 'Proyecto Sur',
    location: 'Región Sur',
    personnel: 8,
    status: 'Activo'
  }, {
    id: 3,
    name: 'Excavación Este',
    location: 'Región Este',
    personnel: 15,
    status: 'Activo'
  }, {
    id: 4,
    name: 'Mina Occidental',
    location: 'Región Oeste',
    personnel: 10,
    status: 'Pausado'
  }, {
    id: 5,
    name: 'Proyecto Central',
    location: 'Región Central',
    personnel: 20,
    status: 'Activo'
  }];
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
    // Aquí iría la lógica para crear el proyecto
    console.log('Nuevo proyecto:', formData);
    setShowForm(false);
    setFormData({
      name: '',
      location: '',
      startDate: '',
      description: '',
      manager: ''
    });
  };
  const filteredProjects = projects.filter(project => project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.location.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Proyectos</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
          <PlusIcon size={16} />
          <span>Nuevo Proyecto</span>
        </button>
      </div>
      {showForm && <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Crear Nuevo Proyecto</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <XIcon size={20} className="text-gray-500" />
            </button>
          </div>
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
                  supervisor de Proyecto
                </label>
                <select id="manager" name="manager" value={formData.manager} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option value="">Seleccionar supervisor</option>
                  <option value="1">Carlos Rodríguez</option>
                  <option value="2">Ana Martínez</option>
                  <option value="3">Luis Gómez</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
                Crear Proyecto
              </button>
            </div>
          </form>
        </div>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={18} className="text-gray-400" />
        </div>
        <input type="text" placeholder="Buscar proyectos..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Personal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map(project => <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {project.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-500">{project.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-500">{project.personnel}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <FileTextIcon size={18} className="text-gray-500" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <UserIcon size={18} className="text-gray-500" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <BarChart3Icon size={18} className="text-gray-500" />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};