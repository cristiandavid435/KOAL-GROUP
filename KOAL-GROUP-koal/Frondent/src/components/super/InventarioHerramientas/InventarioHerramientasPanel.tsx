import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusIcon, DownloadIcon, Edit, Trash } from 'lucide-react';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import logoImage from '../../../assets/hola.png';

import axios from '../../../axiosInstance';

import Swal from 'sweetalert2';

interface Tool {
  id?: number;
  name: string;
  category: string;
  description: string;
  quantity: number;
  status: string;
  last_revision_date: string;
  location: string;
  observations: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
}

interface ToolFormData {
  name: string;
  category: string;
  description: string;
  quantity: string; // keep as string for controlled input
  status: string;
  last_revision_date: string;
  location: string;
  observations: string;
  assigned_to: string; // user id string
}

interface User {
  id: number;
  username: string;
}

const statusOptions = ['Bueno', 'Regular', 'Malo', 'En Reparación', 'Descartado'] as const;
const categoryOptions = [
  'Manual',
  'Eléctrico',
  'Hidráulico',
  'Neumático',
  'Medición',
  'Corte',
  'Soldadura',
  'Seguridad',
  'Otro',
] as const;

export function InventarioHerramientasPanel() {
  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    category: '',
    description: '',
    quantity: '',
    status: '',
    last_revision_date: '',
    location: '',
    observations: '',
    assigned_to: '',
  });

  const [herramientas, setHerramientas] = useState<Tool[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tools from the API
  const fetchTools = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Tool[]>('/tool/');
      setHerramientas(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Problema de conexión.';
      setError(`No se pudieron cargar las herramientas: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch users from the API
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get<User[]>('/users/');
      setUsers(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Problema de conexión.';
      setError(`No se pudieron cargar los usuarios: ${errorMessage}`);
    }
  }, []);

  // Load tools and users on component mount
  useEffect(() => {
    fetchTools();
    fetchUsers();
  }, [fetchTools, fetchUsers]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission for creating or updating a tool
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.name || !formData.category || !formData.quantity || !formData.status || !formData.last_revision_date) {
      setError('Por favor, completa todos los campos obligatorios (Nombre, Categoría, Cantidad, Estado, Fecha Última Revisión).');
      return;
    }

    // Validate quantity
    const quantityNum = parseInt(formData.quantity, 10);
    if (isNaN(quantityNum) || quantityNum < 1) {
      setError('La cantidad debe ser un número válido mayor o igual a 1.');
      return;
    }

    // Prepare tool data for submission
    const toolDataToSend: Tool = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      quantity: quantityNum,
      status: formData.status,
      last_revision_date: formData.last_revision_date,
      location: formData.location,
      observations: formData.observations,
      assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
      assigned_to_name: null,
    };

    try {
      if (isEditing && editingTool?.id) {
        await axios.put(`/tool/${editingTool.id}/`, toolDataToSend);
      } else {
        await axios.post('/tool/', toolDataToSend);
      }
      fetchTools();
      resetFormAndCloseModal();
    } catch (err: any) {
      const errorMessage = err.response?.data ? Object.values(err.response.data).flat().join(' ') || err.message : err.message || 'Problema de conexión';
      setError(`Error al guardar/editar herramienta: ${errorMessage}`);
    }
  };

  // Handle edit button click
  const handleEdit = (tool: Tool) => {
    setIsEditing(true);
    setEditingTool(tool);
    setFormData({
      name: tool.name || '',
      category: tool.category || '',
      description: tool.description || '',
      quantity: tool.quantity?.toString() || '',
      status: tool.status || '',
      last_revision_date: tool.last_revision_date || '',
      location: tool.location || '',
      observations: tool.observations || '',
      assigned_to: tool.assigned_to?.toString() || '',
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (id: number | undefined) => {
    if (typeof id === 'undefined') {
      setError('ID de herramienta no definido.');
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la herramienta.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) {
      return;
    }

    
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/tool/${id}/`);
      fetchTools();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Problema de conexión.';
      setError(`No se pudo eliminar la herramienta: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and close modal
  const resetFormAndCloseModal = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      quantity: '',
      status: '',
      last_revision_date: '',
      location: '',
      observations: '',
      assigned_to: '',
    });
    setIsEditing(false);
    setEditingTool(null);
    setIsModalOpen(false);
  };

  // Filter tools based on search term and status
  const filteredHerramientas = useMemo(() => {
    return herramientas.filter((herramienta) => {
      const matchesSearch =
        herramienta.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herramienta.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herramienta.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herramienta.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        herramienta.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus ? herramienta.status === filterStatus : true;
      return matchesSearch && matchesStatus;
    });
  }, [herramientas, searchTerm, filterStatus]);

  // ---------------------------------------------------------------------------
  // EXPORT TO EXCEL (Ancho de celdas + logo más grande + texto envuelto)
  // ---------------------------------------------------------------------------
  const exportToXLSX = async () => {
    if (filteredHerramientas.length === 0) {
      Swal.fire({
              icon: 'error',
              title: '¡No hay datos para exportar!',
              text: 'No se encontraron datos para exportar!!',
              confirmButtonColor: '#3085d6'
            })
      return;
    }

    const companyName = 'Koal Group';
    const reportTitle = 'REPORTE DE INVENTARIO DE HERRAMIENTAS';
    const generatedDate = `Fecha de Generación: ${new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
    const location = 'Sogamoso, Boyacá, Colombia';
    const contact = 'Contacto: Soporte Técnico';

    const tableHeaders = [
      'Nombre',
      'Categoría',
      'Descripción',
      'Cantidad',
      'Estado',
      'Fecha Última Revisión',
      'Ubicación',
      'Encargado',
      'Observaciones',
    ];

    const dataForTable = filteredHerramientas.map((herramienta) => [
      herramienta.name || '',
      herramienta.category || '',
      herramienta.description || '',
      herramienta.quantity || 0,
      herramienta.status || '',
      herramienta.last_revision_date || '',
      herramienta.location || '',
      herramienta.assigned_to_name || 'Sin asignar',
      herramienta.observations || '',
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario Herramientas');

    // --------------------------------------------------
    // Ajuste de filas del encabezado (más altas)
    // --------------------------------------------------
    worksheet.getRow(1).height = 40; // más alto para logo grande
    worksheet.getRow(2).height = 28; // título
    worksheet.getRow(3).height = 22; // espacio
    worksheet.getRow(4).height = 22; // espacio

    // --------------------------------------------------
    // Preparar columnas: dejamos la Col A más ancha para el logo
    // Luego columnas de datos MUCHO más anchas para que quepan nombres largos
    // --------------------------------------------------
    // NOTA: El número de columnas definidas aquí DEBE cubrir todo lo que usaremos (A-J)
    worksheet.columns = [
      { width: 12 }, // A (logo / margen)
      { width: 35 }, // B Nombre empresa / Nombre herramienta
      { width: 22 }, // C Categoría
      { width: 50 }, // D Descripción (amplia)
      { width: 12 }, // E Cantidad
      { width: 22 }, // F Estado
      { width: 24 }, // G Fecha Última Revisión
      { width: 30 }, // H Ubicación
      { width: 28 }, // I Encargado
      { width: 60 }, // J Observaciones (muy amplia)
    ];

    // --------------------------------------------------
    // Encabezado institucional (nombre empresa + título)
    // --------------------------------------------------
    worksheet.mergeCells('B1', 'J1');
    worksheet.getCell('B1').value = companyName;
    worksheet.getCell('B1').font = { bold: true, size: 20 }; // más grande
    worksheet.getCell('B1').alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('B2', 'J2');
    worksheet.getCell('B2').value = reportTitle;
    worksheet.getCell('B2').font = { bold: true, size: 14 };
    worksheet.getCell('B2').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    worksheet.getCell('A5').value = generatedDate;
    worksheet.getCell('A6').value = location;
    worksheet.getCell('A7').value = contact;

    worksheet.addRow([]); // Fila vacía (fila 8 aprox)

    // --------------------------------------------------
    // Encabezados de tabla
    // --------------------------------------------------
    const headersRow = worksheet.addRow(tableHeaders);
    headersRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // --------------------------------------------------
    // Datos de la tabla
    // --------------------------------------------------
    dataForTable.forEach((rowData) => {
      const row = worksheet.addRow(rowData);
      row.height = 20; // un poco más alto; ajusta si quieres más
      row.eachCell((cell, colNumber) => {
        // Alinear texto en filas de datos
        const isNumeric = colNumber === 4; // Cantidad
        cell.alignment = {
          horizontal: isNumeric ? 'center' : 'left',
          vertical: 'top',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // --------------------------------------------------
    // Auto-ajuste de altura de fila según contenido largo (simple)
    // ExcelJS no calcula autoHeight; si quieres más altura basada en longitud, ajustamos:
    // --------------------------------------------------
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > headersRow.number) {
        // estimación: cada 50 caracteres aumenta ~15pt
        let maxChars = 0;
        row.eachCell((cell) => {
          const text = cell.value?.toString?.() ?? '';
          if (text.length > maxChars) maxChars = text.length;
        });
        if (maxChars > 50) {
          row.height = 20 + Math.ceil((maxChars - 50) / 50) * 15; // escala simple
        }
      }
    });

    // --------------------------------------------------
    // Agregar imagen (logo) MÁS GRANDE
    // --------------------------------------------------
    try {
      const response = await fetch(logoImage, { headers: { Accept: 'image/png' } });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error cargando imagen: ${response.statusText}. Detalles: ${errorText}`);
        throw new Error(`Error al cargar el logo: ${response.statusText}`);
      }
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();

      const imageId = workbook.addImage({ buffer: buffer, extension: 'png' });

      // Opción 1: anclar por tamaño en pixeles (recomendado para "más ancho")
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // esquina arriba izq (celda A1)
        ext: { width: 220, height: 100 }, // ajusta a gusto (más ancho + más alto)
      });

      // (Alternativa: usar range por celdas, ej. A1:B4)
      // worksheet.addImage(imageId, {
      //   tl: { col: 0, row: 0 },
      //   br: { col: 2, row: 4 }, // ocupa columnas A:B, filas 1-4
      // });
    } catch (error) {
      console.error('Error al cargar el logo:', error);
    }

    // --------------------------------------------------
    // Descargar archivo
    // --------------------------------------------------
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'inventario_herramientas.xlsx');
    } catch (error) {
      console.error('Error al generar el archivo Excel:', error);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Inventario de Herramientas</h1>
        <button
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          onClick={() => {
            resetFormAndCloseModal();
            setIsModalOpen(true);
          }}
          aria-label="Agregar nueva herramienta"
        >
          <PlusIcon size={18} className="mr-2" />
          Nuevo Registro
        </button>
      </div>

      {isModalOpen ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isEditing ? 'Editar Herramienta' : 'Nueva Herramienta'}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={resetFormAndCloseModal}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="md:col-span-2 text-red-600 bg-red-50 p-2 rounded-md text-sm">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  placeholder="Ej. Martillo"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  required
                  aria-required="true"
                >
                  <option value="">Seleccionar categoría</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  placeholder="Ej. Martillo de acero con mango de goma"
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  placeholder="Ej. 5"
                  min="1"
                  required
                  aria-required="true"
                  onKeyPress={(e) => {
                    if (['-', '+', 'e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  required
                  aria-required="true"
                >
                  <option value="">Seleccionar estado</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="last_revision_date" className="block text-sm font-medium text-gray-700">
                  Fecha Última Revisión <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="last_revision_date"
                  name="last_revision_date"
                  value={formData.last_revision_date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  placeholder="Ej. Almacén A - Estante 3"
                />
              </div>
              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                  Encargado
                </label>
                <select
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                >
                  <option value="">Sin asignar</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="observations" className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  placeholder="Observaciones adicionales sobre la herramienta..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={resetFormAndCloseModal}
                className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Cancelar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label={isEditing ? 'Actualizar herramienta' : 'Guardar herramienta'}
              >
                {isEditing ? 'Actualizar Datos' : 'Guardar Datos'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 w-full">
                <input
                  type="text"
                  placeholder="Buscar por nombre, categoría, ubicación o encargado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500 w-full sm:w-auto"
                  aria-label="Buscar herramientas"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 focus:border-blue-500 focus:ring-blue-500 w-full sm:w-auto"
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos los estados</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 w-full sm:w-auto justify-center"
                onClick={exportToXLSX}
                aria-label="Exportar a Excel"
              >
                <DownloadIcon size={16} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-center text-gray-500">Cargando herramientas...</p>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-100 p-3 rounded-md">
              <p>{error}</p>
              <button
                onClick={fetchTools}
                className="mt-2 text-blue-700 hover:underline"
                aria-label="Reintentar carga de herramientas"
              >
                Reintentar
              </button>
            </div>
          ) : filteredHerramientas.length === 0 ? (
            <p className="text-center text-gray-500">No hay herramientas registradas que coincidan con los filtros.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-3 px-4 text-left">Nombre</th>
                    <th className="py-3 px-4 text-left">Categoría</th>
                    <th className="py-3 px-4 text-left">Descripción</th>
                    <th className="py-3 px-4 text-left">Cantidad</th>
                    <th className="py-3 px-4 text-left">Estado</th>
                    <th className="py-3 px-4 text-left">Fecha Última Revisión</th>
                    <th className="py-3 px-4 text-left">Ubicación</th>
                    <th className="py-3 px-4 text-left">Encargado</th>
                    <th className="py-3 px-4 text-left">Observaciones</th>
                    <th className="py-3 px-4 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHerramientas.map((herramienta) => (
                    <tr key={herramienta.id || Math.random()} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{herramienta.name || '-'}</td>
                      <td className="py-3 px-4">{herramienta.category || '-'}</td>
                      <td className="py-3 px-4">{herramienta.description || '-'}</td>
                      <td className="py-3 px-4 font-medium">{herramienta.quantity || 0}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            herramienta.status === 'Bueno'
                              ? 'bg-green-100 text-green-800'
                              : ['Regular', 'En Reparación'].includes(herramienta.status)
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {herramienta.status || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{herramienta.last_revision_date || '-'}</td>
                      <td className="py-3 px-4">{herramienta.location || '-'}</td>
                      <td className="py-3 px-4">{herramienta.assigned_to_name || 'Sin asignar'}</td>
                      <td className="py-3 px-4">{herramienta.observations || '-'}</td>
                      <td className="py-3 px-4 flex space-x-2">
                        <button
                          title="Editar"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(herramienta)}
                          aria-label={`Editar herramienta ${herramienta.name || 'sin nombre'}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          title="Eliminar"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(herramienta.id)}
                          aria-label={`Eliminar herramienta ${herramienta.name || 'sin nombre'}`}
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
