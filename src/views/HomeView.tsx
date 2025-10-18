// HomeView.tsx
import { motion } from "framer-motion";
import { Carousel } from "../components/ui/Carousel";
import { Button } from "../components/ui/Button";
import {
  FiShield,
  FiTrendingUp,
  FiGlobe,
  FiLock,
  FiBarChart2,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function HomeView() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.scrollBehavior = "smooth";
    }
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);
  const features = [
    {
      title: "Gestión Crediticia Automatizada",
      description:
        "Sistema integral para administración automatizada de préstamos con registro detallado de transacciones",
      icon: <FiTrendingUp className="w-8 h-8" />,
      color: "text-purple-600",
    },
    {
      title: "Analítica Financiera",
      description:
        "Dashboard interactivo con métricas en tiempo real de cartera y comportamiento de pagos",
      icon: <FiBarChart2 className="w-8 h-8" />,
      color: "text-blue-600",
    },
    {
      title: "Gestión de Clientes",
      description:
        "Plataforma unificada para administración de clientes y seguimiento de historial crediticio",
      icon: <FiGlobe className="w-8 h-8" />,
      color: "text-green-600",
    },
    {
      title: "Protección de Datos",
      description:
        "Sistema seguro con encriptación avanzada y protocolos de protección de información",
      icon: <FiLock className="w-8 h-8" />,
      color: "text-red-600",
    },
  ];

  const carouselItems = [
    {
      id: 1,
      title: "Dashboard Personalizado",
      description:
        "Interfaz modular con widgets configurables para gestión crediticia en tiempo real",
      image: "./dashboard.avif",
      bgColor: "from-blue-500 to-cyan-400",
    },
    {
      id: 2,
      title: "Procesos Automatizados",
      description:
        "Automatización inteligente de aprobación de préstamos con análisis en minutos",
      image: "./automatico.avif",
      bgColor: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      title: "Reportes Financieros",
      description:
        "Generación automática de reportes detallados de cartera y morosidad",
      image: "./reportes.avif",
      bgColor: "from-green-500 to-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-indigo-900/90 backdrop-blur-md shadow-sm sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="./logo.png"
                alt="Logo PrestaGest"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-white">PrestaGest</h1>
          </motion.div>

          <nav className="flex space-x-4">
            <Link to="/auth/login">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white/10"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button
                variant="primary"
                className="bg-white text-indigo-900 hover:bg-gray-100"
              >
                Registrarse
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center w-full"
      >
        <div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
          >
            La solución completa para{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              gestión de préstamos
            </span>
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-xl text-gray-700"
          >
            Plataforma todo-en-uno para la gestión y administración de cartera
            crediticia con tecnología avanzada.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link to="/auth/register">
              <Button
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Comenzar Ahora
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                Acceder al Sistema
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl opacity-20 blur-xl"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 h-80">
            {/* Barra superior de ventana */}
            <div className="bg-gray-800 h-8 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>

            {/* Imagen del dashboard */}
            <div className="h-[calc(100%-2rem)] relative">
              <img
                src="./dashboard.avif"
                alt="Dashboard PrestaGest"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="Caracteristicas" className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900"
            >
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Potencia
              </span>{" "}
              tu gestión crediticia
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Soluciones diseñadas para optimizar cada aspecto de tu operación
              crediticia
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`${feature.color} mb-4`}>{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <section
        id="Carucel"
        className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50 w-full"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900"
            >
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Funcionalidades
              </span>{" "}
              Clave
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto"
            >
              Descubre cómo nuestra plataforma puede transformar tu gestión de
              préstamos
            </motion.p>
          </div>
          <Carousel items={carouselItems} />
        </div>
      </section>

      {/* CTA Section */}
      <section id="Contacto" className="py-16 bg-indigo-900 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-8 md:p-12 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para optimizar tu gestión de préstamos?
            </h2>
            <p className="text-indigo-100 text-xl mb-8 max-w-3xl mx-auto">
              Regístrate ahora y comienza a gestionar tu cartera crediticia de
              manera eficiente.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-indigo-900 hover:bg-gray-100"
                >
                  Crear Cuenta
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white hover:bg-white/10"
                >
                  Acceder al Sistema
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Simplificado con Animaciones */}
      <footer className="bg-gray-900 text-white py-12 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Información del desarrollador */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-0"
            >
              <h3 className="text-xl font-bold mb-2 flex items-center space-x-2">
                <FiShield className="text-indigo-400" />
                <span>PrestaGest</span>
              </h3>
              <p className="text-gray-400">Desarrollado por Víctor Hernández</p>
            </motion.div>

            {/* Redes sociales y contacto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center md:items-end space-y-3"
            >
              <div className="flex space-x-4">
                {/* Instagram */}
                <motion.a
                  href="https://www.instagram.com/victorherdz_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="text-gray-400 hover:text-pink-500 transition-colors relative group"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Instagram
                  </span>
                </motion.a>

                {/* Facebook */}
                <motion.a
                  href="https://www.facebook.com/victor.hernandez.247101"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="text-gray-400 hover:text-blue-500 transition-colors relative group"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Facebook
                  </span>
                </motion.a>

                {/* Twitter/X */}
                <motion.a
                  href="https://x.com/Victor_hendz"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="text-gray-400 hover:text-gray-300 transition-colors relative group"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Twitter/X
                  </span>
                </motion.a>

                {/* GitHub */}
                <motion.a
                  href="https://github.com/VictorHerdz10"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="text-gray-400 hover:text-gray-300 transition-colors relative group"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    GitHub
                  </span>
                </motion.a>

                {/* WhatsApp */}
                <motion.a
                  href="https://wa.link/0x8x5g"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="text-gray-400 hover:text-green-500 transition-colors relative group"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    WhatsApp
                  </span>
                </motion.a>
              </div>

              {/* Información de contacto */}
              <div className="text-center md:text-right">
                <motion.a
                  href="mailto:victorhernandezsalcedo4@gmail.com"
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-400 hover:text-white transition block"
                >
                  victorhernandezsalcedo4@gmail.com
                </motion.a>
                <motion.a
                  href="tel:+5359157423"
                  whileHover={{ scale: 1.05 }}
                  className="text-gray-400 hover:text-white transition block"
                >
                  +53 59157423
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Enlaces internos para scroll suave con animaciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 pt-6 border-t border-gray-800 flex justify-center space-x-6"
          >
            {["Caracteristicas", "Carucel", "Contacto"].map((item) => (
              <motion.button
                key={item}
                onClick={() => document.getElementById(item)?.scrollIntoView()}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-indigo-400 transition px-3 py-1 rounded-md relative group"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-400 group-hover:w-full transition-all duration-300"></span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </footer>
    </div>
  );
}