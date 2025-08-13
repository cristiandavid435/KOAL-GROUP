import React, { useState, useEffect } from "react";
import { SearchIcon, PlusIcon, EditIcon, EyeOffIcon, User2Icon, CheckIcon, XIcon } from "lucide-react";
import instance, { getEmployeeNameByCedula } from "../../axiosInstance";
import { toast } from "react-toastify";

import Swal from 'sweetalert2';

// Interfaz para la respuesta de la API
interface ApiResponse {
  results?: Personnel[];
}

// Interfaz para los datos del formulario y personal
interface FormData {
  username: string;
  email: string;
  password: string;
  password2: string;
  role: string;
  id_number: string;
  phone: string;
  names: string;
  is_active: boolean;
}

interface Personnel {
  id: number;
  username: string;
  email: string;
  role: string;
  id_number: string;
  phone: string;
  names: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export const PersonnelList: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "EMPLOYEE",
    id_number: "",
    phone: "",
    names: "",
    is_active: true,
  });
  const [loadingName, setLoadingName] = useState(false);
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPersonnel();
  }, []);

  // Obtener lista de personal desde la API
  const fetchPersonnel = async () => {
    try {
      const response = await instance.get<ApiResponse>("users/");
      const results = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setPersonnel(results);
    } catch (error) {
      console.error("Error cargando personal:", error);
      toast.error("Error cargando personal. Verifica la conexión con el backend.");
    }
  };

  // Validar cédula (solo números, 6-12 dígitos)
  const validateIdNumber = (id_number: string): string | null => {
    if (!/^\d+$/.test(id_number)) {
      return "La cédula debe contener solo números.";
    }
    if (id_number.length < 6 || id_number.length > 12) {
      return "La cédula debe tener entre 6 y 12 dígitos.";
    }
    return null;
  };

  // Validar número de teléfono (solo números, 10 dígitos)
  const validatePhone = (phone: string): string | null => {
    if (phone && !/^\d+$/.test(phone)) {
      return "El número de teléfono debe contener solo números.";
    }
    if (phone && phone.length !== 10) {
      return "El número de teléfono debe tener exactamente 10 dígitos.";
    }
    return null;
  };

  // Validar contraseña (mínimo 8 caracteres, mayúscula, minúscula, número, carácter especial)
  const validatePassword = (password: string): string | null => {
    if (!isEditing && password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!isEditing && !/[A-Z]/.test(password)) {
      return "La contraseña debe incluir al menos una letra mayúscula.";
    }
    if (!isEditing && !/[a-z]/.test(password)) {
      return "La contraseña debe incluir al menos una letra minúscula.";
    }
    if (!isEditing && !/\d/.test(password)) {
      return "La contraseña debe incluir al menos un número.";
    }
    if (!isEditing && !/[!@#$%^&*]/.test(password)) {
      return "La contraseña debe incluir al menos un carácter especial (!@#$%^&*).";
    }
    return null;
  };

  // Manejar cambio en la cédula y buscar nombre
  const handleCedulaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, id_number: value }));
    setErrorMessages((prev) => ({ ...prev, id_number: "" }));

    const idError = validateIdNumber(value);
    if (idError) {
      setErrorMessages((prev) => ({ ...prev, id_number: idError }));
      setFormData((prev) => ({ ...prev, names: "" }));
      return;
    }

    if (value.length > 0) {
      setLoadingName(true);
      try {
        const nombreCompleto = await getEmployeeNameByCedula(value);
        if (nombreCompleto) {
          setFormData((prev) => ({ ...prev, names: nombreCompleto }));
          setErrorMessages((prev) => ({ ...prev, names: "" }));
        } else {
          setFormData((prev) => ({ ...prev, names: "" }));
          setErrorMessages((prev) => ({
            ...prev,
            names: "No se encontró un empleado con esa cédula.",
          }));
        }
      } catch (error) {
        setFormData((prev) => ({ ...prev, names: "" }));
        setErrorMessages((prev) => ({
          ...prev,
          names: "Error al buscar el nombre del empleado.",
        }));
      }
      setLoadingName(false);
    } else {
      setFormData((prev) => ({ ...prev, names: "" }));
      setErrorMessages((prev) => ({ ...prev, names: "" }));
    }
  };

  // Manejar cambios en otros campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessages((prev) => ({ ...prev, [name]: "" }));

    if (name === "phone") {
      const phoneError = validatePhone(value);
      if (phoneError) {
        setErrorMessages((prev) => ({ ...prev, phone: phoneError }));
      }
    }

    if (name === "password") {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setErrorMessages((prev) => ({ ...prev, password: passwordError }));
      }
    }

    if (name === "password2" && !isEditing) {
      if (value !== formData.password) {
        setErrorMessages((prev) => ({
          ...prev,
          password2: "Las contraseñas no coinciden.",
        }));
      }
    }
  };

  // Manejar cambio en el checkbox de activo
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, is_active: e.target.checked }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages({});

    // Validar todos los campos
    const errors: { [key: string]: string } = {};
    if (!formData.username.trim()) {
      errors.username = "El usuario es obligatorio.";
    }
    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "El correo electrónico no es válido.";
    }
    if (!formData.names.trim()) {
      errors.names = "El nombre completo es obligatorio.";
    }
    if (!formData.id_number) {
      errors.id_number = "La cédula es obligatoria.";
    } else {
      const idError = validateIdNumber(formData.id_number);
      if (idError) errors.id_number = idError;
    }
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) errors.phone = phoneError;
    }
    if (!isEditing) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) errors.password = passwordError;
      if (formData.password !== formData.password2) {
        errors.password2 = "Las contraseñas no coinciden.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }

    const userData = {
      username: formData.username,
      email: formData.email,
      password: !isEditing ? formData.password : undefined,
      password2: !isEditing ? formData.password2 : undefined,
      role: formData.role,
      id_number: formData.id_number,
      phone: formData.phone,
      names: formData.names,
      is_active: formData.is_active,
      is_staff: formData.role === "ADMIN",
      is_superuser: formData.role === "ADMIN",
    };

    try {
      if (isEditing && editId !== null) {
        await instance.put(`users/${editId}/`, userData);
        toast.success("Usuario actualizado correctamente.");
      } else {
        await instance.post("register/", userData);
        toast.success("Usuario registrado correctamente.");
      }
      fetchPersonnel();
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        password2: "",
        role: "EMPLOYEE",
        id_number: "",
        phone: "",
        names: "",
        is_active: true,
      });
      setErrorMessages({});
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Error al registrar o actualizar el usuario. Verifica los datos.";
      setErrorMessages({ general: message });
      console.error("Error en la solicitud:", error.response?.data);
    }
  };

  // Manejar desactivación de usuario
  const handleDeactivate = async (id: number, username: string) => {
  const result = await Swal.fire({
    title: `¿Desactivar usuario ${username}?`,
    text: `¿Estás seguro de que deseas desactivar al usuario ${username}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  });

  if (!result.isConfirmed) return;

  const userToUpdate = personnel.find((person) => person.id === id);
  if (userToUpdate) {
    const updatedUser = { ...userToUpdate, is_active: false };
    try {
      const response = await instance.put(`users/${id}/`, updatedUser);
      if (response.status === 200) {
        setPersonnel((prev) =>
          prev.map((person) =>
            person.id === id ? { ...person, is_active: false } : person
          )
        );

        await Swal.fire({
          icon: 'success',
          title: 'Usuario desactivado',
          text: `El usuario ${username} fue desactivado correctamente.`,
          confirmButtonColor: '#3085d6'
        });
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Error al desactivar el usuario.";
      console.error("Error al desactivar:", error.response?.data);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#d33'
      });
    }
  }
};


  // Filtrar personal según término de búsqueda
  const filteredPersonnel = personnel.filter(
    (person) =>
      person.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.names.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Personal</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setEditId(null);
            setFormData({
              username: "",
              email: "",
              password: "",
              password2: "",
              role: "EMPLOYEE",
              id_number: "",
              phone: "",
              names: "",
              is_active: true,
            });
            setErrorMessages({});
          }}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
          aria-label="Agregar nuevo usuario"
        >
          <PlusIcon size={16} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {isEditing ? "Editar Usuario" : "Registrar Nuevo Usuario"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setErrorMessages({});
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar formulario"
            >
              <XIcon size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {errorMessages.general && (
              <div className="text-red-600 text-sm mt-2">{errorMessages.general}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cédula <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleCedulaChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                required
                aria-required="true"
                maxLength={12}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errorMessages.id_number && (
                <p className="text-red-600 text-sm mt-1">{errorMessages.id_number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="names"
                value={loadingName ? "Buscando..." : formData.names}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                required
                aria-required="true"
                disabled={loadingName}
              />
              {errorMessages.names && (
                <p className="text-red-600 text-sm mt-1">{errorMessages.names}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                required
                aria-required="true"
              />
              {errorMessages.username && (
                <p className="text-red-600 text-sm mt-1">{errorMessages.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                required
                aria-required="true"
              />
              {errorMessages.email && (
                <p className="text-red-600 text-sm mt-1">{errorMessages.email}</p>
              )}
            </div>
            {!isEditing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                    required
                    aria-required="true"
                  />
                  {errorMessages.password && (
                    <p className="text-red-600 text-sm mt-1">{errorMessages.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                    required
                    aria-required="true"
                  />
                  {errorMessages.password2 && (
                    <p className="text-red-600 text-sm mt-1">{errorMessages.password2}</p>
                  )}
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                required
                aria-required="true"
              >
                <option value="EMPLOYEE">Empleado</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
                maxLength={10}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {errorMessages.phone && (
                <p className="text-red-600 text-sm mt-1">{errorMessages.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                Activo
              </label>
              <p className="text-xs text-gray-500">Desmarca esto en lugar de eliminar cuentas.</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setErrorMessages({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2"
                aria-label="Cancelar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                aria-label={isEditing ? "Actualizar usuario" : "Guardar usuario"}
              >
                <CheckIcon size={18} className="mr-2" />
                {isEditing ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={18} className="text-gray-400" />
        </div>
        <input
          placeholder="Buscar personal..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-gray-800 bg-white text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Buscar personal"
        />
      </div>

      <div className="bg-white rounded-lg shadow-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Nombres Completos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Cédula</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Activo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPersonnel.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron resultados.
                </td>
              </tr>
            ) : (
              filteredPersonnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 text-gray-800 dark:text-white">
                    <User2Icon size={18} className="text-gray-500" />
                    {person.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{person.names || "Sin nombre"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{person.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{person.id_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{person.phone || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{person.is_active ? "Sí" : "No"}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setShowForm(true);
                        setIsEditing(true);
                        setEditId(person.id);
                        setFormData({
                          username: person.username,
                          email: person.email,
                          password: "",
                          password2: "",
                          role: person.role,
                          id_number: person.id_number,
                          phone: person.phone || "",
                          names: person.names || "",
                          is_active: person.is_active,
                        });
                        setErrorMessages({});
                      }}
                      aria-label={`Editar usuario ${person.username}`}
                    >
                      <EditIcon size={18} className="text-gray-500" />
                    </button>
                    <button
                      className="p-1 hover:bg-red-100 rounded"
                      onClick={() => handleDeactivate(person.id, person.username)}
                      aria-label={`Desactivar usuario ${person.username}`}
                    >
                      <EyeOffIcon size={18} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};