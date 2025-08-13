import React, { useState, useEffect } from "react";
import { SaveIcon, ChevronDownIcon } from "lucide-react";
import api from "../../axiosInstance"; // usando el interceptor con JWT
import { toast } from "react-toastify";

interface FormData {
  name: string;
  location: string;
  start_date: string;
  description: string;
  manager: string;
}

interface Supervisor {
  id: number;
  username: string;
  role: string;
}

export const ProjectForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    start_date: "",
    description: "",
    manager: "",
  });

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const res = await api.get("users/");
      const users = res.data as Array<any>;
      const filtered = users.filter((user: any) => user.role === "SUPERVISOR");
      setSupervisors(filtered);
    } catch (error) {
      console.error("Error obteniendo supervisores:", error);
      toast.error("Error cargando supervisores.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post("projects/", formData);
      toast.success("Proyecto creado exitosamente.");
      setFormData({
        name: "",
        location: "",
        start_date: "",
        description: "",
        manager: "",
      });
    } catch (error) {
      console.error("Error creando proyecto:", error);
      toast.error("Error al crear el proyecto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Proyecto</h2>
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del Proyecto
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de Inicio</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Supervisor Asignado
              </label>
              <div className="relative">
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>
                    Seleccionar Supervisor
                  </option>
                  {supervisors.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.username} (Supervisor)
                    </option>
                  ))}
                </select>
                <ChevronDownIcon 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
                  size={16} 
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon size={16} />
              <span>{loading ? "Guardando..." : "Guardar Proyecto"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sección de asignación de personal futura */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Asignar Personal</h3>
        <p className="text-gray-500 mb-4">
          Primero guarde el proyecto para poder asignar personal.
        </p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                Sin personal asignado aún.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};