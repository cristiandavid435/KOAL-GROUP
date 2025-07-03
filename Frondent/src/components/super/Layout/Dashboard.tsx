import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  username?: string;
  handleSignOut: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  username,
  handleSignOut,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const isWindowMaximized = () => {
    const tolerance = 10;
    return (
      Math.abs(window.outerWidth - window.screen.availWidth) <= tolerance &&
      Math.abs(window.outerHeight - window.screen.availHeight) <= tolerance
    );
  };

  useEffect(() => {
    const handleResize = () => {
      const maximized = isWindowMaximized();
      setIsMaximized(maximized);
      setIsSidebarOpen(maximized);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (!isMaximized) {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        isLocked={isMaximized}
        setIsOpen={setIsSidebarOpen}
        handleSignOut={handleSignOut}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          isMaximized={isMaximized}
          username={username}
        />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};
