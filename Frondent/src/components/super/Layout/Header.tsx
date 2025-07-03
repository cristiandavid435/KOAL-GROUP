import React from 'react';
import { MenuIcon, UserIcon } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  isMaximized: boolean;
  username?: string;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, username }) => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      {/* lado izquierdo */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 text-gray-600 hover:text-gray-900"
          onClick={toggleSidebar}
        >
          <MenuIcon size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Panel de Control</h1>
      </div>
      {/* lado derecho */}
      <div className="flex items-center gap-2 text-gray-800">
        <UserIcon size={20} />
        <span className="font-medium">{username || "Usuario"}</span>
      </div>
    </header>
  );
};
