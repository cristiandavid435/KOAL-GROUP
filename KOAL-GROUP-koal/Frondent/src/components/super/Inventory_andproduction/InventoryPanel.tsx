import React, { useEffect, useState } from "react";
import { SearchIcon, Edit } from "lucide-react";
import axios from "../../../axiosInstance";
import { ProductionDataForm } from "./ProductionDataForm";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Import the image directly
import logoImage from '../../../assets/hola.png'; // Adjust path based on your project structure

import Swal from 'sweetalert2';

interface ProductionRecord {
  id: number;
  date: string;
  material_type: string;
  quantity: number;
  unit: string;
  quality: string;
  employee: {
    id: number;
    names: string;
  };
  project: {
    id: number;
    name: string;
  };
  observations: string;
}

export const InventoryPanel: React.FC = () => {
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryItems, setInventoryItems] = useState<ProductionRecord[]>([]);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<ProductionRecord | null>(null);

  const fetchData = () => {
    axios
      .get<ProductionRecord[]>("/production-records/")
      .then((res) => {
        setInventoryItems(res.data);
      })
      .catch((error) => {
        console.error("Error al obtener los registros de producción:", error);
        alert("Error al obtener los datos");
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = inventoryItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.material_type.toLowerCase().includes(term) ||
      item.unit.toLowerCase().includes(term) ||
      item.quality?.toLowerCase().includes(term) ||
      item.observations?.toLowerCase().includes(term) ||
      item.employee?.names?.toLowerCase().includes(term)
    );
  });

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Producción");

    // --- Header Section Adjustments ---

    // Set row heights for the header area to better accommodate the logo
    worksheet.getRow(1).height = 20; // Row for logo (part 1)
    worksheet.getRow(2).height = 20; // Row for logo (part 2)
    worksheet.getRow(3).height = 20; // Row for logo (part 3)
    worksheet.getRow(4).height = 20; // Row for logo (part 4)

    // "KOAL GROUP" will remain centered starting from B1
    worksheet.mergeCells('B1', 'H1');
    worksheet.getCell('B1').value = 'KOAL GROUP';
    worksheet.getCell('B1').font = { bold: true, size: 16 };
    worksheet.getCell('B1').alignment = { horizontal: 'center' };

    // "REPORTE DE REGISTROS DE PRODUCCIÓN" will remain centered starting from B2
    worksheet.mergeCells('B2', 'H2');
    worksheet.getCell('B2').value = 'REPORTE DE REGISTROS DE PRODUCCIÓN';
    worksheet.getCell('B2').alignment = { horizontal: 'center' };

    // Shift contact information to start from A5
    worksheet.getCell('A5').value = `Fecha de generación: ${new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
    worksheet.getCell('A6').value = `Ubicación: Sogamoso, Boyacá, Colombia`;
    worksheet.getCell('A7').value = `Contacto: Soporte Técnico Koal Group`;

    // --- End Header Section Adjustments ---

    // Add a blank row after the contact info and before table headers
    // The table headers will now start on row 9, similar to previous version to maintain consistent spacing.
    worksheet.addRow([]); // Adds a blank row after contact info (Row 8)
    const headersRow = worksheet.addRow([
      'Fecha', 'Material', 'Cantidad', 'Unidad',
      'Calidad', 'Empleado', 'Proyecto', 'Observaciones'
    ]);

    // Apply styling to headers (optional, but good practice)
    headersRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' } // Light gray background
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos
    filteredItems.forEach((item) => {
      worksheet.addRow([
        item.date,
        item.material_type,
        item.quantity,
        item.unit,
        item.quality,
        item.employee?.names || "N/A",
        item.project?.name || "N/A",
        item.observations || "",
      ]);
    });

    // Ajustar ancho de columnas
    worksheet.columns.forEach((col) => {
      col.width = 20;
    });

    try {
      // Use the imported image path
      const response = await fetch(logoImage, {
        headers: {
          'Accept': 'image/png',
        },
      });

      if (!response.ok) {
        // More specific error logging for debugging
        const errorText = await response.text();
        console.error(`Error loading image: ${response.statusText}. Response body: ${errorText}`);
        throw new Error(`Error al cargar la imagen: ${response.statusText}`);
      }

      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();

      const imageId = workbook.addImage({
        buffer: buffer,
        extension: 'png',
      });

      // Place the image from A1 to A4.
      // tl: { col: 0, row: 0 } corresponds to A1 (0-indexed).
      // br: { col: 1, row: 4 } ensures it spans the height of 4 rows (from row 1 up to but not including row 5).
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // Top-left at A1
        br: { col: 1, row: 4 }, // Bottom-right corner just past A4 to cover A1:A4 space
      });

    } catch (error) {
      console.error("Error al cargar el logo:", error);
      alert("❌ No se pudo cargar el logo en el Excel. El archivo se generará sin la imagen.");
    }

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "registros_produccion.xlsx");
    } catch (error) {
      console.error("Error al generar el archivo Excel:", error);
      alert("❌ Error al generar el archivo Excel.");
    }
  };

  const handleEditar = (registro: ProductionRecord) => {
    setRegistroEnEdicion(registro);
    setShowProductionForm(true);
  };

  const handleFormSubmit = async () => {
    try {
      await fetchData();
      setShowProductionForm(false);
      setRegistroEnEdicion(null);
      Swal.fire ({
        icon: 'success',
        title: 'Registro guardado',
        text : 'Registro guardado correctamente',
        confirmButtonColor: '#3085d6'
      })
    } catch (error) {
      console.error("Error al actualizar la tabla:", error);
      alert("❌ Error al actualizar la tabla");
    }
  };

  const handleFormCancel = () => {
    setShowProductionForm(false);
    setRegistroEnEdicion(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Producción</h1>
        <button
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
          onClick={() => {
            setRegistroEnEdicion(null);
            setShowProductionForm(true);
          }}
        >
          Agregar Datos de Producción
        </button>
      </div>

      {showProductionForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {registroEnEdicion ? "Editar Registro de Producción" : "Nuevo Registro de Producción"}
            </h2>
            <button className="text-gray-500 hover:text-gray-700" onClick={handleFormCancel}>✕</button>
          </div>

          <ProductionDataForm
            initialData={
              registroEnEdicion
                ? {
                    id: registroEnEdicion.id,
                    date: registroEnEdicion.date,
                    material_type: registroEnEdicion.material_type,
                    quantity: registroEnEdicion.quantity,
                    unit: registroEnEdicion.unit,
                    quality: registroEnEdicion.quality,
                    employee: registroEnEdicion.employee?.id || 0,
                    project: registroEnEdicion.project?.id || 0,
                    observations: registroEnEdicion.observations || "",
                  }
                : null
            }
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Registros de Producción</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <SearchIcon size={18} />
              </span>
              <input
                type="text"
                placeholder="Buscar por material, empleado..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
            >
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">Fecha</th>
                <th className="py-3 px-4 text-left">Material</th>
                <th className="py-3 px-4 text-left">Cantidad</th>
                <th className="py-3 px-4 text-left">Unidad</th>
                <th className="py-3 px-4 text-left">Calidad</th>
                <th className="py-3 px-4 text-left">Empleado</th>
                <th className="py-3 px-4 text-left">Observaciones</th>
                <th className="py-3 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                    {searchTerm ? "No se encontraron registros que coincidan con la búsqueda" : "No hay registros de producción"}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">{item.material_type}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">{item.unit}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.quality === 'Alta' ? 'bg-green-100 text-green-800' :
                        item.quality === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.quality}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.employee?.names || "N/A"}</td>
                    <td className="py-3 px-4">{item.observations || "-"}</td>
                    <td className="py-3 px-4 space-x-2">
                      <button
                        onClick={() => handleEditar(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};