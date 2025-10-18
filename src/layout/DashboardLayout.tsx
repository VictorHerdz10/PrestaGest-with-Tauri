// src/layout/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Verificar el tamaño inicial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
      />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen && !isMobile ? 'ml-64' : ''}`}>
        <div className="p-8">
          {(!isSidebarOpen || isMobile) && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden mb-4 p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              <FiMenu size={24} />
            </button>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}