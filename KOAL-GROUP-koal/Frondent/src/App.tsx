import React, { useState, useEffect, Component, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LogoKoal from './assets/hola.png';
import { Login } from './Login';
import { ResetPassword } from './ResetPassword';
import { DashboardLayout } from './components/super/Layout/Dashboard';
import { AccessControlPanel } from './components/super/AccessControl/AccessControlPanel';
import { InventoryPanel } from './components/super/Inventory_andproduction/InventoryPanel';
import { GasRegistryPanel } from './components/super/GasRegistry/GasRegistryPanel';
import { WorkFrontsPanel } from './components/super/WorkFronts/WorkFrontsPanel';
import { InventarioHerramientasPanel } from './components/super/InventarioHerramientas/InventarioHerramientasPanel';
import { Dashboard } from './components/admin/Dashboard';
import { ProjectList } from './components/admin/ProjectList';
import { PersonnelList } from './components/admin/PersonnelList';
import { Reports } from './components/admin/Reports';
import { ProductionView } from './components/admin/ProductionView';

import { AccessibilityToolsAdmin } from './components/admin/AccessibilityToolsAdmin';
import {
  HelpCircleIcon,
  LogOutIcon,
  HouseIcon,
  FolderCheckIcon,
  User2Icon,
  PickaxeIcon,
  XIcon,
  AccessibilityIcon,
  ZoomInIcon,
  ZoomOutIcon,
  TypeIcon,
  RefreshCwIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react';
import axiosInstance from './axiosInstance';

interface TokenResponse {
  access: string;
}

interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  className?: string;
}

// Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-red-500 font-bold">Algo salió mal. Por favor, recarga la página.</div>;
    }
    return this.props.children;
  }
}

// Componente de herramientas de accesibilidad
const AccessibilityTools: React.FC<{
  onFontSizeChange: (action: 'increase' | 'decrease' | 'reset') => void;
  onToggleUnderlineLinks: () => void;
  onToggleReadableFont: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}> = ({ onFontSizeChange, onToggleUnderlineLinks, onToggleReadableFont, onToggleTheme, theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
        aria-label="Abrir herramientas de accesibilidad"
      >
        <AccessibilityIcon size={20} />
      </button>
      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-gray-800 text-white rounded-lg shadow-lg p-3 w-48">
          <button
            onClick={() => onFontSizeChange('increase')}
            className="w-full text-left py-1 px-2 hover:bg-gray-700 rounded flex items-center gap-2"
            aria-label="Aumentar tamaño de texto"
          >
            <ZoomInIcon size={16} />
            Aumentar texto
          </button>
          <button
            onClick={() => onFontSizeChange('decrease')}
            className="w-full text-left py-1 px-2 hover:bg-gray-700 rounded flex items-center gap-2"
            aria-label="Disminuir tamaño de texto"
          >
            <ZoomOutIcon size={16} />
            Disminuir texto
          </button>
          <button
            onClick={onToggleUnderlineLinks}
            className="w-full text-left py-1 px-2 hover:bg-gray-700 rounded flex items-center gap-2"
            aria-label="Subrayar enlaces"
          >
            <TypeIcon size={16} />
            Subrayar enlaces
          </button>
          <button
            onClick={onToggleReadableFont}
            className="w-full text-left py-1 px-2 hover:bg-gray-700 rounded flex items-center gap-2"
            aria-label="Cambiar a fuente legible"
          >
            <TypeIcon size={16} />
            Fuente legible
          </button>
          <button
            onClick={onToggleTheme}
            className="w-full text-left py-1 px-2 hover:bg-gray-700 rounded flex items-center gap-2"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </button>
          <button
            onClick={() => onFontSizeChange('reset')}
            className="w-full text-left py-1 px-2 hover:bg-gray-700 rounded flex items-center gap-2"
            aria-label="Restablecer configuraciones"
          >
            <RefreshCwIcon size={16} />
            Restablecer
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('access-control');
  const [activeView, setActiveView] = useState('dashboard');
  const [showHelp, setShowHelp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [readableFont, setReadableFont] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();

          if (!isExpired) {
            setRole(payload.role);
            setUsername(payload.username);
          } else if (refreshToken) {
            const res = await axiosInstance.post<TokenResponse>('token/refresh/', { refresh: refreshToken });
            const newToken = res.data.access;
            localStorage.setItem('accessToken', newToken);
            const newPayload = JSON.parse(atob(newToken.split('.')[1]));
            setRole(newPayload.role);
            setUsername(newPayload.username);
          } else {
            handleSignOut();
          }
        } catch {
          handleSignOut();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const handleLogin = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    window.location.reload();
  };

  const handleSignOut = () => {
    localStorage.clear();
    setRole(null);
    setUsername(null);
    setActiveTab('access-control');
    setActiveView('dashboard');
    setTheme('light');
  };

  const renderSupervisorContent = () => {
    switch (activeTab) {
      case 'access-control': return <AccessControlPanel />;
      case 'inventory': return <InventoryPanel />;
      case 'gas-registry': return <GasRegistryPanel />;
      case 'work-fronts': return <WorkFrontsPanel />;
      case 'inventario-herramientas': return <InventarioHerramientasPanel />;
      default: return <AccessControlPanel />;
    }
  };

  const renderAdminView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <ProjectList />;
      case 'personnel': return <PersonnelList />;
      case 'reports': return <Reports />;
      case 'production': return <ProductionView />;
      default: return <Dashboard />;
    }
  };

  const handleNavigationClick = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  const handleFontSizeChange = (action: 'increase' | 'decrease' | 'reset') => {
    if (action === 'increase') {
      setFontSize((prev) => Math.min(prev + 2, 24));
    } else if (action === 'decrease') {
      setFontSize((prev) => Math.max(prev - 2, 12));
    } else {
      setFontSize(16);
      setUnderlineLinks(false);
      setReadableFont(false);
      setTheme('light');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleToggleUnderlineLinks = () => {
    setUnderlineLinks((prev) => !prev);
  };

  const handleToggleReadableFont = () => {
    setReadableFont((prev) => !prev);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  if (loading) return <div className="p-8 text-gray-700">Cargando...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !role ? (
              <Login onLogin={handleLogin} />
            ) : role === 'SUPERVISOR' ? (
              <DashboardLayout
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                username={username || 'Usuario'}
                handleSignOut={handleSignOut}
              >
                <ErrorBoundary>{renderSupervisorContent()}</ErrorBoundary>

                <AccessibilityTools
                  onFontSizeChange={handleFontSizeChange}
                  onToggleUnderlineLinks={handleToggleUnderlineLinks}
                  onToggleReadableFont={handleToggleReadableFont}
                  onToggleTheme={handleToggleTheme}
                  theme={theme}
                />
              </DashboardLayout>
            ) : role === 'ADMIN' ? (
              <div
                className={`flex flex-col h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900 text-white'}`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: readableFont ? '"Open Dyslexic", Arial, sans-serif' : 'inherit',
                }}
              >
                <header className={`flex items-center justify-between ${theme === 'light' ? 'bg-gray-900 text-white' : 'bg-gray-800 text-gray-200'} px-6 py-4 shadow`}>
                  <div className="flex items-center gap-3">
                    <img src={LogoKoal} alt="Logo Koal Group" className="h-14 w-14 object-cover rounded-full" />
                    <h1 className="text-2xl font-semibold">Panel de Administración</h1>
                  </div>
                  <div className="text-sm text-gray-300">
                    Bienvenido, <span className="font-medium text-white">{username}</span>
                  </div>
                </header>

                <main className="flex flex-1 overflow-hidden">
                  <button
                    className="lg:hidden fixed top-4 left-4 z-20 bg-gray-800 text-white p-2 rounded shadow-lg"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? <XIcon size={24} /> : <span>☰</span>}
                  </button>
                  <div className={`w-64 ${theme === 'light' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-200'} flex-shrink-0 ${isMobileMenuOpen ? 'flex flex-col' : 'hidden'} lg:flex lg:flex-col z-10`}>
                    <div className="flex flex-col h-full p-4">
                      <NavButton label="Panel Principal" icon={<HouseIcon size={20} />} onClick={() => handleNavigationClick('dashboard')} active={activeView === 'dashboard'} />
                      <NavButton label="Proyectos" icon={ <FolderCheckIcon size={20} />} onClick={() => handleNavigationClick('projects')} active={activeView === 'projects'} />
                      <NavButton label="Personal" icon={<User2Icon size={20} />} onClick={() => handleNavigationClick('personnel')} active={activeView === 'personnel'} />
                      <NavButton label="Producción" icon={<PickaxeIcon size={20} />} onClick={() => handleNavigationClick('production')} active={activeView === 'production'} />
                      <div className="mt-auto border-t border-gray-600 pt-4">
                        <NavButton label="Ayuda" icon={<HelpCircleIcon size={20} />} onClick={() => setShowHelp(true)} />
                        <NavButton label="Cerrar sesión" icon={<LogOutIcon size={20} />} onClick={handleSignOut} className="text-red-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-6">
                    <ErrorBoundary>{renderAdminView()}</ErrorBoundary>
                  </div>
                </main>

                {showHelp && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`${theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'} rounded-lg p-6 max-w-md w-full relative`}>
                      <button
                        onClick={() => setShowHelp(false)}
                        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                      >
                        <XIcon size={20} />
                      </button>
                      <h2 className="text-xl font-bold mb-4">Centro de Ayuda - Administrador</h2>
                      <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} mb-3`}>
                        Aquí puedes encontrar orientación sobre las funciones principales del panel:
                      </p>
                      <ul className={`list-disc pl-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} space-y-2`}>
                        <li>📊 Visualizar el estado general de los proyectos en el panel principal.</li>
                        <li>👷 Gestionar el personal: crear, editar o eliminar usuarios.</li>
                        <li>📁 Supervisar y administrar proyectos activos.</li>
                        <li>⛏️ Ver el historial de producción por proyecto o fecha.</li>
                        <li>💾 Descargar backups de seguridad desde el botón superior.</li>
                      </ul>
                      <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                        ¿Necesitas más ayuda? Contacta al área de sistemas para soporte técnico o capacitación.
                      </p>
                      <button
                        onClick={() => setShowHelp(false)}
                        className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}
                <AccessibilityToolsAdmin
                  onFontSizeChange={handleFontSizeChange}
                  onToggleUnderlineLinks={handleToggleUnderlineLinks}
                  onToggleReadableFont={handleToggleReadableFont}
                  onToggleTheme={handleToggleTheme}
                  theme={theme}
                />
              </div>
            ) : (
              <div className="p-8 text-red-500 font-bold">Rol no autorizado o token inválido</div>
            )
          }
        />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <style>
        {`
          a {
            ${underlineLinks ? 'text-decoration: underline !important;' : ''}
          }
        `}
      </style>
    </Router>
  );
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, onClick, active = false, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-2 px-4 rounded flex items-center gap-2 ${
        active ? 'bg-gray-700' : 'hover:bg-gray-700'
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default App;