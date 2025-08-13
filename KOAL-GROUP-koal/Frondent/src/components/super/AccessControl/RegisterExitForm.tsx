// components/AccessControl/RegisterExitForm.tsx
import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { XIcon, CheckIcon } from 'lucide-react';
import { getEmployeeNameByCedula, getEmployeeAreByCedula } from '../../../axiosInstance';
import instance from '../../../axiosInstance';

interface RegisterExitFormProps {
  onClose: () => void;
  onSubmit: (data: ExitFormData) => void;
}

export interface ExitFormData {
  id_number: string;
  names: string;
  area: string;
  healthStatus?: string;
  notes?: string;
}

export const RegisterExitForm: React.FC<RegisterExitFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ExitFormData>({
    id_number: '',
    names: '',
    area: '',
    notes: ''
  });

  const [loadingName, setLoadingName] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCedulaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, id_number: value }));
    setErrorMessage(null);

    if (value.length > 0) {
      setLoadingName(true);
      try {
        const [nombreCompleto, area] = await Promise.all([
          getEmployeeNameByCedula(value),
          getEmployeeAreByCedula(value)
        ]);

        setFormData(prev => ({
          ...prev,
          names: nombreCompleto || '',
          area: area || ''
        }));

        if (!nombreCompleto) {
          setErrorMessage('No se encontró un empleado con esa cédula.');
        }
      } catch {
        setFormData(prev => ({ ...prev, names: '', area: '' }));
        setErrorMessage('Error al buscar los datos del empleado.');
      } finally {
        setLoadingName(false);
      }
    } else {
      setFormData(prev => ({ ...prev, names: '', area: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload = {
      cedula: formData.id_number,
      nombre: formData.names,
      estado_salud: formData.healthStatus,
      lugar_trabajo: formData.area,
      observacion: formData.notes
    };

    try {
      const response = await instance.post('access-logs/registrar-entrada-salida/', payload);
      const data = response.data as { detail?: string };
      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: data.detail || 'Registro exitoso!!',
        confirmButtonColor: '#3085d6'
      })
      onSubmit(formData);
    } catch (error: any) {
      const message =
        (error.response?.data as { detail?: string; error?: string })?.detail ||
        (error.response?.data as { detail?: string; error?: string })?.error ||
        'Error al registrar.';
      setErrorMessage(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Registrar</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cédula</label>
            <input
              type="text"
              name="id_number"
              value={formData.id_number}
              onChange={handleCedulaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              name="names"
              value={loadingName ? 'Buscando...' : formData.names}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área de Trabajo</label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
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
            <select
              name="healthStatus"
              value={formData.healthStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800"
            >
              <option value="">Seleccione una opción</option>
              <option value="Bien">Bien</option>
              <option value="Regular">Regular</option>
              <option value="Mal">Mal</option>
            </select>
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

          {errorMessage && (
            <div className="text-red-600 text-sm mt-2">
              {errorMessage}
            </div>
          )}

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
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"

            >
              <CheckIcon size={18} className="mr-2" />
              Registrar Entrada / Salida
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


