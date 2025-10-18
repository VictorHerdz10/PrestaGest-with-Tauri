// src/services/currency.service.ts
import api from "./axios/api.service";
import {
  LoanForm,
  LoanResponse,
  LoanErrorResponse,
  LoanSuccessResponse,
} from "../schemas/loan.schema";
import { isApiError } from "../utils/isApiError";

export const loanService = {
  async getAll(): Promise<LoanResponse[] | LoanErrorResponse> {
    try {
      const response = await api.get<LoanResponse[]>("/loans");
      return response.data;
    } catch (error) {
      if (isApiError<LoanErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al obtener los préstamos",
            error: "LOAN_FETCH_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al obtener préstamos",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async create(
    data: LoanForm
  ): Promise<LoanSuccessResponse | LoanErrorResponse> {
    try {
      const response = await api.post<LoanSuccessResponse>("/loans", data);
      return response.data;
    } catch (error) {
      if (isApiError<LoanErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al crear el préstamo",
            error: "LOAN_CREATE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al crear préstamo",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async update(
    id: number,
    data: LoanForm
  ): Promise<LoanResponse | LoanErrorResponse> {
    try {
      const response = await api.patch<LoanResponse>(`/loans/${id}`, data);
      return response.data;
    } catch (error) {
      if (isApiError<LoanErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al actualizar el préstamo",
            error: "LOAN_UPDATE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al actualizar préstamo",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async delete(id: number): Promise<LoanSuccessResponse | LoanErrorResponse> {
    try {
      const response = await api.delete(`/loans/${id}`);
      return response.data;
    } catch (error) {
      if (isApiError<LoanErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al eliminar el préstamo",
            error: "LOAN_DELETE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al eliminar préstamo",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },
};
