import React from "react";
import { BellIcon, UserIcon, HomeIcon, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  username: string;
  role: string;
  exp: number;
}

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  // intentar leer el token para el usuario
  let username = "Desconocido";
  let role = "";
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      username = decoded.username;
      role = decoded.role;
    }
  } catch {
    // token inválido o corrupto
  }

  return (
    <header className="bg-black border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <HomeIcon size={24} className="text-white" />
        <h2 className="text-xl font-semibold text-white">Koal Group</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-1 rounded-full hover:bg-gray-700">
          <BellIcon size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <UserIcon size={18} className="text-black" />
          </div>
          <span className="text-sm font-medium text-white">
            {username} ({role})
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 text-white hover:text-gray-300"
        >
          <LogOutIcon size={18} />
          <span className="hidden md:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
};
