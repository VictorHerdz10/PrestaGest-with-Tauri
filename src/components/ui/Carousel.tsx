import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string; // Nueva propiedad para imágenes
  bgColor?: string; // Color de fondo personalizado
}

interface CarouselProps {
  items: CarouselItem[];
}

export function Carousel({ items }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection('right');
      setCurrentIndex((prevIndex) => 
        prevIndex === items.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  const goToPrev = () => {
    setDirection('left');
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setDirection('right');
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToIndex = (index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  // Efecto de gradiente de fondo basado en el ítem actual
  const currentBgColor = items[currentIndex]?.bgColor || 'from-indigo-500 to-purple-600';

  return (
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-xl px-12">
      {/* Fondo gradiente dinámico */}
      <div className={`absolute inset-0 bg-gradient-to-r ${currentBgColor} opacity-20 -z-10`}></div>
      
      <div className="relative h-[500px] flex items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction === 'right' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'right' ? -100 : 100 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 p-8"
          >
            {/* Contenido de texto */}
            <div className="flex-1 space-y-6 text-center md:text-left">
              <motion.h3 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-gray-900"
              >
                {items[currentIndex].title}
              </motion.h3>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-700 max-w-2xl mx-auto md:mx-0"
              >
                {items[currentIndex].description}
              </motion.p>
              
              {items[currentIndex].icon && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center md:justify-start"
                >
                  {items[currentIndex].icon}
                </motion.div>
              )}
            </div>

            {/* Imagen o icono */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 flex justify-center"
            >
              {items[currentIndex].image ? (
                <img 
                  src={items[currentIndex].image} 
                  alt={items[currentIndex].title}
                  className="w-full max-w-md h-auto object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
                  {items[currentIndex].icon || (
                    <div className="text-6xl">📊</div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="h-6 w-6 text-gray-800" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white w-6 scale-110' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}