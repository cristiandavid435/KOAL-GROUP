import React, { useState, useEffect } from "react";
import { BarChart3Icon, CalendarIcon, UserIcon } from "lucide-react";
import api from "../../axiosInstance";
import { toast } from "react-toastify";

interface ProductionRecord {
  id: number;
  project: string;
  employee: string;
  date: string;
  material_type: string;
  quantity: number;
  unit: string;
  quality: string;
  observations: string;
}

export const ProductionView: React.FC = () => {
  const [viewType, setViewType] = useState("monthly");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchProductionData();
  }, [viewType, selectedProject, selectedMonth, selectedEmployee]);

  const fetchProductionData = async () => {
    try {
      const params: { [key: string]: string } = {};
      if (selectedProject) params.project = selectedProject;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedEmployee) params.employee = selectedEmployee;

      const response = await api.get("production-records/", { params });
      const results = Array.isArray(response.data)
        ? response.data
        : (response.data && typeof response.data === "object" && "results" in response.data)
        ? (response.data as { results: any[] }).results
        : [];
      setProductionData(results);
    } catch (error) {
      console.error("Error cargando datos de producción:", error);
      toast.error("Error cargando datos de producción");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get("projects/");
      const results = Array.isArray(response.data)
        ? response.data
        : (response.data && typeof response.data === "object" && "results" in response.data)
        ? (response.data as { results: any[] }).results
        : [];
      setProjects(results);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      toast.error("Error cargando proyectos");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("users/");
      const results = Array.isArray(response.data)
        ? response.data
        : (response.data && typeof response.data === "object" && "results" in response.data)
        ? (response.data as { results: any[] }).results
        : [];
      const filtered = results.filter((user: any) => user.role === "EMPLOYEE");
      setEmployees(filtered);
    } catch (error) {
      console.error("Error cargando empleados:", error);
      toast.error("Error cargando empleados");
    }
  };

  // Agrupar por mes
  const groupedData = productionData.reduce((acc, record) => {
    const month = new Date(record.date).toLocaleString("default", { month: "long" });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += record.quantity;
    return acc;
  }, {} as { [key: string]: number });

  const chartData = Object.entries(groupedData).map(([month, value]) => ({
    month,
    value,
  }));
  const maxValue = Math.max(...chartData.map((item) => item.value), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Producción</h2>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewType("monthly")}
              className={`flex gap-2 px-4 py-2 rounded ${
                viewType === "monthly"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <CalendarIcon size={16} />
              Por Mes
            </button>
            <button
              onClick={() => setViewType("project")}
              className={`flex gap-2 px-4 py-2 rounded ${
                viewType === "project"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <BarChart3Icon size={16} />
              Por Proyecto
            </button>
            <button
              onClick={() => setViewType("individual")}
              className={`flex gap-2 px-4 py-2 rounded ${
                viewType === "individual"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <UserIcon size={16} />
              Individual
            </button>
          </div>

          <div className="flex gap-2">
            {viewType === "monthly" && (
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Todos los proyectos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            {viewType === "project" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Todos los meses</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option
                    key={month}
                    value={month.toString().padStart(2, "0")}
                  >
                    {new Date(2023, month - 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            )}
            {viewType === "individual" && (
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Seleccionar empleado</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id.toString()}>
                    {e.username}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* GRAFICO DE BARRAS */}
        <div className="h-80 flex items-end gap-2">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gray-800"
                style={{
                  height: `${(item.value / (maxValue || 1)) * 100}%`,
                }}
              />
              <div className="text-xs mt-2">{item.month}</div>
              <div className="text-sm font-medium">{item.value} t</div>
            </div>
          ))}
        </div>
      </div>

      {/* DETALLE */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Detalles de Producción</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Fecha</th>
              <th className="px-6 py-3 text-left">Proyecto</th>
              <th className="px-6 py-3 text-left">Empleado</th>
              <th className="px-6 py-3 text-left">Material</th>
              <th className="px-6 py-3 text-left">Cantidad</th>
              <th className="px-6 py-3 text-left">Calidad</th>
            </tr>
          </thead>
          <tbody>
            {productionData.map((rec) => (
              <tr key={rec.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{new Date(rec.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{rec.project}</td>
                <td className="px-6 py-4">{rec.employee}</td>
                <td className="px-6 py-4">{rec.material_type}</td>
                <td className="px-6 py-4">
                  {rec.quantity} {rec.unit}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      rec.quality === "Alta"
                        ? "bg-green-100 text-green-800"
                        : rec.quality === "Media"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {rec.quality}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
