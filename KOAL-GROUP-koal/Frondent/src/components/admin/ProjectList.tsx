// Reemplaza todo tu código actual por este actualizado:

// 👇👇👇

import React, { useState, useEffect } from "react"; 
import { SearchIcon, PlusIcon, EditIcon, ChevronDownIcon } from "lucide-react";
import api from "../../axiosInstance";
import { toast } from "react-toastify";

interface ApiResponse {
  results?: Project[];
}

interface FormData {
  name: string;
  location: string;
  start_date: string;
  description: string;
  status: string;
  manager: number | null;
}

interface Project {
  id: number;
  name: string;
  location: string;
  start_date: string;
  description: string;
  status: string;
  manager_name: string | null;
  manager: number | null;
}

interface Supervisor {
  id: number;
  username: string;
  role: string;
}

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    start_date: "",
    description: "",
    status: "Activo",
    manager: null,
  });

  useEffect(() => {
    fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const response = await api.get<ApiResponse>("projects/");
      const results = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setProjects(results);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      toast.error("Error cargando proyectos.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "manager" ? (value ? parseInt(value) : null) : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditing && editId !== null) {
        await api.put(`projects/${editId}/`, formData);
        toast.success("Proyecto actualizado correctamente.");
      } else {
        await api.post("projects/", formData);
        toast.success("Proyecto creado correctamente.");
      }
      fetchProjects();
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setFormData({
        name: "",
        location: "",
        start_date: "",
        description: "",
        status: "Activo",
        manager: null,
      });
    } catch (error) {
      console.error("Error en la operación:", error);
      toast.error("Error en la operación.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setShowForm(true);
    setIsEditing(true);
    setEditId(project.id);
    setFormData({
      name: project.name,
      location: project.location,
      start_date: project.start_date,
      description: project.description,
      status: project.status,
      manager: project.manager,
    });
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold  dark:text-white">Proyectos</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setEditId(null);
            setFormData({
              name: "",
              location: "",
              start_date: "",
              description: "",
              status: "Activo",
              manager: null,
            });
          }}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          <PlusIcon size={16} />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4">
            {isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Entradas del formulario */}
              {[
                { name: "name", label: "Nombre" },
                { name: "location", label: "Ubicación" },
                { name: "start_date", label: "Fecha de Inicio", type: "date" },
              ].map(({ name, label, type = "text" }) => (
                <div key={name}>
                  <label className="block text-sm mb-1">{label}</label>
                  <input
                    name={name}
                    type={type}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              {/* Estado */}
              <div>
                <label className="block text-sm mb-1">Estado</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded px-3 py-2 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              {/* Supervisor */}
              <div className="col-span-2">
                <label className="block text-sm mb-1">Supervisor Asignado</label>
                <div className="relative">
                  <select
                    name="manager"
                    value={formData.manager || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded px-3 py-2 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar Supervisor</option>
                    {supervisors.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.username} (Supervisor)
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              {/* Descripción */}
              <div className="col-span-2">
                <label className="block text-sm mb-1">Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : isEditing ? "Actualizar Proyecto" : "Guardar Proyecto"}
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={18} className="text-gray-400" />
        </div>
        <input
          placeholder="Buscar proyectos..."
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {["Nombre", "Ubicación", "Fecha de Inicio", "Estado", "Supervisor", "Acciones"].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <td className="px-6 py-4">{project.name}</td>
                <td className="px-6 py-4">{project.location}</td>
                <td className="px-6 py-4">{project.start_date}</td>
                <td className="px-6 py-4">{project.status}</td>
                <td className="px-6 py-4">{project.manager_name || "Sin asignar"}</td>
                <td className="px-6 py-4">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => handleEdit(project)}>
                    <EditIcon size={18} className="text-gray-500 dark:text-white" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
