// src/components/Dashboard/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiDollarSign, FiLogOut,
  FiUser,
  FiX,
  FiBarChart2,
  FiCreditCard,
  FiRepeat
} from 'react-icons/fi';

const menuItems = [
  { name: 'Inicio', icon: <FiHome size={20} />, path: '/dashboard' },
  { name: 'Prestatarios', icon: <FiUsers size={20} />, path: '/dashboard/borrowers' },
  { name: 'Préstamos', icon: <FiDollarSign size={20} />, path: '/dashboard/loans' },
  { name: 'Pagos', icon: <FiCreditCard size={20} />, path: '/dashboard/payments' },
  { name: 'Monedas', icon: <FiPackage size={20} />, path: '/dashboard/currencies' },
  { name: 'Conversión', icon: <FiRepeat size={20} />, path: '/dashboard/exchange' },
  { name: 'Reportes', icon: <FiBarChart2 size={20} />, path: '/dashboard/reports' },
];
const sidebarVariants: Variants = {
  open: { 
    x: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 1,
      velocity: 0
    }
  },
  closed: { 
    x: '-100%',
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 1,
      velocity: 0
    }
  },
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Cerrar sesión</h3>
        <p className="text-gray-600 mb-6">¿Estás seguro que deseas salir de tu cuenta?</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation(); // Hook para obtener la ruta actual

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    if (isMobile && isOpen) {
      const handleRouteChange = () => onClose();
      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }
  }, [isMobile, isOpen, onClose]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  // Función para determinar si un ítem está activo
  const isItemActive = (itemPath: string) => {
    return location.pathname === itemPath || 
           (itemPath !== '/dashboard' && location.pathname.startsWith(itemPath));
  };

  return (
    <>
      {/* Overlay para móvil */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Modal de confirmación */}
      {showLogoutModal && (
        <LogoutModal 
          onConfirm={handleLogout} 
          onCancel={() => setShowLogoutModal(false)} 
        />
      )}

      <motion.div
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : isMobile ? "closed" : "open"}
        variants={sidebarVariants}
        className="fixed left-0 top-0 h-full w-64 bg-indigo-900 text-white shadow-lg z-30"
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="./logo.png"
                  alt="Logo PrestaGest"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold">PrestaGest</h1>
            </div>
            {isMobile && (
              <button 
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-indigo-800"
              >
                <FiX size={20} />
              </button>
            )}
          </div>

          {user && (
            <div className="mb-8 p-4 bg-indigo-800/50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                  <FiUser size={18} />
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-indigo-300">{user.phone}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <motion.li
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isItemActive(item.path) 
                        ? 'bg-indigo-700 shadow-md' 
                        : 'hover:bg-indigo-800'
                    }`}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-800 transition-colors"
            >
              <FiLogOut size={20} className="mr-3" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}