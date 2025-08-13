import React, { useEffect, useState } from "react";
import axios from "../../../axiosInstance";
import { WorkFrontForm } from "./WorkFrontForm";
import { PlusIcon, Edit, Eye, EyeOff } from "lucide-react";

import Swal from 'sweetalert2';

export const WorkFrontsPanel: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [workFronts, setWorkFronts] = useState<any[]>([]);
  const [editingWorkFront, setEditingWorkFront] = useState<any | null>(null);

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
    fetchWorkFronts();
  }, []);

  const handleSaveWorkFront = async (data: any) => {
    try {
      if (editingWorkFront) {
        // Editar
        const response = await axios.put(`workfronts/${editingWorkFront.id}/`, data);
        setWorkFronts((prev) =>
          prev.map((front) => (front.id === editingWorkFront.id ? response.data : front))
        );
      } else {
        // Crear
        const response = await axios.post("workfronts/", data);
        setWorkFronts((prev) => [...prev, response.data]);
      }

      setShowForm(false);
      setEditingWorkFront(null);
    } catch (error) {
      console.error("Error al guardar el frente:", error);
    }
  };

  const handleEdit = (front: any) => {
    setEditingWorkFront(front);
    setShowForm(true);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
  const action = currentStatus ? 'inactivar' : 'activar';
  const confirmMessage = `¿Estás seguro de ${action} este frente de trabajo?`;

  const result = await Swal.fire({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} frente de trabajo`,
    text: confirmMessage,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Sí, ${action}`,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await axios.patch(`workfronts/${id}/`, {
      is_active: !currentStatus
    });

    setWorkFronts((prev) =>
      prev.map((front) =>
        front.id === id ? response.data : front
      )
    );

    Swal.fire({
      icon: 'success',
      title: `Frente ${action === 'inactivar' ? 'inactivado' : 'activado'} correctamente`,
      showConfirmButton: false,
      timer: 2000
    });

  } catch (error) {
    console.error(`Error al ${action} el frente:`, error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `No se pudo ${action} el frente.`,
      confirmButtonColor: '#d33'
    });
  }
};


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Frentes de Trabajo</h1>
        <button
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          onClick={() => {
            setEditingWorkFront(null);
            setShowForm(true);
          }}
        >
          <PlusIcon className="mr-2" size={16} />
          Nuevo Frente
        </button>
      </div>

      {showForm && (
        <WorkFrontForm
          onCancel={() => {
            setShowForm(false);
            setEditingWorkFront(null);
          }}
          onSave={handleSaveWorkFront}
          initialData={editingWorkFront || undefined}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workFronts.map((front) => (
          <div
              key={front.id}
              className={`p-4 bg-white rounded-2xl shadow-lg border border-gray-200 relative hover:shadow-xl transition duration-300 ${
                front.is_active === false ? 'opacity-60 bg-gray-50' : ''
              }`}
            >
              {/* Botones de acción */}
             <div className="relative p-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition">
  {/* Botones de acción */}
  <div className="absolute top-3 right-3 flex space-x-2">
    <button
      className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition"
      onClick={() => handleEdit(front)}
      title="Editar"
    >
      <Edit size={18} />
    </button>
    <button
      className={`p-2 rounded-full transition ${
        front.is_active 
          ? 'text-orange-600 hover:bg-orange-100' 
          : 'text-green-600 hover:bg-green-100'
      }`}
      onClick={() => handleToggleActive(front.id, front.is_active)}
      title={front.is_active ? "Inactivar" : "Activar"}
    >
      {front.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {/* Contenido del frente */}
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-3">
      {front.name}
      {front.is_active === false && (
        <span className="ml-2 text-sm bg-gray-400 text-white px-2 py-1 rounded-full">
          Inactivo
        </span>
      )}
    </h2>
    <p className="text-base text-gray-900 mb-2">
      <span className="font-semibold">Ubicación:</span> {front.location}
    </p>
    <p className="text-sm text-gray-900 mb-2">
      <span className="font-semibold">Estado:</span> 
      <span className={front.status === 'inactivo' ? 'text-gray-500' : ''}>
        {front.status}
      </span>
    </p>
    <p className="text-sm text-gray-900 mb-2">
      <span className="font-semibold">Inicio:</span> {front.start_date}
    </p>
    <p className="text-sm text-gray-900 mb-2">
      <span className="font-semibold">Fin Estimada:</span> {front.estimated_end_date}
    </p>
    <p className="text-sm text-gray-900">
      <span className="font-semibold">Trabajadores:</span> {front.workers}
    </p>
  </div>
</div>

            </div>
        ))}
      </div>
    </div>
  );
};