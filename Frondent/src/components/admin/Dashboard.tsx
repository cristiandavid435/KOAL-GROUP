import React, { useEffect, useState } from "react";
import api from "../../axiosInstance"; // asegúrate de importar el axiosInstance
import {
  BarChart3Icon,
  UsersIcon,
  FolderIcon,
  FileTextIcon,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const [projectCount, setProjectCount] = useState<number>(0);
  const [personnelCount, setPersonnelCount] = useState<number>(0);
  const [monthlyProduction, setMonthlyProduction] = useState<number>(0);
  const [reportsCount, setReportsCount] = useState<number>(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Proyectos activos
      const projectsRes = await api.get("projects/");
      const projectsData = projectsRes.data as any[];
      const activeProjects = projectsData.filter(
        (p: any) => p.status === "Activo"
      );
      setProjectCount(activeProjects.length);

      // Usuarios
      const usersRes = await api.get("users/");
      setPersonnelCount((usersRes.data as any[]).length);

      // Producción mensual
      const productionRes = await api.get("production-records/");
      const currentMonth = new Date().getMonth() + 1;
      const productionData = productionRes.data as any[];
      const monthlyTotal = productionData
        .filter((rec: any) => new Date(rec.date).getMonth() + 1 === currentMonth)
        .reduce((acc: number, rec: any) => acc + parseFloat(rec.quantity), 0);
      setMonthlyProduction(monthlyTotal);

      // Informes (dummy por ahora)
      setReportsCount(24); // este lo puedes conectar a un endpoint real si luego implementas reportes
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Panel Principal</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          value={`${monthlyProduction} t`}
          icon={<BarChart3Icon size={24} className="text-gray-600" />}
        />
        <DashboardCard
          title="Informes"
          value={reportsCount}
          icon={<FileTextIcon size={24} className="text-gray-600" />}
        />
      </div>

      {/* Puedes poner más paneles aquí si quieres */}
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
