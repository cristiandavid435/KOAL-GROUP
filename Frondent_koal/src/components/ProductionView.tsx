import React, { useState } from 'react';
import { BarChart3Icon, CalendarIcon, UserIcon } from 'lucide-react';
export const ProductionView: React.FC = () => {
  const [viewType, setViewType] = useState('monthly');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  // Dummy production data
  const productionData = [{
    month: 'Enero',
    value: 120
  }, {
    month: 'Febrero',
    value: 150
  }, {
    month: 'Marzo',
    value: 180
  }, {
    month: 'Abril',
    value: 200
  }, {
    month: 'Mayo',
    value: 220
  }, {
    month: 'Junio',
    value: 190
  }];
  const maxValue = Math.max(...productionData.map(item => item.value));
  return <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Producción</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <button onClick={() => setViewType('monthly')} className={`flex items-center gap-2 px-4 py-2 rounded ${viewType === 'monthly' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
              <CalendarIcon size={16} />
              <span>Por Mes</span>
            </button>
            <button onClick={() => setViewType('project')} className={`flex items-center gap-2 px-4 py-2 rounded ${viewType === 'project' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
              <BarChart3Icon size={16} />
              <span>Por Proyecto</span>
            </button>
            <button onClick={() => setViewType('individual')} className={`flex items-center gap-2 px-4 py-2 rounded ${viewType === 'individual' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
              <UserIcon size={16} />
              <span>Individual</span>
            </button>
          </div>
          <div className="flex space-x-4">
            {viewType === 'project' && <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
                <option value="">Todos los meses</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
              </select>}
            {viewType === 'monthly' && <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
                <option value="">Todos los proyectos</option>
                <option value="1">Mina Norte</option>
                <option value="2">Proyecto Sur</option>
                <option value="3">Excavación Este</option>
                <option value="4">Mina Occidental</option>
                <option value="5">Proyecto Central</option>
              </select>}
            {viewType === 'individual' && <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
                <option value="">Seleccionar empleado</option>
                <option value="1">Juan Pérez</option>
                <option value="2">María López</option>
                <option value="3">Carlos Rodríguez</option>
                <option value="4">Ana Martínez</option>
                <option value="5">Luis Gómez</option>
              </select>}
          </div>
        </div>
        <div className="h-80">
          <div className="flex h-full items-end">
            {productionData.map((item, index) => <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full mx-1 bg-gray-800" style={{
              height: `${item.value / maxValue * 100}%`
            }}></div>
                <div className="text-xs mt-2">{item.month}</div>
                <div className="text-sm font-medium">{item.value} t</div>
              </div>)}
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Detalles de Producción</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad (t)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variación
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[{
            month: 'Junio',
            project: 'Mina Norte',
            amount: 85,
            change: '+5%'
          }, {
            month: 'Junio',
            project: 'Proyecto Sur',
            amount: 45,
            change: '-2%'
          }, {
            month: 'Junio',
            project: 'Excavación Este',
            amount: 60,
            change: '+10%'
          }, {
            month: 'Mayo',
            project: 'Mina Norte',
            amount: 80,
            change: '+8%'
          }, {
            month: 'Mayo',
            project: 'Proyecto Sur',
            amount: 46,
            change: '+3%'
          }, {
            month: 'Mayo',
            project: 'Excavación Este',
            amount: 54,
            change: '-5%'
          }].map((item, index) => <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{item.month}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">{item.project}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900 font-medium">{item.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.change}
                  </span>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
};