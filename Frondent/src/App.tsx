import React, { useState, useEffect } from 'react';
import { Login } from './Login';
import { DashboardLayout } from './components/super/Layout/Dashboard';
import { AccessControlPanel } from './components/super/AccessControl/AccessControlPanel';
import { InventoryPanel } from './components/super/Inventory/InventoryPanel';
import { GasRegistryPanel } from './components/super/GasRegistry/GasRegistryPanel';
import { WorkFrontsPanel } from './components/super/WorkFronts/WorkFrontsPanel';
import { InventarioHerramientasPanel } from './components/super/InventarioHerramientas/InventarioHerramientasPanel';

import { Dashboard } from './components/admin/Dashboard';
import { ProjectList } from './components/admin/ProjectList';
import { PersonnelList } from './components/admin/PersonnelList';
import { Reports } from './components/admin/Reports';
import { ProductionView } from './components/admin/ProductionView';

import {
  HelpCircleIcon,
  LogOutIcon,
  HouseIcon,
  FolderCheckIcon,
  User2Icon,
  LibraryBigIcon,
  PickaxeIcon,
  XIcon,
} from 'lucide-react';

import axiosInstance from './axiosInstance';

export function App() {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('access-control');
  const [activeView, setActiveView] = useState('dashboard');
  const [showHelp, setShowHelp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.exp * 1000 > Date.now()) {
          setRole(payload.role);
          setUsername(payload.username);
        } else {
          handleSignOut();
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          axiosInstance
            .post('token/refresh/', { refresh: refreshToken })
            .then((res) => {
              localStorage.setItem('accessToken', (res.data as { access: string }).access);
            })
            .catch(() => {
              handleSignOut();
            });
        }
      } catch (e) {
        console.error('Token corrupto:', e);
        handleSignOut();
      }
    }
  }, []);

  const handleLogin = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    setRole(payload.role);
    setUsername(payload.username);
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setRole(null);
    setUsername(null);
    setActiveTab('access-control');
    setActiveView('dashboard');
  };

  const renderSupervisorContent = () => {
    switch (activeTab) {
      case 'access-control':
        return <AccessControlPanel />;
      case 'inventory':
        return <InventoryPanel />;
      case 'gas-registry':
        return <GasRegistryPanel />;
      case 'work-fronts':
        return <WorkFrontsPanel />;
      case 'inventario-herramientas':
        return <InventarioHerramientasPanel />;
      default:
        return <AccessControlPanel />;
    }
  };

  const renderAdminView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectList />;
      case 'personnel':
        return <PersonnelList />;
      case 'reports':
        return <Reports />;
      case 'production':
        return <ProductionView />;
      default:
        return <Dashboard />;
    }
  };

  const handleNavigationClick = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  if (role === 'SUPERVISOR') {
    return (
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        username={username || 'Usuario'}
        handleSignOut={handleSignOut}
      >
        {renderSupervisorContent()}
      </DashboardLayout>
    );
  }

  if (role === 'ADMIN') {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="bg-gray-900 text-white p-4 text-xl font-bold shadow">
          Panel de Administrador — {username}
        </div>
        <main className="flex flex-1 overflow-hidden">
          <button
            className="lg:hidden fixed top-4 left-4 z-20 bg-gray-800 text-white p-2 rounded shadow-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <XIcon size={24} /> : <span>☰</span>}
          </button>

          <div
            className={`w-64 bg-gray-800 text-white flex-shrink-0 ${
              isMobileMenuOpen ? 'flex flex-col' : 'hidden'
            } lg:flex lg:flex-col lg:w-64 z-10 lg:z-auto`}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 font-medium flex-1 overflow-y-auto">
                <button
                  onClick={() => handleNavigationClick('dashboard')}
                  className={`w-full text-left py-2 px-4 rounded flex items-center gap-2 ${
                    activeView === 'dashboard'
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <HouseIcon size={20} />
                  <span>Panel Principal</span>
                </button>
                <button
                  onClick={() => handleNavigationClick('projects')}
                  className={`w-full text-left py-2 px-4 rounded flex items-center gap-2 ${
                    activeView === 'projects'
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <FolderCheckIcon size={20} />
                  <span>Proyectos</span>
                </button>
                <button
                  onClick={() => handleNavigationClick('personnel')}
                  className={`w-full text-left py-2 px-4 rounded flex items-center gap-2 ${
                    activeView === 'personnel'
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <User2Icon size={20} />
                  <span>Personal</span>
                </button>
                <button
                  onClick={() => handleNavigationClick('reports')}
                  className={`w-full text-left py-2 px-4 rounded flex items-center gap-2 ${
                    activeView === 'reports'
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <LibraryBigIcon size={20} />
                  <span>Informes</span>
                </button>
                <button
                  onClick={() => handleNavigationClick('production')}
                  className={`w-full text-left py-2 px-4 rounded flex items-center gap-2 ${
                    activeView === 'production'
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <PickaxeIcon size={20} />
                  <span>Producción</span>
                </button>
              </div>
              <div className="p-4 border-t border-gray-700 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowHelp(true);
                    setIsMobileMenuOpen(false);
                  }}
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
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">{renderAdminView()}</div>
        </main>
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                aria-label="Close help modal"
              >
                <XIcon size={20} />
              </button>
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
                className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 text-red-500 font-bold">
      Rol no autorizado o token inválido
    </div>
  );
}
