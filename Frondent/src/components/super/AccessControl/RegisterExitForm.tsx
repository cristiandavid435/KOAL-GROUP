// components/AccessControl/RegisterExitForm.tsx
import React, { useState } from 'react';
import { XIcon, CheckIcon } from 'lucide-react';

interface RegisterExitFormProps {
  onClose: () => void;
  onSubmit: (data: ExitFormData) => void;
}

export interface ExitFormData {
  employeeId: string;
  name: string;
  area: string;
  notes?: string;
}

export const RegisterExitForm: React.FC<RegisterExitFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ExitFormData>({
    employeeId: '',
    name: '',
    area: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Registrar Salida</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Cedula</label>
            <input
              type="text"
              name="curp"
              value={(formData as any).curp || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
            </div>
          
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Huella Digital</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área de Trabajo</label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            >
              <option value="">Seleccione un área</option>
              <option value="Mina Norte">Mina Norte</option>
              <option value="Mina Sur">Mina Sur</option>
              <option value="Procesamiento">Procesamiento</option>
              <option value="Administración">Administración</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Salud</label>
            <input
              type="text"
              name="rfc"
              value={(formData as any).rfc || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              required
            />
            </div>

             <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (Opcional)</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
              <CheckIcon size={18} className="mr-2" />
              Registrar Salida
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};