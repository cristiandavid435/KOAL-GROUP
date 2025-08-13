import React, { useState, useEffect, useCallback } from "react";
import axios from "../../../axiosInstance";

interface WorkFrontFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
  initialData?: {
    id?: number;
    name: string;
    location: string;
    start_date: string | null;
    estimated_end_date: string | null;
    workers: number;
    description: string;
    supervisor: number | null;
    supervisor_name?: string;
  };
}

interface User {
  id: number;
  username: string;
}

export const WorkFrontForm: React.FC<WorkFrontFormProps> = ({ onCancel, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    start_date: "",
    estimated_end_date: "",
    workers: "0",
    description: "",
    supervisor: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get<User[]>("/users/");
      setUsers(response.data);
      setUsersError(null);
    } catch (err: any) {
      console.error("Error al cargar usuarios:", err);
      setUsersError("No se pudieron cargar los usuarios. No tienes permisos para esta acción.");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        location: initialData.location || "",
        start_date: initialData.start_date || "",
        estimated_end_date: initialData.estimated_end_date || "",
        workers: initialData.workers?.toString() || "0",
        description: initialData.description || "",
        supervisor: initialData.supervisor?.toString() || "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.location || !formData.workers) {
      setError("Por favor, completa los campos obligatorios: Nombre, Ubicación y Número de Trabajadores.");
      return;
    }

    const workersNum = parseInt(formData.workers);
    if (isNaN(workersNum) || workersNum < 1) {
      setError("El número de trabajadores debe ser un número válido mayor o igual a 1.");
      return;
    }

    const payload = {
      name: formData.name,
      location: formData.location,
      start_date: formData.start_date || null,
      estimated_end_date: formData.estimated_end_date || null,
      workers: workersNum,
      description: formData.description,
      supervisor: formData.supervisor ? parseInt(formData.supervisor) : null,
    };

    try {
      let response;
      if (initialData?.id) {
        response = await axios.put(`/workfronts/${initialData.id}/`, payload);
      } else {
        response = await axios.post("/workfronts/", payload);
      }
      onSave(response.data);
    } catch (error: any) {
      console.error("Error al guardar el frente de trabajo:", error);
      const errorMessage = error.response?.data
        ? Object.values(error.response.data).flat().join(' ') || error.message
        : error.message || "Problema de conexión";
      setError(`Error al guardar el frente de trabajo: ${errorMessage}`);
    }
  };

  return (
    <form className="space-y-4 bg-white rounded-lg shadow-md p-6" onSubmit={handleSubmit}>
      {error && <div className="text-red-600 bg-red-50 p-2 rounded-md text-sm">{error}</div>}
      {usersError && (
        <div className="text-amber-600 bg-amber-50 p-2 rounded-md text-sm">
          {usersError} Puedes continuar sin asignar un encargado o usar el campo Descripción.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Frente</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
          <select
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={usersError !== null}
          >
            <option value="">Sin asignar</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Estimada de Finalización</label>
          <input
            type="date"
            name="estimated_end_date"
            value={formData.estimated_end_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Trabajadores</label>
          <input
            type="number"
            name="workers"
            value={formData.workers}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="1"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
        >
          {initialData ? "Actualizar Frente" : "Guardar Frente"}
        </button>
      </div>
    </form>
  );
};
