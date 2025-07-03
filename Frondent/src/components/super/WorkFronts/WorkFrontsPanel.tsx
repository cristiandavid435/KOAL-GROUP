import React, { useEffect, useState } from "react";
import axios from "../../../axiosInstance";
import { WorkFrontForm } from "./WorkFrontForm";
import { PlusIcon } from "lucide-react";

export const WorkFrontsPanel: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [workFronts, setWorkFronts] = useState<any[]>([]);

  // Trae los frentes de trabajo de la API
  const fetchWorkFronts = () => {
    axios
      .get<any[]>("workfronts/")
      .then((response) => {
        setWorkFronts(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los frentes de trabajo:", error);
      });
  };

  useEffect(() => {
    fetchWorkFronts(); // Llamada inicial para obtener los frentes
  }, []);

  // Función para guardar un nuevo frente
  const handleSaveWorkFront = async (data: any) => {
    try {
      const response = await axios.post("workfronts/", data); // Guardar en la API
      setWorkFronts((prev) => [...prev, response.data]); // Actualiza la lista de frentes
      setShowForm(false); // Cierra el formulario después de guardar
    } catch (error) {
      console.error("Error al guardar el frente:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Frentes de Trabajo</h1>
        <button
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          onClick={() => setShowForm(true)}
        >
          <PlusIcon className="mr-2" size={16} />
          Nuevo Frente
        </button>
      </div>

      {showForm && (
        <WorkFrontForm onCancel={() => setShowForm(false)} onSave={handleSaveWorkFront} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workFronts.map((front) => (
          <div key={front.id} className="p-4 bg-white rounded shadow-md">
            <h2 className="font-semibold text-gray-800">{front.name}</h2>
            <p className="text-sm text-gray-600">{front.location}</p>
            <p className="text-xs text-gray-500">{front.status}</p>
            <p className="text-xs text-gray-500">Inicio: {front.start_date}</p>
            <p className="text-xs text-gray-500">Fin Estimada: {front.estimated_end_date}</p>
            <p className="text-xs text-gray-500">Trabajadores: {front.workers}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
