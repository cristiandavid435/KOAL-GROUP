import React, { useState } from 'react';
import {
  LogInIcon,
  PackageIcon,
  CloudIcon,
  HardHatIcon,
  WrenchIcon,
  HelpCircleIcon,
  LogOutIcon,
  XIcon,
} from 'lucide-react';

import LogoKoal from '../../../assets/hola.png';
import manualPdf from './hola.pdf'; // 👈 Importar el PDF directamente

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLocked: boolean;
  handleSignOut: () => void;
  theme: 'original' | 'modern';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  handleSignOut,
  isOpen,
  setIsOpen,
  theme,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const menuItems = [
    { id: 'access-control', label: 'Control de Acceso', icon: <LogInIcon size={20} /> },
    { id: 'inventory', label: 'Producción', icon: <PackageIcon size={20} /> },
    { id: 'gas-registry', label: 'Registro de Gases', icon: <CloudIcon size={20} /> },
    { id: 'work-fronts', label: 'Frentes de Trabajo', icon: <HardHatIcon size={20} /> },
    { id: 'inventario-herramientas', label: 'Inventario de Herramientas', icon: <WrenchIcon size={20} /> },
  ];

  const isMobile = () => window.innerWidth < 1024;

  return (
    <aside
      className={`${
        theme === 'original' ? 'bg-gray-900' : 'bg-stone-600'
      } text-white transition-all duration-300 flex flex-col h-full ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={LogoKoal}
            alt="Logo Koal"
            className={`${
              theme === 'original'
                ? 'h-14 w-14'
                : 'h-12 w-12 border-2 border-stone-300'
            } rounded-full object-cover`}
          />
          <h1 className={`font-bold ${theme === 'original' ? 'text-xl' : 'text-lg'}`}>
            Panel Supervisor
          </h1>
        </div>
        <button
          className={`p-2 rounded ${
            theme === 'original' ? 'hover:bg-gray-300' : 'hover:bg-stone-700'
          } transition-colors duration-200 lg:hidden`}
          onClick={() => setIsOpen(false)}
        >
          <XIcon size={20} />
        </button>
      </div>

      <nav className={`flex-grow ${theme === 'original' ? 'mt-8' : 'mt-6'}`}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile()) setIsOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
                  theme === 'original'
                    ? activeTab === item.id
                      ? 'bg-gray-800 border-l-4 border-white'
                      : 'hover:bg-gray-800'
                    : activeTab === item.id
                      ? 'bg-stone-700 border-l-4 border-stone-300'
                      : 'hover:bg-stone-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className={theme === 'modern' ? 'text-sm' : ''}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`p-4 mt-auto ${
          theme === 'original' ? 'border-t border-gray-700' : 'border-t border-stone-500'
        }`}
      >
        <button
          onClick={() => setShowHelp(true)}
          className={`w-full text-left py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 ${
            theme === 'original' ? 'hover:bg-gray-700' : 'hover:bg-stone-700'
          }`}
        >
          <HelpCircleIcon size={20} />
          <span className={theme === 'modern' ? 'text-sm' : ''}>Ayuda</span>
        </button>
        <button
          onClick={handleSignOut}
          className={`w-full text-left py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200 ${
            theme === 'original'
              ? 'hover:bg-gray-700 text-red-400'
              : 'hover:bg-stone-700 text-red-300'
          }`}
        >
          <LogOutIcon size={20} />
          <span className={theme === 'modern' ? 'text-sm' : ''}>Cerrar sesión</span>
        </button>
      </div>

      {showHelp && (
        <div
          className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
            theme === 'original' ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-60'
          }`}
        >
          <div
            className={`bg-white ${
              theme === 'original' ? 'rounded-lg' : 'rounded-xl shadow-xl'
            } p-6 max-w-md w-full relative`}
          >
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <XIcon size={20} />
            </button>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'original' ? '' : 'text-gray-900'}`}>
              Centro de Ayuda - Supervisor
            </h2>
            <p className="text-gray-600 mb-4">
              Aquí encontrarás asistencia para tus tareas diarias:
            </p>
            <ul className={`list-disc pl-5 mb-4 text-gray-600 ${theme === 'original' ? 'space-y-1' : 'space-y-2'}`}>
              <li>🕓 Registrar entradas y salidas del personal.</li>
              <li>📦 Ingresar la producción diaria por tipo de material.</li>
              <li>🌫️ Registrar los niveles de gases por ubicación.</li>
              <li>🛠️ Asignar herramientas y controlar su estado.</li>
              <li>🏗️ Gestionar frentes de trabajo y reportar avances.</li>
            </ul>

            {/* Botón que abre el PDF importado */}
            <a
              href={manualPdf}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full text-center py-2 rounded mb-3 ${
                theme === 'original'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors duration-200`}
            >
              📄 Ver Manual en PDF
            </a>

            <p className="text-sm text-gray-500 mb-4">
              Para soporte técnico o capacitaciones personalizadas, contacta al área de sistemas.
            </p>
            <button
              onClick={() => setShowHelp(false)}
              className={`w-full py-2 rounded ${
                theme === 'original'
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-stone-600 text-white hover:bg-stone-700'
              } transition-colors duration-200`}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
