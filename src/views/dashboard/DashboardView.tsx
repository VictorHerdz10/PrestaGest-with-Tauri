// src/views/dashboard/DashboardView.tsx
import { useBorrowers } from "../../hooks/useBorrowers";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";

export default function DashboardView() {
  const { data: borrowers = [] } = useBorrowers();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Rotar entre prestamistas cada 5 segundos
  useEffect(() => {
    if (!isAutoRotating || borrowers.length === 0) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % borrowers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [borrowers.length, isAutoRotating]);

  const handlePrev = () => {
    setIsAutoRotating(false);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + borrowers.length) % borrowers.length);
  };

  const handleNext = () => {
    setIsAutoRotating(false);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % borrowers.length);
  };

  const handleToggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating);
  };

  // Efecto de animación para el balance
  const balanceVariants = {
    positive: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 rgba(16, 185, 129, 0)",
        "0 0 20px rgba(16, 185, 129, 0.5)",
        "0 0 0 rgba(16, 185, 129, 0)",
      ],
      transition: { duration: 2, repeat: Infinity },
    },
    negative: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 rgba(239, 68, 68, 0)",
        "0 0 20px rgba(239, 68, 68, 0.5)",
        "0 0 0 rgba(239, 68, 68, 0)",
      ],
      transition: { duration: 2, repeat: Infinity },
    },
    zero: {
      scale: [1, 1.02, 1],
      boxShadow: [
        "0 0 0 rgba(59, 130, 246, 0)",
        "0 0 15px rgba(59, 130, 246, 0.5)",
        "0 0 0 rgba(59, 130, 246, 0)",
      ],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  if (borrowers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Panel de Control
          </span>
        </h1>
        <div className="bg-indigo-50 p-6 rounded-lg mb-6">
          <p className="text-gray-700">No hay prestamistas registrados aún.</p>
        </div>
      </div>
    );
  }

  const currentBorrower = borrowers[currentIndex];
  const balanceStatus =
    currentBorrower.balance > 0
      ? "negative"
      : currentBorrower.balance < 0
      ? "positive"
      : "zero";

  // Determinar estado correcto
  const getBorrowerStatus = (borrower: typeof currentBorrower) => {
    if (borrower.total_loans === 0 && borrower.total_paid === 0) {
      return "Registrado";
    }
    return borrower.status === "active" ? "Activo" : "Pagado";
  };

  const getStatusClass = (borrower: typeof currentBorrower) => {
    if (borrower.total_loans === 0 && borrower.total_paid === 0) {
      return "bg-gradient-to-r from-indigo-500 to-purple-500 text-white";
    }
    return borrower.status === "active"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <p className="opacity-90">Resumen financiero de prestamistas</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleAutoRotate}
              className={`px-3 py-1 rounded-full text-sm ${
                isAutoRotating
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-700 text-white"
              }`}
            >
              {isAutoRotating ? "Auto ✓" : "Auto ✗"}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de prestamista con animación */}
        <div className="lg:col-span-2 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: direction * 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-md border border-indigo-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <FiUser className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {currentBorrower.name}
                    </h2>
                    <p className="text-indigo-600">{currentBorrower.phone}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                    currentBorrower
                  )}`}
                >
                  {getBorrowerStatus(currentBorrower)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Préstamos totales</p>
                  <p className="text-xl font-bold text-indigo-700">
                    {formatCurrency(currentBorrower.total_loans)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Total pagado</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(currentBorrower.total_paid)}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controles de navegación */}
          {borrowers.length > 1 && (
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
              >
                <FiChevronLeft className="text-xl" />
              </button>
              <div className="text-sm text-gray-500 flex items-center">
                {currentIndex + 1} de {borrowers.length}
              </div>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
              >
                <FiChevronRight className="text-xl" />
              </button>
            </div>
          )}
        </div>

        {/* Esfera de balance futurista */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            variants={balanceVariants}
            animate={balanceStatus}
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center ${
              currentBorrower.balance > 0
                ? "bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200"
                : currentBorrower.balance < 0
                ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
                : "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200"
            } shadow-lg`}
          >
            <p className="text-sm text-gray-500 mb-2">Balance actual</p>
            <p
              className={`text-3xl font-bold ${
                currentBorrower.balance > 0
                  ? "text-red-600"
                  : currentBorrower.balance < 0
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              {formatCurrency(Math.abs(currentBorrower.balance))}
            </p>
            <div className="mt-4">
              {currentBorrower.balance > 0 ? (
                <FiTrendingUp className="text-red-500 text-2xl" />
              ) : currentBorrower.balance < 0 ? (
                <FiTrendingDown className="text-green-500 text-2xl" />
              ) : (
                <FiCheckCircle className="text-blue-500 text-2xl" />
              )}
            </div>
          </motion.div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {currentBorrower.balance > 0
                ? "Pendiente por pagar"
                : currentBorrower.balance < 0
                ? "A favor del prestamista"
                : "Balance al día"}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen general */}
      <div className="p-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Resumen General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white p-4 rounded-lg shadow border border-indigo-100"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <FiUser className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Prestamistas</p>
                <p className="text-xl font-bold">{borrowers.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white p-4 rounded-lg shadow border border-blue-100"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <FiClock className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Préstamos Activos</p>
                <p className="text-xl font-bold">
                  {
                    borrowers.filter(
                      (b) => b.total_loans > 0 && b.total_paid < b.total_loans
                    ).length
                  }
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="bg-white p-4 rounded-lg shadow border border-green-100"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <FiCheckCircle className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Préstamos Pagados</p>
                <p className="text-xl font-bold">
                  {
                    borrowers.filter(
                      (b) => b.total_loans > 0 && b.total_paid >= b.total_loans
                    ).length
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
