// API que autentica y valida los usuarios
import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Agregar el token JWT en todas las peticiones automáticamente
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export default instance;

// ================= FUNCIONES ===================

// Obtener nombre del empleado por cédula
export async function getEmployeeNameByCedula(cedula: string): Promise<string> {
  try {
    const response = await instance.get(`buscar-empleado/?cedula=${cedula}`);
    const data = response.data as { nombre?: string };
    return data.nombre || '';
  } catch (error) {
    console.error("Error al buscar empleado:", error);
    return '';
  }
}

// Obtener área por cédula
export async function getEmployeeAreByCedula(cedula: string): Promise<string> {
  try {
    const response = await instance.get(`buscar_area_por_cedula/?cedula=${cedula}`);
    const data = response.data as { area?: string };
    return data.area || '';
  } catch (error) {
    console.error("Error al buscar área:", error);
    return '';
  }
}

// Obtener logs de acceso
export const getAccessLogs = async () => {
  const response = await instance.get('access-logs/');
  return response.data;
};

// =========== FUNCIONES DE REGISTRO DE GASES ==========

const GAS_API_URL = 'gasregistries/';

export interface GasRegistry {
  id?: number;
  fecha: string;
  hora: string;
  ubicacion: string;
  registrado_por: string;
  estado: string;
  methane: string;
  carbon_monoxide: string;
  carbon_dioxide: string;
  hydrogen_sulfide: string;
  sulfur_dioxide: string;
  oxygen: string;
}

// Obtener todos los registros de gas
export const getGasRegistries = async () => {
  const response = await instance.get<GasRegistry[]>(GAS_API_URL);
  return response.data;
};

// Crear nuevo registro de gas
export const createGasRegistry = async (data: GasRegistry) => {
  const response = await instance.post<GasRegistry>(GAS_API_URL, data);
  return response.data;
};

// Eliminar un registro de gas
export const deleteGasRegistry = async (id: number) => {
  await instance.delete(`${GAS_API_URL}${id}/`);
};

// Actualizar un registro de gas
export const updateGasRegistry = async (id: number, data: GasRegistry) => {
  const response = await instance.put<GasRegistry>(`${GAS_API_URL}${id}/`, data);
  return response.data;
};
