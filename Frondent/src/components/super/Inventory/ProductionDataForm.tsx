import React, { useState, useEffect } from "react";
import axios from "../../../axiosInstance"; // Asegúrate de que axiosInstance esté configurado correctamente

interface ProductionDataFormProps {
  onCancel: () => void;
}

export const ProductionDataForm: React.FC<ProductionDataFormProps> = ({ onCancel }) => {
  const [workFronts, setWorkFronts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    date: "",
    materialType: "",
    quantity: "",
    quality: "",
    supervisor: "",
    workFront: "", // Esto almacenará el ID o nombre del trabajo
    observations: "",
  });

  useEffect(() => {
    // Obtener los frentes de trabajo desde la API
    axios.get<any[]>("workfronts/").then((res) => {
      setWorkFronts(res.data); // Guardamos los frentes de trabajo en el estado
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productionData = {
      date: formData.date,
      material_type: formData.materialType,
      quantity: formData.quantity,
      quality: formData.quality,
      supervisor: formData.supervisor,
      workfront: formData.workFront,
      observations: formData.observations,
    };

    console.log(productionData); // Verifica los datos antes de enviarlos

    try {
      // Enviar el formulario a la API para registrar la producción
      const response = await axios.post("production-records/", productionData); // Registrar la producción en la API
      console.log(response.data); // Verifica la respuesta de la API
    } catch (error) {
      console.error("Error al registrar los datos de producción:", error);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Frente de Trabajo</label>
          <select
            name="workFront"
            value={formData.workFront}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccionar frente</option>
            {workFronts.map((front) => (
              <option key={front.id} value={front.name}>
                {front.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo de Material</label>
          <select
            name="materialType"
            value={formData.materialType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccionar material</option>
            <option value="Carbón Tipo A">Carbón Tipo A</option>
            <option value="Carbón Tipo B">Carbón Tipo B</option>
            <option value="Carbón Tipo C">Carbón Tipo C</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Cantidad</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Calidad</label>
          <select
            name="quality"
            value={formData.quality}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccionar calidad</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Supervisor</label>
          <input
            type="text"
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Observaciones</label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="border px-4 py-2 rounded-md">
          Cancelar
        </button>
        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md">
          Guardar
        </button>
      </div>
    </form>
  );
};
