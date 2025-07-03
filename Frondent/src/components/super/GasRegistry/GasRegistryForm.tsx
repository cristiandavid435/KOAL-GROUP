import React, { useState } from "react";
import axios from "../../../axiosInstance"; // Asegúrate de que axiosInstance esté configurado correctamente

interface GasRegistryFormProps {
  onCancel: () => void;
}

export const GasRegistryForm: React.FC<GasRegistryFormProps> = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    methane: "0.0",
    carbonMonoxide: "0.0",
    carbonDioxide: "0.0",
    hydrogenSulfide: "0.0",
    oxygen: "0.0",
    supervisor: "",
    observations: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gasData = {
        date: formData.date,
        time: formData.time,
        location: formData.location,
        methane: formData.methane,
        carbon_monoxide: formData.carbonMonoxide,
        carbon_dioxide: formData.carbonDioxide,
        hydrogen_sulfide: formData.hydrogenSulfide,
        oxygen: formData.oxygen,
        supervisor: formData.supervisor,
        observations: formData.observations,
      };

      await axios.post("gas-records/", gasData); // Registrar el gas en la API
      console.log("Registro de gas guardado exitosamente");
    } catch (error) {
      console.error("Error al registrar los gases:", error);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccionar ubicación</option>
            <option value="mina-norte-a">Mina Norte - Sección A</option>
            <option value="mina-norte-b">Mina Norte - Sección B</option>
            <option value="mina-sur-a">Mina Sur - Sección A</option>
            <option value="mina-este-1">Mina Este - Galería 1</option>
            <option value="mina-oeste-2">Mina Oeste - Galería 2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registrado por</label>
          <input
            type="text"
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Nombre del supervisor"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Concentraciones de Gases</label>
        <table className="w-full border border-gray-300 text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100 border px-2 py-1">
              <th className="border px-2 py-1">Metano (CH₄)</th>
              <th className="border px-2 py-1">Monóxido de Carbono (CO)</th>
              <th className="border px-2 py-1">Dióxido de Carbono (CO₂)</th>
              <th className="border px-2 py-1">Sulfuro de Hidrógeno (H₂S)</th>
              <th className="border px-2 py-1">Oxígeno (O₂)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    name="methane"
                    value={formData.methane}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="0.0"
                  />
                  <select
                    className="px-1 py-1 border border-gray-300 rounded-md"
                    defaultValue="%"
                  >
                    <option value="%">%</option>
                    <option value="ppm">ppm</option>
                  </select>
                </div>
              </td>
              <td className="border px-2 py-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    name="carbonMonoxide"
                    value={formData.carbonMonoxide}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="0.0"
                  />
                  <select
                    className="px-1 py-1 border border-gray-300 rounded-md"
                    defaultValue="%"
                  >
                    <option value="%">%</option>
                    <option value="ppm">ppm</option>
                  </select>
                </div>
              </td>
              <td className="border px-2 py-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    name="carbonDioxide"
                    value={formData.carbonDioxide}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="0.0"
                  />
                  <select
                    className="px-1 py-1 border border-gray-300 rounded-md"
                    defaultValue="%"
                  >
                    <option value="%">%</option>
                    <option value="ppm">ppm</option>
                  </select>
                </div>
              </td>
              <td className="border px-2 py-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    name="hydrogenSulfide"
                    value={formData.hydrogenSulfide}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="0.0"
                  />
                  <select
                    className="px-1 py-1 border border-gray-300 rounded-md"
                    defaultValue="%"
                  >
                    <option value="%">%</option>
                    <option value="ppm">ppm</option>
                  </select>
                </div>
              </td>
              <td className="border px-2 py-1">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    name="oxygen"
                    value={formData.oxygen}
                    onChange={handleChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    placeholder="0.0"
                  />
                  <select
                    className="px-1 py-1 border border-gray-300 rounded-md"
                    defaultValue="%"
                  >
                    <option value="%">%</option>
                    <option value="ppm">ppm</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
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
          Guardar Registro
        </button>
      </div>
    </form>
  );
};
