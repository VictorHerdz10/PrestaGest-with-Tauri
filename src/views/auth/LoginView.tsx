import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginForm } from "../../schemas/auth.schema";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiTrendingUp, FiLock, FiBarChart2 } from "react-icons/fi";

export default function LoginView() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 w-full px-8">
      {/* Left side - Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col justify-center py-12"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer mb-6"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="./logo.png"
                alt="Logo PrestaGest"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              PrestaGest
            </h1>
          </div>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-gray-900 mb-8"
        >
          Inicio de Sesión
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 mb-10"
        >
          Acceda a su panel de administración para gestionar su cartera de
          préstamos de manera eficiente.
        </motion.p>

        <div className="space-y-6">
          {[
            {
              icon: <FiTrendingUp className="w-6 h-6 text-indigo-600" />,
              text: "Visualice el rendimiento de su cartera en tiempo real",
            },
            {
              icon: <FiBarChart2 className="w-6 h-6 text-indigo-600" />,
              text: "Analice tendencias y tome decisiones informadas",
            },
            {
              icon: <FiLock className="w-6 h-6 text-indigo-600" />,
              text: "Plataforma segura con encriptación de última generación",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="mt-1">{item.icon}</div>
              <p className="text-gray-700 text-lg">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right side - Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-end py-12"
      >
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Acceso al Sistema
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                placeholder="Ej: 55555555"
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl mt-4"
              isLoading={isLoggingIn}
            >
              {isLoggingIn ? "Accediendo..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿No tiene una cuenta?{" "}
              <Link
                to="/auth/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 relative group"
              >
                Regístrese aquí
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
