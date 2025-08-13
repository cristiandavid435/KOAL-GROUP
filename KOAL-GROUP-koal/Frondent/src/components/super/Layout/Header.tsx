import React from 'react';
import { MenuIcon, UserIcon, PaletteIcon } from 'lucide-react';
import { AccessibilityTools } from './AccessibilityTools'; // Importar el nuevo componente

interface HeaderProps {
  toggleSidebar: () => void;
  isMaximized: boolean;
  username?: string;
  theme: 'original' | 'modern';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, username, theme, toggleTheme }) => {
  return (
    <header
      className={`${
        theme === 'original' ? 'bg-white shadow-md' : 'bg-gray-600 shadow-lg'
      } p-4 flex items-center justify-between`}
    >
      {/* Lado izquierdo */}
      <div className="flex items-center gap-4">
        <button
          className={`p-2 ${
            theme === 'original' ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-300'
          } transition-colors duration-200`}
          onClick={toggleSidebar}
        >
          <MenuIcon size={24} />
        </button>
        <h1
          className={`text-xl font-semibold ${
            theme === 'original' ? 'text-gray-800' : 'text-white'
          }`}
        >
          Panel de Control
        </h1>
      </div>
      {/* Lado derecho */}
      <div className="flex items-center gap-3">
        <AccessibilityTools theme={theme} /> {/* Agregar herramientas de accesibilidad */}
        <button
          className={`p-2 ${
            theme === 'original' ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-gray-300'
          } transition-colors duration-200`}
          onClick={toggleTheme}
        >
          <PaletteIcon size={20} />
        </button>
        <div
          className={`flex items-center gap-2 ${
            theme === 'original' ? 'text-gray-800' : 'text-white'
          }`}
        >
          <UserIcon size={20} className={theme === 'modern' ? 'text-gray-300' : ''} />
          <span className={`font-medium ${theme === 'modern' ? 'text-sm' : ''}`}>
            {username || 'Usuario'}
          </span>
        </div>
      </div>
    </header>
  );
};