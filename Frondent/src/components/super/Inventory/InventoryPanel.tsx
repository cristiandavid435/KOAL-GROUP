import React, { useEffect, useState } from "react";
import axios from "../../../axiosInstance"; // Asegúrate de que axiosInstance esté configurado correctamente
import { ProductionDataForm } from "./ProductionDataForm"; // Importa el formulario de producción

interface InventoryItem {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  location: string;
  lastUpdated: string;
  status: string;
}

export const InventoryPanel: React.FC = () => {
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // Obtener los ítems de inventario desde la API
    axios
      .get<InventoryItem[]>("inventory-items/")  // Reemplazar con el endpoint correcto de inventario
      .then((res) => {
        setInventoryItems(res.data); // Guardamos los ítems de inventario
      })
      .catch((error) => {
        console.error("Error al obtener los ítems de inventario:", error);
      });
  }, []);

  // Filtrar los ítems
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? item.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['Material', 'Cantidad', 'Unidad', 'Ubicación', 'Última Actualización', 'Estado'];
    const rows = filteredItems.map((item) => [
      `"${item.name}"`,
      `"${item.quantity}"`,
      `"${item.unit}"`,
      `"${item.location}"`,
      `"${item.lastUpdated}"`,
      `"${item.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventario_actual.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Producción</h1>
        <button
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          onClick={() => setShowProductionForm(true)}
        >
          Agregar Datos de Producción
        </button>
      </div>

      {showProductionForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Nuevo Registro de Producción</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowProductionForm(false)}
            >
              ✕
            </button>
          </div>
          <ProductionDataForm onCancel={() => setShowProductionForm(false)} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold mr-3">Inventario Actual</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 w-full">
            <input
              type="text"
              placeholder="Buscar por material, ubicación o unidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500 w-full"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500 w-full"
            >
              <option value="">Todos los estados</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </select>
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">Material</th>
                <th className="py-3 px-4 text-left">Cantidad</th>
                <th className="py-3 px-4 text-left">Unidad</th>
                <th className="py-3 px-4 text-left">Ubicación</th>
                <th className="py-3 px-4 text-left">Última Actualización</th>
                <th className="py-3 px-4 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">{item.unit}</td>
                  <td className="py-3 px-4">{item.location}</td>
                  <td className="py-3 px-4">{item.lastUpdated}</td>
                  <td className="py-3 px-4">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
