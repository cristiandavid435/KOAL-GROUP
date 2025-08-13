import React, { useState, useEffect } from "react";
import axios from "../../../axiosInstance";
import Swal from 'sweetalert2';

interface GasRegistryFormProps {
  onCancel: () => void;
  onSave?: () => void;
  initialData?: {
    date: string;
    time: string;
    location: string;
    unit: string;
    observations: string;
    gases: {
      METANO?: { level: number; unit: string };
      CO?: { level: number; unit: string };
      CO2?: { level: number; unit: string };
      H2S?: { level: number; unit: string };
      OXYGEN?: { level: number; unit: string };
    };
    recordIds?: number[];
  };
}

export const GasRegistryForm: React.FC<GasRegistryFormProps> = ({ onCancel, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    unit: "PPM", // Valor por defecto, no visible en el frontend
    observations: "",
    methane: "0.0",
    carbonMonoxide: "0.0",
    carbonDioxide: "0.0",
    hydrogenSulfide: "0.0",
    oxygen: "0.0",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || "",
        time: initialData.time || "",
        location: initialData.location || "",
        unit: initialData.unit || "PPM", // Usar valor de initialData o PPM por defecto
        observations: initialData.observations || "",
        methane: initialData.gases?.METANO?.level?.toString() ?? "0.0",
        carbonMonoxide: initialData.gases?.CO?.level?.toString() ?? "0.0",
        carbonDioxide: initialData.gases?.CO2?.level?.toString() ?? "0.0",
        hydrogenSulfide: initialData.gases?.H2S?.level?.toString() ?? "0.0",
        oxygen: initialData.gases?.OXYGEN?.level?.toString() ?? "0.0",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateGasValues = () => {
    const gasFields = ["methane", "carbonMonoxide", "carbonDioxide", "hydrogenSulfide", "oxygen"];
    for (const field of gasFields) {
      const value = parseFloat(formData[field as keyof typeof formData]);
      if (isNaN(value) || value < 0) {
        return `El valor para ${field} debe ser un número válido mayor o igual a 0.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateGasValues();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      date: formData.date,
      time: formData.time,
      location: formData.location,
      unit: formData.unit, // Enviar PPM por defecto
      observations: formData.observations,
      readings: {
        METANO: parseFloat(formData.methane),
        CO: parseFloat(formData.carbonMonoxide),
        CO2: parseFloat(formData.carbonDioxide),
        H2S: parseFloat(formData.hydrogenSulfide),
        OXYGEN: parseFloat(formData.oxygen),
      },
    };

    try {
      if (initialData?.recordIds?.length) {
        for (const id of initialData.recordIds) {
          await axios.delete(`gas-records/${id}/`);
        }
        await axios.post("gas-records/registrar-multiples/", payload);
        Swal.fire({
               icon: 'success',
               title: '¡Actualización exitosa!',
               text:  'Registro actualizado exitosamente!!',
               confirmButtonColor: '#3085d6'
             })
      } else {
        await axios.post("gas-records/registrar-multiples/", payload);
        Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: 'Registro creado exitosamente!!',
                confirmButtonColor: '#3085d6'
              })
      }

      if (onSave) onSave();
      onCancel();
    } catch (error: any) {
      console.error("Error al guardar:", error);
      const errorMessage = error.response?.data?.detail || "Ocurrió un error al guardar los datos.";
      setError(errorMessage);
    }
  };

  return (
    <form className="space-y-4 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="">Seleccionar ubicación</option>
            <option value="mina-norte-a">Mina Norte - Sección A</option>
            <option value="mina-norte-b">Mina Norte - Sección B</option>
            <option value="mina-sur-a">Mina Sur - Sección A</option>
            <option value="mina-este-1">Mina Este - Galería 1</option>
            <option value="mina-oeste-2">Mina Oeste - Galería 2</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "CH₄", name: "methane" },
          { label: "CO", name: "carbonMonoxide" },
          { label: "CO₂", name: "carbonDioxide" },
          { label: "H₂S", name: "hydrogenSulfide" },
          { label: "O₂", name: "oxygen" },
        ].map((gas) => (
          <div key={gas.name}>
            <label className="block text-sm text-gray-600 mb-1">{gas.label}</label>
            <input
              type="text"
              name={gas.name}
              value={formData[gas.name as keyof typeof formData]}
              onChange={handleChange}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="0.0"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
        >
          {initialData ? "Actualizar Registro" : "Guardar Registro"}
        </button>
      </div>
    </form>
  );
};