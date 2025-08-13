import React, { useState, useEffect, useRef } from 'react';
import { ZoomInIcon, ZoomOutIcon, UnderlineIcon, TypeIcon, RefreshCcwIcon, SettingsIcon } from 'lucide-react';

interface AccessibilityToolsProps {
  theme: 'original' | 'modern';
}

export const AccessibilityTools: React.FC<AccessibilityToolsProps> = ({ theme }) => {
  const [fontSize, setFontSize] = useState(16); // Tamaño de fuente base en px
  const [isLinksUnderlined, setIsLinksUnderlined] = useState(false);
  const [isLegibleFont, setIsLegibleFont] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado del desplegable
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Aplicar cambios de accesibilidad al DOM
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.style.fontFamily = isLegibleFont
      ? '"Open Dyslexic", Arial, sans-serif'
      : 'inherit';
    const links = document.getElementsByTagName('a');
    for (let link of links) {
      link.style.textDecoration = isLinksUnderlined ? 'underline' : 'none';
    }
  }, [fontSize, isLinksUnderlined, isLegibleFont]);

  // Cerrar el desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24)); // Límite máximo de 24px
    setIsDropdownOpen(false);
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12)); // Límite mínimo de 12px
    setIsDropdownOpen(false);
  };

  const toggleLinkUnderline = () => {
    setIsLinksUnderlined((prev) => !prev);
    setIsDropdownOpen(false);
  };

  const toggleLegibleFont = () => {
    setIsLegibleFont((prev) => !prev);
    setIsDropdownOpen(false);
  };

  const resetSettings = () => {
    setFontSize(16);
    setIsLinksUnderlined(false);
    setIsLegibleFont(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className={`p-2 rounded ${
          theme === 'original' ? 'text-gray-600 hover:bg-gray-300' : 'text-white hover:bg-gray-700'
        } transition-colors duration-200`}
        title="Herramientas de accesibilidad"
      >
        <SettingsIcon size={20} />
      </button>
      {isDropdownOpen && (
        <div
          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50 ${
            theme === 'original' ? 'bg-gray-200' : 'bg-gray-600'
          }`}
        >
          <div className="flex flex-col p-2 gap-1">
            <button
              onClick={increaseFontSize}
              className={`flex items-center gap-2 p-2 rounded text-left ${
                theme === 'original' ? 'text-gray-600 hover:bg-gray-300' : 'text-white hover:bg-gray-700'
              } transition-colors duration-200`}
              title="Aumentar texto"
            >
              <ZoomInIcon size={20} />
              <span className="text-sm">Aumentar texto</span>
            </button>
            <button
              onClick={decreaseFontSize}
              className={`flex items-center gap-2 p-2 rounded text-left ${
                theme === 'original' ? 'text-gray-600 hover:bg-gray-300' : 'text-white hover:bg-gray-700'
              } transition-colors duration-200`}
              title="Disminuir texto"
            >
              <ZoomOutIcon size={20} />
              <span className="text-sm">Disminuir texto</span>
            </button>
            <button
              onClick={toggleLinkUnderline}
              className={`flex items-center gap-2 p-2 rounded text-left ${
                theme === 'original' ? 'text-gray-600 hover:bg-gray-300' : 'text-white hover:bg-gray-700'
              } transition-colors duration-200 ${isLinksUnderlined ? 'bg-gray-400' : ''}`}
              title="Subrayar enlaces"
            >
              <UnderlineIcon size={20} />
              <span className="text-sm">Subrayar enlaces</span>
            </button>
            <button
              onClick={toggleLegibleFont}
              className={`flex items-center gap-2 p-2 rounded text-left ${
                theme === 'original' ? 'text-gray-600 hover:bg-gray-300' : 'text-white hover:bg-gray-700'
              } transition-colors duration-200 ${isLegibleFont ? 'bg-gray-400' : ''}`}
              title="Fuente legible"
            >
              <TypeIcon size={20} />
              <span className="text-sm">Fuente legible</span>
            </button>
            <button
              onClick={resetSettings}
              className={`flex items-center gap-2 p-2 rounded text-left ${
                theme === 'original' ? 'text-gray-600 hover:bg-gray-300' : 'text-white hover:bg-gray-700'
              } transition-colors duration-200`}
              title="Restablecer"
            >
              <RefreshCcwIcon size={20} />
              <span className="text-sm">Restablecer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};