import React, { useState, useEffect } from "react";
import { DownloadIcon, BarChart3Icon, PieChartIcon, UserIcon, FolderIcon } from "lucide-react";
import api from "../../axiosInstance";
import { toast } from "react-toastify";

interface Project {
  id: number;
  name: string;
}

interface Report {
  id: number;
  name: string;
  type: string;
  date: string;
  file_url: string;
}

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState("production");
  const [project, setProject] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    fetchProjects();
    fetchRecentReports();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get("projects/");
      const results = Array.isArray(response.data)
        ? response.data
        : (response.data && typeof response.data === "object" && "results" in response.data)
          ? (response.data as { results: Project[] }).results
          : [];
      setProjects(results);
    } catch (error) {
      console.error("Error cargando proyectos:", error);
      toast.error("Error cargando proyectos");
    }
  };

  const fetchRecentReports = async () => {
    try {
      const response = await api.get("reports/");
      const results = Array.isArray(response.data)
        ? response.data
        : (response.data && typeof response.data === "object" && "results" in response.data)
          ? (response.data as { results: Report[] }).results
          : [];
      setRecentReports(results);
    } catch (error) {
      console.error("Error cargando informes:", error);
      toast.error("Error cargando informes");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.post("reports/generate/", {
        report_type: reportType,
        project,
        start_date: dateRange.start,
        end_date: dateRange.end,
      });
      toast.success("Informe generado correctamente.");
      console.log("Informe generado:", response.data);
      fetchRecentReports();
    } catch (error) {
      console.error("Error generando informe:", error);
      toast.error("Error generando informe");
    }
  };

  const handleDownloadReport = async (reportId: number) => {
    try {
      const response = await api.get(`reports/${reportId}/download/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data as Blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error descargando informe:", error);
      toast.error("Error descargando informe");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Informes</h2>
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Generar Informe</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Informe</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="production">Producción</option>
              <option value="personnel">Ingreso y Salida</option>
              <option value="project">Empleados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Proyecto</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos los Proyectos</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id.toString()}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Fecha Inicial</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Fecha Final</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={handleGenerateReport}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 flex gap-2 items-center"
            >
              <BarChart3Icon size={16} />
              <span>Generar Informe</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Informes Recientes</h3>
        <div className="space-y-3">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex justify-between p-3 hover:bg-gray-50 border rounded"
            >
              <div className="flex items-center">
                {report.type === "production" ? (
                  <BarChart3Icon size={20} className="text-gray-500 mr-3" />
                ) : report.type === "personnel" ? (
                  <UserIcon size={20} className="text-gray-500 mr-3" />
                ) : report.type === "project" ? (
                  <FolderIcon size={20} className="text-gray-500 mr-3" />
                ) : (
                  <PieChartIcon size={20} className="text-gray-500 mr-3" />
                )}
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-gray-500">
                    Generado el {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport(report.id)}
                className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
              >
                <DownloadIcon size={16} />
                <span className="text-sm">Descargar</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
