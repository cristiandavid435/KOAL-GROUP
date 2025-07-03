import React, { useState, useEffect } from "react";
import axios from "../../../axiosInstance"; // Asegúrate de que axiosInstance esté configurado correctamente
import { PlusIcon, Edit, Trash, DownloadIcon, AlertTriangleIcon } from "lucide-react";

interface Tool {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  cantidad: number;
  estado: string;
  fecha_ultima_revision: string;
  ubicacion: string;
  observaciones: string;
  encargado: string;
}

export function InventarioHerramientasPanel() {
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
    cantidad: "",
    estado: "",
    fecha_ultima_revision: "",
    ubicacion: "",
    observaciones: "",
    encargado: "",
  });

  const [herramientas, setHerramientas] = useState<Tool[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  useEffect(() => {
    // Obtener los ítems de inventario desde la API
    axios
      .get<Tool[]>("inventory-items/") // Reemplazar con el endpoint correcto de inventario
      .then((res) => {
        setHerramientas(res.data); // Guardamos los ítems de inventario
      })
      .catch((error) => {
        console.error("Error al obtener los ítems de inventario:", error);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toolData = {
      ...formData,
      cantidad: parseInt(formData.cantidad),
    };

    if (isEditing && editingTool) {
      // Modo edición: actualiza la herramienta existente
      setHerramientas(
        herramientas.map((tool) =>
          tool.id === editingTool.id ? { ...tool, ...toolData, id: tool.id } : tool
        )
      );
    } else {
      // Modo agregar: añade una nueva herramienta
      const nuevaHerramienta = {
        id: herramientas.length + 1,
        ...toolData,
      };
      setHerramientas([...herramientas, nuevaHerramienta]);
    }

    // Resetea el formulario y cierra el modal
    setFormData({
      nombre: "",
      categoria: "",
      descripcion: "",
      cantidad: "",
      estado: "",
      fecha_ultima_revision: "",
      ubicacion: "",
      observaciones: "",
      encargado: "",
    });
    setIsEditing(false);
    setEditingTool(null);
    setIsModalOpen(false);
  };

  const handleEdit = (tool: Tool) => {
    setIsEditing(true);
    setEditingTool(tool);
    setFormData({
      nombre: tool.nombre,
      categoria: tool.categoria,
      descripcion: tool.descripcion,
      cantidad: tool.cantidad.toString(),
      estado: tool.estado,
      fecha_ultima_revision: tool.fecha_ultima_revision,
      ubicacion: tool.ubicacion,
      observaciones: tool.observaciones,
      encargado: tool.encargado,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setHerramientas(herramientas.filter((tool) => tool.id !== id));
  };

  // Contar herramientas en estado "Regular" (Advertencia) y "Malo" (Peligro)
  const warningCount = herramientas.filter((herramienta) => herramienta.estado === "Regular").length;
  const dangerCount = herramientas.filter((herramienta) => herramienta.estado === "Malo").length;

  // Filtrar herramientas
  const filteredHerramientas = herramientas.filter((herramienta) => {
    const matchesSearch =
      herramienta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herramienta.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herramienta.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herramienta.encargado.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado ? herramienta.estado === filterEstado : true;
    return matchesSearch && matchesEstado;
  });

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Nombre",
      "Categoría",
      "Descripción",
      "Cantidad",
      "Estado",
      "Fecha Última Revisión",
      "Ubicación",
      "Encargado",
      "Observaciones",
    ];
    const rows = filteredHerramientas.map((herramienta) => [
      herramienta.id,
      `"${herramienta.nombre}"`,
      `"${herramienta.categoria}"`,
      `"${herramienta.descripcion}"`,
      herramienta.cantidad,
      `"${herramienta.estado}"`,
      `"${herramienta.fecha_ultima_revision}"`,
      `"${herramienta.ubicacion}"`,
      `"${herramienta.encargado}"`,
      `"${herramienta.observaciones}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "inventario_herramientas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Inventario de Herramientas</h1>
        <button
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          onClick={() => {
            setIsEditing(false);
            setEditingTool(null);
            setFormData({
              nombre: "",
              categoria: "",
              descripcion: "",
              cantidad: "",
              estado: "",
              fecha_ultima_revision: "",
              ubicacion: "",
              observaciones: "",
              encargado: "",
            });
            setIsModalOpen(true);
          }}
        >
          <PlusIcon size={18} className="mr-2" />
          Nuevo Registro
        </button>
      </div>

      {isModalOpen && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Editar Herramienta" : "Nueva Herramienta"}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
                setEditingTool(null);
                setFormData({
                  nombre: "",
                  categoria: "",
                  descripcion: "",
                  cantidad: "",
                  estado: "",
                  fecha_ultima_revision: "",
                  ubicacion: "",
                  observaciones: "",
                  encargado: "",
                });
              }}
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                name="categoria"
                placeholder="Categoría"
                value={formData.categoria}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="number"
                name="cantidad"
                placeholder="Cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
                min={0}
              />
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecciona estado</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Malo">Malo</option>
              </select>
              <input
                type="date"
                name="fecha_ultima_revision"
                placeholder="Fecha Última Revisión"
                value={formData.fecha_ultima_revision}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                name="ubicacion"
                placeholder="Ubicación"
                value={formData.ubicacion}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                name="encargado"
                placeholder="Encargado"
                value={formData.encargado}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <textarea
                name="observaciones"
                placeholder="Observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
              <textarea
                name="descripcion"
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setEditingTool(null);
                  setFormData({
                    nombre: "",
                    categoria: "",
                    descripcion: "",
                    cantidad: "",
                    estado: "",
                    fecha_ultima_revision: "",
                    ubicacion: "",
                    observaciones: "",
                    encargado: "",
                  });
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditing ? "Actualizar" : "Agregar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold mr-3">Registros Recientes</h2>
            {warningCount > 0 && (
              <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
                <AlertTriangleIcon size={16} className="mr-1" />
                <span className="text-sm">{warningCount} Estado Regular</span>
              </div>
            )}
            {dangerCount > 0 && (
              <div className="ml-3 flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-md">
                <AlertTriangleIcon size={16} className="mr-1" />
                <span className="text-sm">{dangerCount} Estado Malo</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 w-full">
              <input
                type="text"
                placeholder="Buscar por nombre, categoría, ubicación o encargado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500 w-full sm:w-auto"
              />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="">Todos los estados</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Malo">Malo</option>
              </select>
            </div>
            <button
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 w-full sm:w-auto justify-center"
              onClick={exportToCSV}
            >
              <DownloadIcon size={16} className="mr-2" />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Nombre</th>
                <th className="py-3 px-4 text-left">Categoría</th>
                <th className="py-3 px-4 text-left">Descripción</th>
                <th className="py-3 px-4 text-left">Cantidad</th>
                <th className="py-3 px-4 text-left">Estado</th>
                <th className="py-3 px-4 text-left">Fecha Última Revisión</th>
                <th className="py-3 px-4 text-left">Ubicación</th>
                <th className="py-3 px-4 text-left">Encargado</th>
                <th className="py-3 px-4 text-left">Observaciones</th>
                <th className="py-3 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHerramientas.map((herramienta) => (
                <tr key={herramienta.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{herramienta.id}</td>
                  <td className="py-3 px-4">{herramienta.nombre}</td>
                  <td className="py-3 px-4">{herramienta.categoria}</td>
                  <td className="py-3 px-4">{herramienta.descripcion}</td>
                  <td className="py-3 px-4 font-medium">{herramienta.cantidad}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        herramienta.estado === "Bueno"
                          ? "bg-green-100 text-green-800"
                          : herramienta.estado === "Regular"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {herramienta.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4">{herramienta.fecha_ultima_revision}</td>
                  <td className="py-3 px-4">{herramienta.ubicacion}</td>
                  <td className="py-3 px-4">{herramienta.encargado}</td>
                  <td className="py-3 px-4">{herramienta.observaciones}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <button
                      title="Editar"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(herramienta)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      title="Eliminar"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(herramienta.id)}
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
