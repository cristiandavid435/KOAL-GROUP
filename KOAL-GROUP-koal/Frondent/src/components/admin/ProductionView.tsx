import React, { useState, useEffect } from "react";
import { BarChart3Icon, CalendarIcon, UserIcon } from "lucide-react";
import api from "../../axiosInstance";
import { toast } from "react-toastify";

interface ProductionRecord {
  id: number;
  date: string;
  material_type: string;
  quantity: number;
  unit: string;
  quality: string;
  employee: {
    id: number;
    names: string;
  };
  project: {
    id: number;
    name: string;
  };
  observations: string;
}

interface ProductionRecordResponse {
  results: ProductionRecord[];
}

interface Project {
  id: number;
  name: string;
}

interface ProjectResponse {
  results: Project[];
}

interface Employee {
  id: number;
  names: string;
}

interface EmployeResponse {
  results: Employee[];
}

export const ProductionView: React.FC = () => {
  const [viewType, setViewType] = useState("monthly");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [charts, setCharts] = useState<{
    monthly: string;
    project: string;
    employee: string;
  }>({ monthly: "", project: "", employee: "" });

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
    fetchCharts();
  }, []);

  useEffect(() => {
    fetchProductionData();
    fetchCharts();
  }, [viewType, selectedProject, selectedMonth, selectedEmployee]);

  const fetchProductionData = async () => {
    try {
      const params: { [key: string]: string } = {};
      if (selectedProject) params.project = selectedProject;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedEmployee) params.employee = selectedEmployee;

      const response = await api.get<ProductionRecordResponse | ProductionRecord[]>("production-records/", { params });
      const results = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setProductionData(results);
    } catch (error) {
      console.error("Error cargando datos de producción:", error);
      toast.error("Error cargando datos de producción");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get<ProjectResponse | Project[]>("projects/");
      const results = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setProjects(results);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      toast.error("Error cargando proyectos");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get<EmployeResponse | Employee[]>("users/");
      const results = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

        console.log("Empleados cargados", results);

      // Solo usamos names, sin filtrar por role
      setEmployees(results);
    } catch (error) {
      console.error("Error cargando empleados:", error);
      toast.error("Error cargando empleados");
    }
  };

  const fetchCharts = async () => {
    try {
      const params: { [key: string]: string } = {};
      if (viewType === "monthly" && selectedProject) params.project = selectedProject;
      if (viewType === "project" && selectedMonth) params.month = selectedMonth;
      if (viewType === "individual" && selectedEmployee) params.employee = selectedEmployee;

      const response = await api.get("production-records/charts/", { params });
      setCharts(response.data as { monthly: string; project: string; employee: string });
    } catch (error) {
      console.error("Error al cargar las gráficas", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Producción</h2>
      {/* FILTROS */}
      <div className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewType("monthly")}
              className={`flex gap-2 px-4 py-2 rounded 
              ${
                viewType === "monthly"
                  ? "bg-gray-800 text-white dark:bg-gray-800 dark:!text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
                  ? "bg-gray-800 text-white dark:bg-gray-800 dark:!text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
                    {new Date(2023, month - 1).toLocaleString("es-ES", {
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
                className="border border-gray-300 rounded px-3 py-2 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                <option value="">Todos los empleados</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id.toString()}>
                    {e.names}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* GRÁFICA */}
        <div className="flex justify-center py-4">
          {viewType === "monthly" && charts.monthly && (
            <img src={charts.monthly} alt="Gráfica mensual" className="max-w-full h-auto" />
          )}
          {viewType === "project" && charts.project && (
            <img src={charts.project} alt="Gráfica por proyecto" className="max-w-full h-auto" />
          )}
          {viewType === "individual" && charts.employee && (
            <img src={charts.employee} alt="Gráfica por empleado" className="max-w-full h-auto" />
          )}
        </div>
      </div>

      {/* DETALLES */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Detalles de Producción</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calidad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productionData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No hay registros de producción
                  </td>
                </tr>
              ) : (
                productionData.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(rec.date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rec.project?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rec.employee?.names || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rec.material_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rec.quantity} {rec.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
