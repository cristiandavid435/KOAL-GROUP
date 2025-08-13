import React, { useState, useEffect, useCallback } from "react";
import api from "../../axiosInstance";
import logo from "../../assets/hola.png";
import { saveAs } from "file-saver"; // Requiere: npm install --save-dev @types/file-saver
import {
  BarChart3Icon,
  UsersIcon,
  FolderIcon,
  SunIcon,
  CalendarIcon,
  EyeIcon,
  TargetIcon,
  CloudDownloadIcon, // Importa el icono de descarga
  XIcon, // Para el botón de cerrar en la alerta
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const [projectCount, setProjectCount] = useState<number>(0);
  const [personnelCount, setPersonnelCount] = useState<number>(0);
  const [monthlyProduction, setMonthlyProduction] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBackupAlert, setShowBackupAlert] = useState<boolean>(false); // Nuevo estado para la alerta

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projectsRes = await api.get("projects/");
      const projectsData = projectsRes.data as any[];
      const activeProjects = projectsData.filter((p: any) => p.status === "Activo");
      setProjectCount(activeProjects.length);

      const usersRes = await api.get("users/");
      setPersonnelCount((usersRes.data as any[]).length);

      const productionRes = await api.get("production-records/");
      const currentMonth = new Date().getMonth() + 1;
      const productionData = productionRes.data as any[];
      const monthlyTotal = productionData
        .filter((rec: any) => new Date(rec.date).getMonth() + 1 === currentMonth)
        .reduce((acc: number, rec: any) => acc + (parseFloat(rec.quantity) || 0), 0);
      setMonthlyProduction(monthlyTotal);
    } catch (error: any) {
      console.error("Error cargando datos del dashboard:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Problema de conexión";
      setError(`Error al cargar los datos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Descargar backup de la base de datos SQLite
  const handleDownloadBackup = async () => {
    try {
      const response = await api.get("backup/", {
        responseType: "blob",
      });
      const blob = new Blob([response.data as BlobPart], {
        type: "application/x-sqlite3",
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      saveAs(blob, `backup_db_${timestamp}.sqlite3`);
      setShowBackupAlert(true); // Mostrar la alerta después de la descarga exitosa
    } catch (error: any) {
      console.error("Error descargando backup:", error);
      setError("Error al descargar el backup. Verifica tu conexión o permisos.");
    }
  };

  const closeBackupAlert = () => {
    setShowBackupAlert(false);
  };

  if (loading) {
    return <div className="text-center text-gray-500">Cargando datos del dashboard...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-100 p-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-blue-700 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Banner de bienvenida */}
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Bienvenido al Panel Principal</h2>
          <p className="mt-2 text-gray-300">
            Visualiza de forma rápida el estado general de los proyectos y operaciones de Koal Group.
          </p>
        </div>
        <button
          onClick={handleDownloadBackup}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <CloudDownloadIcon size={20} />
          Descargar Backup
        </button>
      </div>

      {/* Alerta de Restauración (se muestra condicionalmente) */}
      {showBackupAlert && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
    <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-6 max-w-xl w-full relative border border-gray-700">
      {/* Botón de cerrar */}
      <button
        onClick={closeBackupAlert}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        aria-label="Cerrar"
      >
        <XIcon size={24} />
      </button>

      {/* Logo centrado */}
      <div className="flex justify-center mb-6">
        <img src={logo} alt="Koal Group Logo" className="w-28 h-auto object-contain" />
      </div>

      {/* Título e ícono */}
      <div className="flex items-center mb-4 gap-3">
        <CloudDownloadIcon size={32} className="text-gray-400" />
        <h2 className="text-2xl font-bold">Backup descargado con éxito</h2>
      </div>

      {/* Mensaje principal */}
      <p className="text-gray-300 mb-4">
        Tu archivo <code className="bg-gray-800 px-2 py-1 rounded text-sm">backup_db_[fecha].sqlite3</code> ha sido descargado correctamente.
      </p>

      {/* Instrucciones */}
      <p className="text-gray-300 font-semibold mb-4">Para restaurar el backup:</p>
      <ol className="list-decimal list-inside text-gray-300 space-y-1 mb-6 pl-4 text-sm">
        <li>Accede al servidor con permisos de administrador.</li>
        <li>Detén la aplicación Django temporalmente.</li>
        <li>Ubica el archivo <code>db.sqlite3</code> en tu proyecto.</li>
        <li>Reemplázalo con este archivo descargado.</li>
        <li>Inicia nuevamente tu aplicación.</li>
      </ol>

      {/* Nota final */}
      <div className="text-xs text-gray-500 italic mb-4">
        Este procedimiento requiere acceso directo al servidor.
      </div>

      {/* Botón para cerrar */}
      <button
        onClick={closeBackupAlert}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md font-semibold transition duration-200"
      >
        Entendido
      </button>
    </div>
  </div>
)}


      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Proyectos Activos"
          value={projectCount}
          icon={<FolderIcon size={24} className="text-gray-600" />}
        />
        <DashboardCard
          title="Personal"
          value={personnelCount}
          icon={<UsersIcon size={24} className="text-gray-600" />}
        />
        <DashboardCard
          title="Producción Mensual"
          value={`${monthlyProduction.toFixed(2)} t`}
          icon={<BarChart3Icon size={24} className="text-gray-600" />}
        />
      </div>

      {/* Tarjetas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full mr-4">
            <CalendarIcon size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Hoy es</p>
            <p className="text-xl font-medium">
              {new Date().toLocaleDateString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full mr-4">
            <SunIcon size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Clima estimado en zona industrial</p>
            <p className="text-xl font-medium">Soleado - 28°C</p>
          </div>
        </div>
      </div>

      {/* Sección de Visión y Misión */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 p-3 rounded-full mr-4">
              <EyeIcon size={24} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Nuestra Visión</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Ser la empresa líder en Colombia en el sector minero,
            reconocida por nuestra excelencia operacional, compromiso con la sostenibilidad
            ambiental y el desarrollo de nuestras comunidades, proyectándonos hacia
            mercados internacionales con estándares de clase mundial.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 p-3 rounded-full mr-4">
              <TargetIcon size={24} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Nuestra Misión</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Desarrollar proyectos mineros de alta calidad,
            utilizando tecnología avanzada y prácticas sostenibles, mientras
            generamos valor para nuestros accionistas, empleados y comunidades,
            manteniendo siempre los más altos estándares de seguridad y responsabilidad social.
          </p>
        </div>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
      </div>
    </div>
  );
};