import React, { useState, useEffect } from "react";
import axios from "../../../axiosInstance";
import { GasRegistryForm } from "./GasRegistryForm";
import { SearchIcon, Edit, EyeOff, Eye } from "lucide-react";
import Swal from 'sweetalert2';

interface GasRecord {
  id: number;
  date: string;
  time: string;
  location: string;
  gas_type: "METANO" | "CO" | "CO2" | "H2S" | "OXYGEN";
  level: number;
  observations: string;
  is_active?: boolean; // Nuevo campo para el estado activo/inactivo
}

interface GroupedRecord {
  key: string;
  date: string;
  time: string;
  location: string;
  observations: string;
  gases: {
    METANO?: number;
    CO?: number;
    CO2?: number;
    H2S?: number;
    OXYGEN?: number;
  };
  recordIds: number[];
  is_active: boolean; // Nuevo campo para el estado del grupo
}

const formatLocation = (raw: string): string => {
  const map: Record<string, string> = {
    "mina-norte-a": "Mina Norte - Sección A",
    "mina-norte-b": "Mina Norte - Sección B",
    "mina-sur-a": "Mina Sur - Sección A",
    "mina-este-1": "Mina Este - Galería 1",
    "mina-oeste-2": "Mina Oeste - Galería 2",
  };
  return map[raw] ?? raw;
};

const GasRegistryPanel: React.FC = () => {
  const [gasRecords, setGasRecords] = useState<GroupedRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<GroupedRecord[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GroupedRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false); // Nuevo estado para mostrar/ocultar inactivos

  const fetchGasRecords = () => {
    setLoading(true);
    axios
      .get<GasRecord[]>("gas-records/")
      .then((response) => {
        console.log("Datos recibidos del servidor:", response.data);
        
        // Verificar si algún registro tiene is_active definido
        const hasActiveField = response.data.some(record => 'is_active' in record);
        console.log("¿Los registros tienen campo is_active?", hasActiveField);
        
        // Mostrar los primeros registros para debugging
        if (response.data.length > 0) {
          console.log("Primer registro completo:", response.data[0]);
          console.log("Campos disponibles en el primer registro:", Object.keys(response.data[0]));
        }
        
        const grouped = groupGasRecords(response.data);
        console.log("Datos agrupados:", grouped);
        setGasRecords(grouped);
        setFilteredRecords(grouped);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener los registros de gas:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGasRecords();
  }, []);

  useEffect(() => {
    const filtered = gasRecords.filter((record) => {
      const searchText = search.toLowerCase().trim();
      const displayLocation = formatLocation(record.location).toLowerCase();
      const matchesSearch = displayLocation.includes(searchText);
      
      // Filtrar por estado activo/inactivo
      const matchesActiveFilter = showInactive || record.is_active;
      
      console.log(`Registro ${record.key}: activo=${record.is_active}, mostrar=${matchesActiveFilter}, showInactive=${showInactive}`);
      
      return matchesSearch && matchesActiveFilter;
    });
    
    console.log("Registros filtrados:", filtered);
    setFilteredRecords(filtered);
  }, [search, gasRecords, showInactive]);

  const groupGasRecords = (records: GasRecord[]): GroupedRecord[] => {
    const groupedMap: Record<string, GroupedRecord> = {};

    for (const record of records) {
      const key = `${record.date}|${record.time}|${record.location}`;
      if (!groupedMap[key]) {
        groupedMap[key] = {
          key,
          date: record.date,
          time: record.time,
          location: record.location,
          observations: record.observations,
          gases: {},
          recordIds: [],
          is_active: true, // Inicialmente activo
        };
      }
      groupedMap[key].gases[record.gas_type] = record.level;
      groupedMap[key].recordIds.push(record.id);
    }

    // Determinar el estado del grupo después de procesar todos los registros
    for (const group of Object.values(groupedMap)) {
      const groupRecords = records.filter(record => group.recordIds.includes(record.id));
      // Si TODOS los registros del grupo están inactivos, el grupo se considera inactivo
      group.is_active = groupRecords.some(record => record.is_active !== false);
    }

    return Object.values(groupedMap).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const handleSave = () => {
    fetchGasRecords();
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: GroupedRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleToggleActive = async (record: GroupedRecord) => {
  const action = record.is_active ? "inactivar" : "activar";

  const result = await Swal.fire({
    title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} este registro?`,
    text: `¿Estás seguro de que quieres ${action} este registro?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Sí, ${action}`,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  });

  if (!result.isConfirmed) return;

  try {
    const newActiveState = !record.is_active;

    console.log(`Intentando ${action} registros:`, record.recordIds);
    console.log(`Nuevo estado: is_active=${newActiveState}`);

    const updatePromises = record.recordIds.map(async (id) => {
      console.log(`Actualizando registro ${id} con is_active=${newActiveState}`);
      const response = await axios.patch(`gas-records/${id}/`, {
        is_active: newActiveState
      });
      console.log(`Respuesta del servidor para registro ${id}:`, response.data);
      return response;
    });

    await Promise.all(updatePromises);

    console.log("Todas las actualizaciones completadas, refrescando datos...");

    Swal.fire({
      icon: 'success',
      title: `Registro ${action === 'inactivar' ? 'inactivado' : 'activado'} correctamente`,
      showConfirmButton: false,
      timer: 2000
    });

    fetchGasRecords();

  } catch (error) {
    console.error(`Error al ${action} registros:`, error);

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `Ocurrió un error al ${action} los registros.`,
      confirmButtonColor: '#d33'
    });
  }
};


  if (loading) {
    return <div className="text-center text-gray-500">Cargando registros de gas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Registros de Gases</h1>
        <div className="flex gap-2 w-full md:w-auto items-center">
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <button
            className={`px-4 py-2 rounded-md transition ${
              showInactive 
                ? "bg-orange-600 text-white hover:bg-orange-700" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setShowInactive(!showInactive)}
            title={showInactive ? "Ocultar inactivos" : "Mostrar inactivos"}
          >
            {showInactive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
            onClick={() => {
              setEditingRecord(null);
              setShowForm(true);
            }}
          >
            Nuevo Registro
          </button>
        </div>
      </div>

      {showForm && (
        <GasRegistryForm
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
          onSave={handleSave}
          initialData={editingRecord ?? undefined}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 border border-gray-300">Estado</th>
                <th className="py-3 px-4 border border-gray-300">Fecha</th>
                <th className="py-3 px-4 border border-gray-300">Hora</th>
                <th className="py-3 px-4 border border-gray-300">Ubicación</th>
                <th className="py-3 px-4 border border-gray-300">CH₄ %</th>
                <th className="py-3 px-4 border border-gray-300">CO ppm</th>
                <th className="py-3 px-4 border border-gray-300">CO₂ %</th>
                <th className="py-3 px-4 border border-gray-300">H₂S ppm</th>
                <th className="py-3 px-4 border border-gray-300">O₂ %</th>
                <th className="py-3 px-4 border border-gray-300">Observaciones</th>
                <th className="py-3 px-4 border border-gray-300 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr 
                  key={record.key} 
                  className={`hover:bg-gray-50 ${
                    !record.is_active ? "bg-gray-100 text-gray-500" : ""
                  }`}
                >
                  <td className="py-3 px-4 border border-gray-300">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {record.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 border border-gray-300">{record.date}</td>
                  <td className="py-3 px-4 border border-gray-300">{record.time}</td>
                  <td className="py-3 px-4 border border-gray-300">{formatLocation(record.location)}</td>
                  <td className="py-3 px-4 border border-gray-300">{record.gases.METANO ?? "-"}</td>
                  <td className="py-3 px-4 border border-gray-300">{record.gases.CO ?? "-"}</td>
                  <td className="py-3 px-4 border border-gray-300">{record.gases.CO2 ?? "-"}</td>
                  <td className="py-3 px-4 border border-gray-300">{record.gases.H2S ?? "-"}</td>
                  <td className="py-3 px-4 border border-gray-300">{record.gases.OXYGEN ?? "-"}</td>
                  <td className="py-3 px-4 border border-gray-300">{record.observations}</td>
                  <td className="py-3 px-4 border border-gray-300 text-center">
                    <div className="flex space-x-2 justify-center">
                      <button
                        className="p-2 rounded-md text-blue-600 hover:bg-blue-100 transition"
                        onClick={() => handleEdit(record)}
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className={`p-2 rounded-md transition ${
                          record.is_active
                            ? "text-red-600 hover:bg-red-100"
                            : "text-green-600 hover:bg-green-100"
                        }`}
                        onClick={() => handleToggleActive(record)}
                        title={record.is_active ? "Inactivar" : "Activar"}
                      >
                        {record.is_active ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-4 text-gray-500 border border-gray-300">
                    No se encontraron registros para esa ubicación.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
  <h2 className="text-lg font-semibold mb-4">Límites Permisibles por Tipo de Gas</h2>
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden shadow-md">
      <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
        <tr>
          <th className="py-3 px-4 border border-gray-300">Gas</th>
          <th className="py-3 px-4 border border-gray-300">Unidad</th>
          <th className="py-3 px-4 border border-gray-300">Límite Permisible</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-3 px-4 border border-gray-300">Metano (CH₄)</td>
          <td className="py-3 px-4 border border-gray-300">%</td>
          <td className="py-3 px-4 border border-gray-300">1 %</td>
        </tr>
        <tr>
          <td className="py-3 px-4 border border-gray-300">Monóxido de Carbono (CO)</td>
          <td className="py-3 px-4 border border-gray-300">ppm</td>
          <td className="py-3 px-4 border border-gray-300">25 ppm</td>
        </tr>
        <tr>
          <td className="py-3 px-4 border border-gray-300">Dióxido de Carbono (CO₂)</td>
          <td className="py-3 px-4 border border-gray-300">%</td>
          <td className="py-3 px-4 border border-gray-300">0.5 %</td>
        </tr>
        <tr>
          <td className="py-3 px-4 border border-gray-300">Sulfuro de Hidrógeno (H₂S)</td>
          <td className="py-3 px-4 border border-gray-300">ppm</td>
          <td className="py-3 px-4 border border-gray-300">1 ppm</td>
        </tr>
        <tr>
          <td className="py-3 px-4 border border-gray-300">Oxígeno (O₂)</td>
          <td className="py-3 px-4 border border-gray-300">%</td>
          <td className="py-3 px-4 border border-gray-300">19.5 %</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export { GasRegistryPanel };
export default GasRegistryPanel;