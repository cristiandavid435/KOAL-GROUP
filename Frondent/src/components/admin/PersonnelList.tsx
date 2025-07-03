import React, { useState, useEffect } from "react";
import { SearchIcon, PlusIcon, EditIcon, UserIcon } from "lucide-react";
import api from "../../axiosInstance";
import { toast } from "react-toastify";

interface FormData {
  username: string;
  email: string;
  password: string;
  password2: string;
  role: string;
  id_number: string;
  phone: string;
  fingerprint_id: string;
}

interface Personnel {
  id: number;
  username: string;
  email: string;
  role: string;
  id_number: string;
  phone: string;
}

export const PersonnelList: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "EMPLOYEE",
    id_number: "",
    phone: "",
    fingerprint_id: "",
  });

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await api.get("users/");
      let results: any[] = [];
      if (Array.isArray(response.data)) {
        results = response.data;
      } else if (response.data && typeof response.data === "object" && "results" in response.data && Array.isArray((response.data as any).results)) {
        results = (response.data as any).results;
      }
      setPersonnel(results);
    } catch (error) {
      console.error("Error cargando personal:", error);
      toast.error("Error cargando personal.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      await api.post("register/", formData);
      toast.success("Usuario registrado correctamente.");
      fetchPersonnel();
      setShowForm(false);
      setFormData({
        username: "",
        email: "",
        password: "",
        password2: "",
        role: "EMPLOYEE",
        id_number: "",
        phone: "",
        fingerprint_id: "",
      });
    } catch (error: any) {
      console.error("Error registrando usuario:", error);
      toast.error("Error registrando usuario.");
    }
  };

  const filteredPersonnel = personnel.filter(
    (person) =>
      person.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personal</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          <PlusIcon size={16} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Registrar Nuevo Usuario</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Usuario</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Contraseña</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Confirmar Contraseña</label>
                <input
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">ID</label>
                <input
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Teléfono</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Guardar Usuario
            </button>
          </form>
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={18} className="text-gray-400" />
        </div>
        <input
          placeholder="Buscar personal..."
          className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs">Usuario</th>
              <th className="px-6 py-3 text-left text-xs">Rol</th>
              <th className="px-6 py-3 text-left text-xs">ID</th>
              <th className="px-6 py-3 text-left text-xs">Email</th>
              <th className="px-6 py-3 text-left text-xs">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPersonnel.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex gap-2 items-center">
                  <UserIcon size={18} className="text-gray-500" />
                  {person.username}
                </td>
                <td className="px-6 py-4">{person.role}</td>
                <td className="px-6 py-4">{person.id_number}</td>
                <td className="px-6 py-4">{person.email}</td>
                <td className="px-6 py-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
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
