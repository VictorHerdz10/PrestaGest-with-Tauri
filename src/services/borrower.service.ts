// src/services/borrower.service.ts
import api from "./axios/api.service";
import {
  BorrowerForm,
  BorrowerResponse,
  BorrowerErrorResponse,
  BorrowerSuccessResponse,
} from "../schemas/borrower.schema";
import { isApiError } from "../utils/isApiError";

export const borrowerService = {
  async getAll(): Promise<BorrowerResponse[] | BorrowerErrorResponse> {
    try {
      const response = await api.get<BorrowerResponse[]>("/borrowers");
      return response.data;
    } catch (error) {
      if (isApiError<BorrowerErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al obtener los prestatarios",
            error: "BORROWER_FETCH_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al obtener prestatarios",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async create(
    data: BorrowerForm
  ): Promise<BorrowerSuccessResponse | BorrowerErrorResponse> {
    try {
      const response = await api.post<BorrowerSuccessResponse>(
        "/borrowers",
        data
      );
      return response.data;
    } catch (error) {
      if (isApiError<BorrowerErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al crear el prestatario",
            error: "BORROWER_CREATE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al crear prestatario",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async update(
    id: number,
    data: BorrowerForm
  ): Promise<BorrowerResponse | BorrowerErrorResponse> {
    try {
      const response = await api.patch<BorrowerResponse>(
        `/borrowers/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      if (isApiError<BorrowerErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al actualizar el prestatario",
            error: "BORROWER_UPDATE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al actualizar prestatario",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async delete(
    id: number
  ): Promise<BorrowerSuccessResponse | BorrowerErrorResponse> {
    try {
      const response = await api.delete(`/borrowers/${id}`);
      return response.data;
    } catch (error) {
      if (isApiError<BorrowerErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al eliminar el prestatario",
            error: "BORROWER_DELETE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al eliminar prestatario",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },
};
