import React, { useState } from "react";
import axios from "../../../axiosInstance"; // asegurándote que axiosInstance está configurado

interface WorkFrontFormProps {
  onCancel: () => void;
  onSave: (data: any) => void; // Añadimos la prop onSave para enviar los datos
}

export const WorkFrontForm: React.FC<WorkFrontFormProps> = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "activo",
    start_date: "",
    estimated_end: "",
    workers: 0,
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Envía el formulario a la API
    try {
      const response = await axios.post("workfronts/", formData);
      onSave(response.data); // Pasamos el trabajo creado a través de la función onSave
    } catch (error) {
      console.error("Error al crear el frente de trabajo:", error);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Nombre del Frente</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ubicación</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="activo">Activo</option>
            <option value="planificado">Planificado</option>
            <option value="pausa">En pausa</option>
            <option value="completado">Completado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha de Inicio</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha Estimada de Finalización</label>
          <input
            type="date"
            name="estimated_end"
            value={formData.estimated_end}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Número de Trabajadores</label>
          <input
            type="number"
            name="workers"
            value={formData.workers}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            min="1"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Descripción del Trabajo</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows={4}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="border px-4 py-2 rounded"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};
