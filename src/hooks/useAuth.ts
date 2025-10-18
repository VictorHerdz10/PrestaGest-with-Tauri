import { useQuery, useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { LoginForm, RegisterForm, User } from "../schemas/auth.schema";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const navigate = useNavigate();

  const authQuery = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      try {
        const data = await authService.verifyAuth();
        if (data && "error" in data) {
          toast.error(data.message);
          throw new Error(data.message || "Error de autenticación");
        }

        return data as User;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message !==
            "El usuario no tiene los permisos para acceder al sistema"
        ) {
          authService.logout();
        }
        throw error;
      }
    },
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => authService.login(data),
    onSuccess: (data) => {
      if ("accessToken" in data) {
        authQuery.refetch().then(({ data: userData }) => {
          if (userData) {
            navigate("/dashboard");
            toast.success(`¡Bienvenido ${userData.name}!`);
          }
        });
      } else {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Error al iniciar sesión";
        toast.error(message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al iniciar sesión");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) => authService.register(data),
    onSuccess: (data) => {
      if (data.statusCode === 201) {
        toast.success(data.message);
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      } else {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Error al registrarse";
        toast.error(message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrarse");
    },
  });

  const logout = (): void => {
    authService.logout();
    navigate("/auth/login");
    toast.info("Sesión cerrada correctamente");
  };

  return {
    user: authQuery.data,
    isAuthenticated: authService.isAuthenticated(),
    isLoading: authQuery.isLoading || authQuery.isFetching,
    isError: authQuery.isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
