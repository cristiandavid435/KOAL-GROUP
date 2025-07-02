import React from 'react';
import { BarChart3Icon, UsersIcon, FolderIcon, FileTextIcon } from 'lucide-react';
export const Dashboard: React.FC = () => {
  return <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Panel Principal</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Proyectos Activos</p>
              <p className="text-2xl font-semibold mt-1">12</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <FolderIcon size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Personal</p>
              <p className="text-2xl font-semibold mt-1">48</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <UsersIcon size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Producción Mensual</p>
              <p className="text-2xl font-semibold mt-1">1,250 t</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <BarChart3Icon size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Informes</p>
              <p className="text-2xl font-semibold mt-1">24</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <FileTextIcon size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Proyectos Recientes</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">Proyecto Minero {i}</p>
                  <p className="text-sm text-gray-500">
                    Actualizado hace {i} días
                  </p>
                </div>
                <span className="text-sm px-2 py-1 rounded-full bg-gray-100">
                  Activo
                </span>
              </div>)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">
            Producción por Proyecto
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Proyecto {i}</span>
                  <span className="text-sm text-gray-500">{20 * i}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-800 h-2 rounded-full" style={{
                width: `${20 * i}%`
              }}></div>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};