import React, { useState } from 'react';
import { DownloadIcon, FileTextIcon, BarChart3Icon, PieChartIcon, FileIcon, UserIcon, FolderIcon } from 'lucide-react';
export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('production');
  const [project, setProject] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const handleGenerateReport = () => {
    // Here you would handle report generation
    console.log('Generating report:', {
      reportType,
      project,
      dateRange
    });
  };
  return <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Informes</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Generar Informe</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Informe
            </label>
            <select id="reportType" value={reportType} onChange={e => setReportType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
              <option value="production">Producción</option>
              <option value="personnel">Ingreso y Salida</option>
              <option value="project">Empleados</option>
             
            </select>
          </div>
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Proyecto
            </label>
            <select id="project" value={project} onChange={e => setProject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
              <option value="">Todos los Proyectos</option>
              <option value="1">Mina Norte</option>
              <option value="2">Proyecto Sur</option>
              <option value="3">Excavación Este</option>
              <option value="4">Mina Occidental</option>
              <option value="5">Proyecto Central</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicial
              </label>
              <input type="date" id="startDate" value={dateRange.start} onChange={e => setDateRange(prev => ({
              ...prev,
              start: e.target.value
            }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Final
              </label>
              <input type="date" id="endDate" value={dateRange.end} onChange={e => setDateRange(prev => ({
              ...prev,
              end: e.target.value
            }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" />
            </div>
          </div>
          <div className="pt-2">
            <button onClick={handleGenerateReport} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
              <BarChart3Icon size={16} />
              <span>Generar Informe</span>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Informes Recientes</h3>
        <div className="space-y-3">
          {[{
          id: 1,
          name: 'Informe de Producción - Junio 2023',
          type: 'production',
          date: '30/06/2023'
        }, {
          id: 2,
          name: 'Informe de Personal - Junio 2023',
          type: 'personnel',
          date: '30/06/2023'
        }, {
          id: 3,
          name: 'Informe de Proyecto - Mina Norte',
          type: 'project',
          date: '15/06/2023'
        }, {
          id: 4,
          name: 'Informe Financiero - Q2 2023',
          type: 'financial',
          date: '01/07/2023'
        }].map(report => <div key={report.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md border border-gray-100">
              <div className="flex items-center">
                {report.type === 'production' ? <BarChart3Icon size={20} className="text-gray-500 mr-3" /> : report.type === 'personnel' ? <UserIcon size={20} className="text-gray-500 mr-3" /> : report.type === 'project' ? <FolderIcon size={20} className="text-gray-500 mr-3" /> : <PieChartIcon size={20} className="text-gray-500 mr-3" />}
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-gray-500">
                    Generado el {report.date}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
                <DownloadIcon size={16} />
                <span className="text-sm">Descargar</span>
              </button>
            </div>)}
        </div>
      </div>
    </div>;
};