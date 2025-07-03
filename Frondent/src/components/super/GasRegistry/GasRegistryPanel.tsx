// GasRegistryPanel.tsx
import React, { useState, useEffect } from "react";
import axios from "../../../axiosInstance"; // Asegúrate de que axiosInstance esté configurado correctamente
import { GasRegistryForm } from "./GasRegistryForm"; // Importa el formulario de Gas

interface GasRegistryRecord {
  id: number;
  date: string;
  time: string;
  location: string;
  methane: string;
  carbon_monoxide: string;
  carbon_dioxide: string;
  hydrogen_sulfide: string;
  oxygen: string;
  supervisor: string;
  observations: string;
}

const GasRegistryPanel: React.FC = () => {
  const [gasRecords, setGasRecords] = useState<GasRegistryRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGasRecords = () => {
    axios
      .get<GasRegistryRecord[]>("gas-records/")
      .then((response) => {
        setGasRecords(response.data); // Guardamos los registros de gas
        setLoading(false); // Finalizamos el estado de carga
      })
      .catch((error) => {
        console.error("Error al obtener los registros de gas:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGasRecords(); // Llamada inicial para obtener los registros de gas
  }, []);

  const handleSaveGasRecord = (newRecord: GasRegistryRecord) => {
    setGasRecords((prev) => [...prev, newRecord]); // Agrega el nuevo registro a la lista existente
    setShowForm(false); // Cierra el formulario después de guardar
  };

  if (loading) {
    return <div className="text-center text-gray-500">Cargando registros de gas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Registros de Gases</h1>
        <button
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          onClick={() => setShowForm(true)}
        >
          Nuevo Registro de Gas
        </button>
      </div>

      {showForm && (
        <GasRegistryForm
          onCancel={() => setShowForm(false)}
          onSave={handleSaveGasRecord}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">Fecha</th>
                <th className="py-3 px-4 text-left">Hora</th>
                <th className="py-3 px-4 text-left">Ubicación</th>
                <th className="py-3 px-4 text-left">Metano (CH₄)</th>
                <th className="py-3 px-4 text-left">Monóxido de Carbono (CO)</th>
                <th className="py-3 px-4 text-left">Dióxido de Carbono (CO₂)</th>
                <th className="py-3 px-4 text-left">Sulfuro de Hidrógeno (H₂S)</th>
                <th className="py-3 px-4 text-left">Oxígeno (O₂)</th>
                <th className="py-3 px-4 text-left">Supervisor</th>
                <th className="py-3 px-4 text-left">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {gasRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{record.date}</td>
                  <td className="py-3 px-4">{record.time}</td>
                  <td className="py-3 px-4">{record.location}</td>
                  <td className="py-3 px-4">{record.methane}</td>
                  <td className="py-3 px-4">{record.carbon_monoxide}</td>
                  <td className="py-3 px-4">{record.carbon_dioxide}</td>
                  <td className="py-3 px-4">{record.hydrogen_sulfide}</td>
                  <td className="py-3 px-4">{record.oxygen}</td>
                  <td className="py-3 px-4">{record.supervisor}</td>
                  <td className="py-3 px-4">{record.observations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Exportamos el componente para que pueda ser usado en otros archivos
export { GasRegistryPanel };
export default GasRegistryPanel;
