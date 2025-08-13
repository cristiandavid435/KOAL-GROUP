// src/components/admin/AccessibilityToolsAdmin.tsx
import React, { useState } from 'react';
import {
  SettingsIcon,
  ZoomInIcon,
  ZoomOutIcon,
  TypeIcon,
  RefreshCwIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react';

interface Props {
  onFontSizeChange: (action: 'increase' | 'decrease' | 'reset') => void;
  onToggleUnderlineLinks: () => void;
  onToggleReadableFont: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

export const AccessibilityToolsAdmin: React.FC<Props> = ({
  onFontSizeChange,
  onToggleUnderlineLinks,
  onToggleReadableFont,
  onToggleTheme,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 right-44 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-900"
        aria-label="Abrir accesibilidad admin"
      >
        <SettingsIcon size={20} />
      </button>
      {isOpen && (
        <div className="absolute top-14 right-0 bg-gray-900 text-white rounded-lg shadow-lg p-3 w-52">
          <button onClick={() => onFontSizeChange('increase')} className="w-full flex gap-2 items-center p-1 hover:bg-blue-800 rounded">
            <ZoomInIcon size={16} /> Aumentar texto
          </button>
          <button onClick={() => onFontSizeChange('decrease')} className="w-full flex gap-2 items-center p-1 hover:bg-blue-800 rounded">
            <ZoomOutIcon size={16} /> Disminuir texto
          </button>
          <button onClick={onToggleUnderlineLinks} className="w-full flex gap-2 items-center p-1 hover:bg-blue-800 rounded">
            <TypeIcon size={16} /> Subrayar enlaces
          </button>
          <button onClick={onToggleReadableFont} className="w-full flex gap-2 items-center p-1 hover:bg-blue-800 rounded">
            <TypeIcon size={16} /> Fuente legible
          </button>
          <button onClick={onToggleTheme} className="w-full flex gap-2 items-center p-1 hover:bg-blue-800 rounded">
            {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </button>
          <button onClick={() => onFontSizeChange('reset')} className="w-full flex gap-2 items-center p-1 hover:bg-blue-800 rounded">
            <RefreshCwIcon size={16} /> Restablecer
          </button>
        </div>
      )}
    </div>
  );
};
