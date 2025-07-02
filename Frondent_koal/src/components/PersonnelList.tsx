import React, { useState } from 'react';
// Importamos el icono de huella dactilar
import { SearchIcon, PlusIcon, EditIcon, UserIcon, Fingerprint, Loader, CheckCircle, XCircle } from 'lucide-react';

// Definimos la interfaz para el estado del formulario
interface FormData {
  name: string;
  role: string;
  idNumber: string;
  phone: string;
  email: string;
  project: string;
  fingerprint: string; // Este campo almacenará el 'token' o ID de la huella después de una lectura exitosa simulada
}

// Definimos la interfaz para los datos del personal
interface Personnel {
    id: number;
    name: string;
    role: string;
    project: string;
    performance: string;
}

// Definimos un tipo para el estado del proceso de escaneo
type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';


export const PersonnelList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    idNumber: '',
    phone: '',
    email: '',
    project: '',
    fingerprint: '', // Inicialmente vacío
  });

  // Estado para controlar el proceso de escaneo de la huella
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  // Estado para almacenar un posible mensaje de error del escaneo
  const [scanError, setScanError] = useState<string | null>(null);


  // Dummy personnel data - Tipado
  const personnel: Personnel[] = [{
    id: 1,
    name: 'Juan Pérez',
    role: 'Supervisor',
    project: 'Mina Norte',
    performance: 'Excelente'
  }, {
    id: 2,
    name: 'María López',
    role: 'Minero',
    project: 'Mina Norte',
    performance: 'Bueno'
  }, {
    id: 3,
    name: 'Carlos Rodríguez',
    role: 'Supervisor',
    project: 'Proyecto Sur',
    performance: 'Excelente'
  }, {
    id: 4,
    name: 'Ana Martínez',
    role: 'Minero',
    project: 'Excavación Este',
    performance: 'Bueno'
  }, {
    id: 5,
    name: 'Luis Gómez',
    role: 'Minero',
    project: 'Mina Occidental',
    performance: 'Regular'
  }];

  // Filtramos el personal
  const filteredPersonnel = personnel.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejador genérico para cambios en inputs y selects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Si cambia el rol a algo diferente de 'Minero', limpiar el proyecto seleccionado
    if (name === 'role' && value !== 'Minero') {
        setFormData(prev => ({ ...prev, project: '' }));
    }
  };

  // Simulamos el proceso de escaneo de la huella
  const handleScanFingerprint = async () => {
    setScanStatus('scanning');
    setScanError(null);
    setFormData(prev => ({ ...prev, fingerprint: '' })); // Limpiar huella anterior al escanear

    // --- SIMULACIÓN DE LLAMADA AL BACKEND ---
    // En un caso real, aquí harías un fetch/axios call a tu API de Django
    // Por ejemplo: await fetch('/api/scan-fingerprint/', { method: 'POST', body: JSON.stringify({ userId: '...' }) });
    // El backend se comunicaría con el hardware del escáner y devolvería un resultado.

    // Simulamos un retraso y un resultado aleatorio
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos

    const success = Math.random() > 0.3; // 70% probabilidad de éxito simulado

    if (success) {
      const simulatedToken = `fingerprint_${Date.now()}`; // Token/ID simulado del backend
      setScanStatus('success');
      setFormData(prev => ({ ...prev, fingerprint: simulatedToken })); // Guardar el token/ID en el estado
    } else {
      setScanStatus('error');
      setScanError('No se pudo capturar la huella. Intente de nuevo.');
    }
    // --- FIN SIMULACIÓN ---
  };


  // Manejador para el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Opcional: Validar que la huella haya sido escaneada si es un campo requerido
    if (formData.fingerprint === '') {
        alert('Por favor, escanee la huella dactilar.');
        return;
    }

    // Aquí manejarías la lógica para añadir el nuevo personal, enviando `formData` al backend
    console.log('Formulario enviado:', formData);

    // Reiniciamos el formulario y estados después de enviar (simulado)
    setFormData({
      name: '',
      role: '',
      idNumber: '',
      phone: '',
      email: '',
      project: '',
      fingerprint: '',
    });
    setScanStatus('idle');
    setScanError(null);
    setShowForm(false);
  };

  // Renderizado del componente
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personal</h2>
        <button
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          onClick={() => {
            setShowForm(true);
            setFormData({ // Asegurarse de limpiar el formulario al abrir
              name: '',
              role: '',
              idNumber: '',
              phone: '',
              email: '',
              project: '',
              fingerprint: '',
            });
            setScanStatus('idle'); // Reiniciar estado de escaneo
            setScanError(null);
          }}
        >
          <PlusIcon size={16} />
          <span>Añadir Personal</span>
        </button>
      </div>

      {/* Formulario para añadir personal, mostrado condicionalmente */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Añadir Nuevo Personal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre Completo */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              {/* Número de Identificación */}
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Identificación
                </label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              {/* Rol */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Seleccionar rol</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Minero">Minero</option>
                </select>
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              {/* Sección Seleccionar Proyecto - Se muestra SOLO SI el rol es 'Minero' */}
              {formData.role === 'Minero' && (
                <div>
                  <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar Proyecto
                  </label>
                  <select
                    id="project"
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    required={formData.role === 'Minero'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">Seleccionar Proyecto</option>
                    <option value="Mina Norte">Mina Norte</option>
                    <option value="Proyecto Sur">Proyecto Sur</option>
                    <option value="Excavación Este">Excavación Este</option>
                    <option value="Mina Occidental">Mina Occidental</option>
                    <option value="Proyecto Central">Proyecto Central</option>
                  </select>
                </div>
              )}

              {/* Sección de Lectura de Huella Dactilar - Más visual */}
              <div className="col-span-1 md:col-span-2"> {/* Ocupa dos columnas para mejor diseño */}
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Huella Dactilar
                 </label>
                 <div className="flex items-center gap-4">
                     <button
                        type="button" // Importante que sea type="button" para no enviar el formulario
                        onClick={handleScanFingerprint}
                        disabled={scanStatus === 'scanning' || scanStatus === 'success'} // Deshabilitar mientras escanea o si ya tuvo éxito
                        className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                            scanStatus === 'scanning' ? 'bg-gray-400 cursor-not-allowed' :
                            scanStatus === 'success' ? 'bg-green-500 text-white' :
                            'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                     >
                         {scanStatus === 'scanning' ? (
                             <Loader size={20} className="animate-spin" /> // Icono de carga
                         ) : scanStatus === 'success' ? (
                              <CheckCircle size={20} /> // Icono de éxito
                         ) : (
                              <Fingerprint size={20} /> // Icono de huella
                         )}
                         <span>
                             {scanStatus === 'scanning' ? 'Escaneando...' :
                              scanStatus === 'success' ? 'Huella Capturada' :
                              'Escanear Huella'
                             }
                         </span>
                     </button>

                     {/* Mostrar estado o feedback */}
                     {scanStatus === 'success' && (
                         <span className="text-sm text-green-600 flex items-center gap-1">
                             ¡Listo! ID: {formData.fingerprint} {/* Muestra el ID/Token simulado */}
                         </span>
                     )}
                     {scanStatus === 'error' && scanError && (
                         <span className="text-sm text-red-600 flex items-center gap-1">
                             <XCircle size={16} /> {scanError}
                         </span>
                     )}
                     {scanStatus === 'idle' && !formData.fingerprint && (
                          <span className="text-sm text-gray-500">Presione el botón para escanear.</span>
                     )}
                 </div>
                 {/* Opcional: un input oculto si necesitas el valor en el DOM para algún JS externo */}
                 {/* <input type="hidden" name="fingerprint" value={formData.fingerprint} /> */}
              </div>
              {/* Fin Sección de Lectura de Huella Dactilar */}

               {/* Campo Email - Añadir input si es necesario usarlo (comentado) */}
               {/* <div>
                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                   Email
                 </label>
                 <input
                   type="email"
                   id="email"
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                 />
               </div> */}


            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sección de Búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar personal..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de Personal */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rendimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPersonnel.map(person => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon size={18} className="text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">
                        {person.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-500">{person.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-500">{person.project}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      person.performance === 'Excelente'
                        ? 'bg-green-100 text-green-800'
                        : person.performance === 'Bueno'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {person.performance}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="p-1 rounded-full hover:bg-gray-100">
                    <EditIcon size={18} className="text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};