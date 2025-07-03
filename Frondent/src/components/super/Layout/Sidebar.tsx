import React, { useState } from 'react';
import { LogInIcon, PackageIcon, CloudIcon, HardHatIcon, LayoutDashboardIcon, WrenchIcon, HelpCircleIcon, LogOutIcon, XIcon } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLocked: boolean;
  handleSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  handleSignOut,
  isOpen,
  setIsOpen,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const menuItems = [
    {
      id: 'access-control',
      label: 'Control de Acceso',
      icon: <LogInIcon size={20} />,
    },
    {
      id: 'inventory',
      label: 'Producción',
      icon: <PackageIcon size={20} />,
    },
    {
      id: 'gas-registry',
      label: 'Registro de Gases',
      icon: <CloudIcon size={20} />,
    },
    {
      id: 'work-fronts',
      label: 'Frentes de Trabajo',
      icon: <HardHatIcon size={20} />,
    },
    {
      id: 'inventario-herramientas',
      label: 'Inventario de Herramientas',
      icon: <WrenchIcon size={20} />,
    },
  ];

  // Función para determinar si estamos en una pantalla móvil
  const isMobile = () => window.innerWidth < 1024; // Equivalente al breakpoint `lg` de Tailwind

  return (
    <aside
      className={`bg-gray-900 text-white transition-all duration-300 flex flex-col h-full ${
        isOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboardIcon size={28} />
          <h1 className="text-xl font-bold">Panel Supervisor</h1>
        </div>
        <button
          className="py-2 px-2 rounded hover:bg-gray-300 flex items-center gap-2 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <XIcon size={20} />
        </button>
      </div>
      <nav className="mt-8 flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  // Cerrar el sidebar solo si estamos en una pantalla móvil
                  if (isMobile()) {
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center px-6 py-3 text-left ${
                  activeTab === item.id ? 'bg-gray-800 border-l-4 border-white' : 'hover:bg-gray-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700 mt-auto">
        <button
          onClick={() => setShowHelp(true)}
          className="w-full text-left py-2 px-4 rounded hover:bg-gray-700 flex items-center gap-2"
        >
          <HelpCircleIcon size={20} />
          <span>Ayuda</span>
        </button>
        <button
          onClick={handleSignOut}
          className="w-full text-left py-2 px-4 rounded hover:bg-gray-700 flex items-center gap-2 text-red-400"
        >
          <LogOutIcon size={20} />
          <span>Cerrar sesión</span>
        </button>
      </div>
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Centro de Ayuda</h2>
            <p className="text-gray-600 mb-4">
              Para obtener ayuda sobre cómo usar el sistema, puede:
            </p>
            <ul className="list-disc pl-5 mb-4 text-gray-600">
              <li>Consultar el manual de usuario</li>
              <li>Contactar al soporte técnico</li>
              <li>Ver los videos tutoriales</li>
              <li>Leer las preguntas frecuentes</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};