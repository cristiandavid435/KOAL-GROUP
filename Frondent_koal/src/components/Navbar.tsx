import React from 'react';
import { BellIcon, UserIcon, HomeIcon } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
}
export const Navbar: React.FC<NavbarProps> = ({
  onNavigate
}) => {
  return   (
    <header className="bg-black border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <HomeIcon size={24} className="text-white" />
        <h2 className="text-xl font-semibold text-white">
          Koal Group
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-1 rounded-full hover:bg-white-100">
          <BellIcon size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <UserIcon size={18} className="text-black" />
          </div>
          <span className="text-sm font-medium text-white">Administrador</span>
        </div>
      </div>
    </header>
  )
};