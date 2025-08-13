import React, { useState, useEffect } from 'react';
import { UserMinusIcon, SearchIcon, RefreshCwIcon, DownloadIcon } from 'lucide-react';
import { AccessLogTable } from './AccessLogTable';
import { EntryTable } from './EntryTable'; // ✅ Línea 13 corregida
import { ExitTable } from './ExitTable';   // ✅ Línea 14 corregida
import { RegisterEntryForm, EntryFormData } from './RegisterEntryForm';
import { RegisterExitForm, ExitFormData } from './RegisterExitForm';
import axios from "../../../axiosInstance";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; 
import logoImage from "../../../assets/hola.png";

interface AccessLog {
  id: number;
  empleadoNombre: string;
  empleadoId: string | number;
  hora_entrada?: string;
  hora_salida?: string;
  fecha: string;
  lugar_trabajo: string;
}

export const AccessControlPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allLogs, setAllLogs] = useState<AccessLog[]>([]); // ✅ Línea 23 corregida
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]); // ✅ Línea 24 corregida

  const [activeTab, setActiveTab] = useState('all');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExitForm, setShowExitForm] = useState(false);

  // Obtener todos los registros al cargar
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get<AccessLog[]>('/access-logs/');
        setAllLogs(response.data);
        setFilteredLogs(response.data);
      } catch (error) {
        console.error("Error al cargar registros:", error);
      }
    };
    fetchLogs();
  }, []);

  const exportarAExcel = async () => { 
  if (filteredLogs.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Registros");

  // --- Header con logo y datos institucionales ---
  worksheet.getRow(1).height = 20;
  worksheet.getRow(2).height = 20;
  worksheet.getRow(3).height = 20;
  worksheet.getRow(4).height = 20;

  worksheet.mergeCells('B1', 'H1');
  worksheet.getCell('B1').value = 'KOAL GROUP';
  worksheet.getCell('B1').font = { bold: true, size: 16 };
  worksheet.getCell('B1').alignment = { horizontal: 'center' };

  worksheet.mergeCells('B2', 'H2');
  worksheet.getCell('B2').value = 'REPORTE DE REGISTROS DE ACCESO';
  worksheet.getCell('B2').alignment = { horizontal: 'center' };

  worksheet.getCell('A5').value = `Fecha de generación: ${new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`;
  worksheet.getCell('A6').value = `Ubicación: Sogamoso, Boyacá, Colombia`;
  worksheet.getCell('A7').value = `Contacto: Soporte Técnico Koal Group`;

  worksheet.addRow([]);

  // Encabezados
  const headersRow = worksheet.addRow([
    'Empleado', 'Cédula', 'Fecha', 'Hora Entrada', 'Hora Salida', 'Área'
  ]);

  headersRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Agregar los datos
  filteredLogs.forEach((log) => {
    worksheet.addRow([
      log.empleadoNombre,
      log.empleadoId,
      log.fecha,
      log.hora_entrada || '',
      log.hora_salida || '',
      log.lugar_trabajo,
    ]);
  });

  // Ajustar ancho columnas
  worksheet.columns.forEach((col) => {
    col.width = 30;
  });

  // Cargar el logo si está disponible
  try {
    const response = await fetch(logoImage, {
      headers: {
        'Accept': 'image/png',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error cargando imagen: ${response.statusText}. Detalles: ${errorText}`);
      throw new Error(`Error al cargar el logo: ${response.statusText}`);
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
      buffer: buffer,
      extension: 'png',
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      br: { col: 1, row: 4 },
    });

  } catch (error) {
    console.error("Error al cargar el logo:", error);
    alert("❌ No se pudo cargar el logo en el Excel. El archivo se generará sin la imagen.");
  }

  // Generar archivo
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "registros-acceso.xlsx");
  } catch (error) {
    console.error("Error al generar el archivo Excel:", error);
    alert("❌ Error al generar el archivo Excel.");
  }
};



  const refrescarDatos = async () => {
  try {
    const response = await axios.get<AccessLog[]>('/access-logs/');
    setAllLogs(response.data);
    setFilteredLogs(response.data);
  } catch (error) {
    console.error("Error al recargar los registros:", error);
    alert("Ocurrió un error al intentar recargar los registros.");
  }
};


  // Filtro dinámico como en gases
  useEffect(() => {
    const text = searchTerm.toLowerCase().trim();
    const filtered = allLogs.filter((item) => {
      const nombre = item.empleadoNombre?.toLowerCase() || '';
      const cedula = item.empleadoId?.toString().toLowerCase() || '';
      const area = item.lugar_trabajo?.toLowerCase() || '';
      return (
        nombre.includes(text) ||
        cedula.includes(text) ||
        area.includes(text)
      );
    });
    setFilteredLogs(filtered);
  }, [searchTerm, allLogs]);

  const handleRegisterEntry = (data: EntryFormData) => {
    console.log('Entrada registrada:', data);
  };

  const handleRegisterExit = (data: ExitFormData) => {
    console.log('Salida registrada:', data);
  };

  return (
    <div className="space-y-6">
      {showEntryForm && (
        <RegisterEntryForm
          onClose={() => setShowEntryForm(false)}
          onSubmit={handleRegisterEntry}
        />
      )}
      {showExitForm && (
        <RegisterExitForm
          onClose={() => setShowExitForm(false)}
          onSubmit={handleRegisterExit}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Control de Acceso</h1>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
            onClick={() => setShowExitForm(true)}
          >
            <UserMinusIcon size={18} className="mr-2" />
            Registrar Entrada-Salida
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <button className={`px-3 py-2 ${activeTab === 'all' ? 'border-b-2 border-gray-800 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('all')}>
              Todos
            </button>
            <button className={`px-3 py-2 ${activeTab === 'entries' ? 'border-b-2 border-gray-800 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('entries')}>
              Entradas
            </button>
            <button className={`px-3 py-2 ${activeTab === 'exits' ? 'border-b-2 border-gray-800 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('exits')}>
              Salidas
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative w-40 sm:w-60">
              <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleado, cédula o nombre."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 w-full text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900"
              onClick={refrescarDatos}
              title="Refrescar registros">
              <RefreshCwIcon size={18} />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-gray-900"
              onClick={exportarAExcel}
              title="Descargar a excel">
              <DownloadIcon size={18} />
            </button>
          </div>
        </div>

        {/* ✅ Líneas 128-129 corregidas */}
        {activeTab === 'all' && <AccessLogTable logs={filteredLogs} />}
        {activeTab === 'entries' && <EntryTable logs={filteredLogs} />}
        {activeTab === 'exits' && <ExitTable logs={filteredLogs} />}
      </div>
    </div>
  );
};

