import React, { useState, useEffect } from 'react';
import instance from '../../../axiosInstance';



interface ProductionFormData {
  id?: number;
  date: string;
  material_type: string;
  quantity: number;
  unit: string;
  quality: string;
  employee: number;
  project: number;
  observations: string;
}

interface Employee {
  id: number;
  names: string;
}

interface Project {
  id: number;
  name: string;
}

interface ProductionDataFormProps {
  onCancel: () => void;
  onSubmit: (formData: ProductionFormData) => void;
  initialData?: ProductionFormData | null;
}

export const ProductionDataForm: React.FC<ProductionDataFormProps> = ({
  onCancel,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<ProductionFormData>({
    date: new Date().toISOString().split('T')[0],
    material_type: '',
    quantity: 1,
    unit: 'Cochados',
    quality: 'Media',
    employee: 0,
    project: 0,
    observations: '',
  });

  const [empleados, setEmpleados] = useState<Employee[]>([]);
  const [proyectos, setProyectos] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar empleados y proyectos primero
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [empleadosRes, proyectosRes] = await Promise.all([
          instance.get<Employee[]>('/empleados/'),
          instance.get<Project[]>('/proyectos/')
        ]);
        
        setEmpleados(empleadosRes.data);
        setProyectos(proyectosRes.data);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error cargando empleados o proyectos:', error);
        setError('Error al cargar los datos de empleados y proyectos');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Establecer datos iniciales solo después de que se carguen empleados y proyectos
  useEffect(() => {
    if (initialData && dataLoaded) {
      console.log("Datos iniciales recibidos:", initialData);
      setFormData({
        ...initialData,
        quantity: Math.max(1, initialData.quantity || 1),
        date: initialData.date || new Date().toISOString().split('T')[0],
        unit: initialData.unit || 'Cochados',
        quality: initialData.quality || 'Media',
        observations: initialData.observations || '',
        employee: Number(initialData.employee) || 0,
        project: Number(initialData.project) || 0,
      });
      console.log("Form data establecido:", formData);
    }
  }, [initialData, dataLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validación especial para cantidad
    if (name === 'quantity') {
      const quantity = parseFloat(value);
      if (value === '' || isNaN(quantity)) {
        setError('La cantidad debe ser un número válido');
      } else if (quantity < 0.01) {
        setError('La cantidad debe ser mayor a 0');
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }

    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'quantity'
          ? parseFloat(value) || 0
          : name === 'employee' || name === 'project'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.date) {
      setError('La fecha es requerida');
      return false;
    }
    if (!formData.material_type) {
      setError('El tipo de material es requerido');
      return false;
    }
    if (formData.quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return false;
    }
    if (!formData.unit) {
      setError('La unidad es requerida');
      return false;
    }
    if (!formData.quality) {
      setError('La calidad es requerida');
      return false;
    }
    if (!formData.employee || formData.employee === 0) {
      setError('Debe seleccionar un empleado');
      return false;
    }
    if (!formData.project || formData.project === 0) {
      setError('Debe seleccionar un proyecto');
      return false;
    }
    if (!formData.observations.trim()) {
      setError('Las observaciones son requeridas');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend = {
        ...formData,
        observations: formData.observations.trim(),
        employee: Number(formData.employee),
        project: Number(formData.project),
      };

      console.log("Datos a enviar:", dataToSend);

      if (initialData?.id) {
        await instance.put(`/production-records/${initialData.id}/`, dataToSend);
      } else {
        await instance.post('/production-records/registrar-produccion-por-nombre/', dataToSend);
      }
      
      onSubmit(formData);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Error al guardar los datos en el servidor';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!dataLoaded) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Producción <span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Material <span className="text-red-500">*</span>
          </label>
          <select 
            name="material_type" 
            value={formData.material_type} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="">Seleccione un tipo de material</option>
            <option value="Carbón termico">Carbón térmico</option>
            <option value="Carbón coquizable">Carbón coquizable</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            name="quantity" 
            value={formData.quantity} 
            onChange={handleChange} 
            min="0.01" 
            step="0.01" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad <span className="text-red-500">*</span>
          </label>
          <select 
            name="unit" 
            value={formData.unit} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="Cochados">Cochados</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calidad <span className="text-red-500">*</span>
          </label>
          <select 
            name="quality" 
            value={formData.quality} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empleado <span className="text-red-500">*</span>
          </label>
          <select 
            name="employee" 
            value={formData.employee} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="">Seleccione un empleado</option>
            {empleados.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.names}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proyecto <span className="text-red-500">*</span>
          </label>
          <select 
            name="project" 
            value={formData.project} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            required
          >
            <option value="">Seleccione un proyecto</option>
            {proyectos.map(proy => (
              <option key={proy.id} value={proy.id}>{proy.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones <span className="text-red-500">*</span>
        </label>
        <textarea 
          name="observations" 
          value={formData.observations} 
          onChange={handleChange} 
          rows={3} 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Ingrese observaciones sobre la producción..."
          required 
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : (initialData ? 'Actualizar Registro' : 'Guardar Datos')}
        </button>
      </div>
    </form>
  );
};