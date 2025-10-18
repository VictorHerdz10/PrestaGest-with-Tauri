// TitleBar.tsx
import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const setupWindow = async () => {
      const window = getCurrentWindow();
      
      // Verificar estado inicial
      const maximized = await window.isMaximized();
      setIsMaximized(maximized);
      
      // Escuchar cambios en el estado de la ventana
      const unlisten = await window.onResized(async () => {
        const currentlyMaximized = await window.isMaximized();
        setIsMaximized(currentlyMaximized);
      });

      return unlisten;
    };

    const unlistenPromise = setupWindow();

    return () => {
      unlistenPromise.then(unlisten => {
        if (unlisten) {
          unlisten();
        }
      });
    };
  }, []);

  const handleClose = async () => {
    await invoke('close_window');
  };

  const handleMinimize = async () => {
    await invoke('minimize_window');
  };

  const handleMaximize = async () => {
    await invoke('maximize_window');
  };

  return (
    <div className="h-8 bg-indigo-900/90 backdrop-blur-md flex justify-between items-center px-4 border-b border-indigo-700/30 select-none">
      {/* Lado izquierdo - Logo y título */}
      <div className="flex items-center space-x-2" data-tauri-drag-region>
        <div className="w-4 h-4 flex items-center justify-center">
          <img
            src="./logo.png"
            alt="PrestaGest"
            className="w-3 h-3 object-contain"
          />
        </div>
        <span className="text-white text-sm font-medium" data-tauri-drag-region>
          PrestaGest
        </span>
      </div>
      
      {/* Lado derecho - Controles de ventana */}
      <div className="flex items-center space-x-1">
        <button
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-indigo-700/50 transition-colors rounded-sm"
          onClick={handleMinimize}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="0" y="5" width="12" height="2" />
          </svg>
        </button>
        
        <button
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-indigo-700/50 transition-colors rounded-sm"
          onClick={handleMaximize}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2,2 L8,2 L8,8 L2,8 L2,2 Z M3,3 L7,3 L7,7 L3,7 L3,3 Z" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="0" y="0" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>
        
        <button
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-red-500 transition-colors rounded-sm"
          onClick={handleClose}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;