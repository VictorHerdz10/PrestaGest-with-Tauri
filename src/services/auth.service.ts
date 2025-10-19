import api from "./axios/api.service";
import {
  LoginForm,
  RegisterForm,
  LoginSuccessResponse,
  LoginErrorResponse,
  RegisterErrorResponse,
  RegisterSuccessResponse,
  User,
  ErrorApi,
} from "../schemas/index";
import { isApiError } from "../utils/isApiError";



export const authService = {
  async login(
    data: LoginForm
  ): Promise<LoginSuccessResponse | LoginErrorResponse> {
    try {
      const response = await api.post<LoginSuccessResponse>(
        "/auth/login",
        data
      );
      localStorage.setItem("access_token", response.data.access_token);
      return response.data;
    } catch (error) {
      if (isApiError<LoginErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error de autenticación",
            error: "AUTH_ERROR",
            statusCode: 401,
          }
        );
      }
      return {
        message: "Error desconocido",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async register(
    data: RegisterForm
  ): Promise<RegisterSuccessResponse | RegisterErrorResponse> {
    try {
      const response = await api.post<RegisterSuccessResponse>(
        "/auth/register",
        data
      );
      return response.data;
    } catch (error) {
      if (isApiError<RegisterErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error de registro",
            error: "REGISTER_ERROR",
            statusCode: 400,
          }
        );
      }
      return {
        message: "Error desconocido",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async verifyAuth(): Promise<User | ErrorApi> {
    try {
      const response = await api.get<User>("/auth/authenticate");
      return response.data;
    } catch (error) {
      localStorage.removeItem("access_token");

      if (isApiError<ErrorApi>(error)) {
        return (
          error.response?.data ?? {
            message: "Error de autenticación",
            error: "AUTH_ERROR",
            statusCode: 401,
          }
        );
      }

      return {
        message: "Error desconocido al verificar autenticación",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  logout(): void {
    localStorage.removeItem("access_token");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("access_token");
  },
};
