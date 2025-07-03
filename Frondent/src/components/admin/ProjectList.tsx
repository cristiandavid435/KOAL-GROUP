import React, { useState, useEffect } from "react";
import {
  SearchIcon,
  PlusIcon,
  XIcon,
  EditIcon,
  Trash2Icon,
} from "lucide-react";
import api from "../../axiosInstance";
import { toast } from "react-toastify";

interface Project {
  id: number;
  name: string;
  location: string;
  start_date: string;
  description: string;
  manager: string;
  status: string;
  personnel_count?: number;
}

interface FormData {
  name: string;
  location: string;
  start_date: string;
  description: string;
  manager: string;
}

export const ProjectList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    start_date: "",
    description: "",
    manager: "",
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<{ id: string; username: string }[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchSupervisors();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("projects/");
      const results = Array.isArray(response.data)
        ? response.data
        : (response.data && typeof response.data === "object" && "results" in response.data && Array.isArray((response.data as any).results))
          ? (response.data as any).results
          : [];
      setProjects(results);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      toast.error("Error cargando proyectos");
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await api.get("users/");
      const results = Array.isArray(response.data)
        ? response.data
        : (response.data && typeof response.data === "object" && "results" in response.data && Array.isArray((response.data as any).results))
          ? (response.data as any).results
          : [];
      const filtered = results.filter((u: any) => u.role === "SUPERVISOR");
      setSupervisors(filtered);
    } catch (error) {
      console.error("Error cargando supervisores:", error);
      toast.error("Error cargando supervisores");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`projects/${editingId}/`, formData);
        toast.success("Proyecto actualizado");
      } else {
        await api.post("projects/", formData);
        toast.success("Proyecto creado");
      }
      fetchProjects();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        location: "",
        start_date: "",
        description: "",
        manager: "",
      });
    } catch (error) {
      console.error("Error guardando proyecto:", error);
      toast.error("Error guardando proyecto");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      location: project.location,
      start_date: project.start_date,
      description: project.description,
      manager: project.manager.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este proyecto?")) return;
    try {
      await api.delete(`projects/${id}/`);
      toast.success("Proyecto eliminado");
      fetchProjects();
    } catch (error) {
      console.error("Error eliminando proyecto:", error);
      toast.error("Error eliminando proyecto");
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Proyectos</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
          }}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          <PlusIcon size={16} />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              {editingId ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XIcon size={20} className="text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Ubicación</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Supervisor</label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Seleccionar supervisor</option>
                  {supervisors.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border px-4 py-2 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={18} className="text-gray-400" />
        </div>
        <input
          placeholder="Buscar proyectos..."
          className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de proyectos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Ubicación</th>
              <th className="px-6 py-3">Personal</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{project.name}</td>
                <td className="px-6 py-4">{project.location}</td>
                <td className="px-6 py-4">{project.personnel_count || 0}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs rounded-full ${
                      project.status === "Activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="hover:bg-gray-100 p-1 rounded"
                  >
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="hover:bg-gray-100 p-1 rounded text-red-500"
                  >
                    <Trash2Icon size={16} />
                  </button>
                  {/* Puedes ampliar más botones de acciones aquí */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
