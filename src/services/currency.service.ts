// src/services/currency.service.ts
import api from "./axios/api.service";
import {
  CurrencyForm,
  CurrencyResponse,
  CurrencyErrorResponse,
  CurrencySucessResponse,
} from "../schemas/currency.schema";
import { isApiError } from "../utils/isApiError";

export const currencyService = {
  async getAll(): Promise<CurrencyResponse[] | CurrencyErrorResponse> {
    try {
      const response = await api.get<CurrencyResponse[]>("/currencies");
      return response.data;
    } catch (error) {
      if (isApiError<CurrencyErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al obtener las monedas",
            error: "CURRENCY_FETCH_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al obtener monedas",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async create(
    data: CurrencyForm
  ): Promise<CurrencySucessResponse | CurrencyErrorResponse> {
    try {
      const response = await api.post<CurrencySucessResponse>(
        "/currencies",
        data
      );
      return response.data;
    } catch (error) {
      if (isApiError<CurrencyErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al crear la moneda",
            error: "CURRENCY_CREATE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al crear moneda",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async update(
    id: number,
    data: CurrencyForm
  ): Promise<CurrencyResponse | CurrencyErrorResponse> {
    try {
      const response = await api.patch<CurrencyResponse>(
        `/currencies/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      if (isApiError<CurrencyErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al actualizar la moneda",
            error: "CURRENCY_UPDATE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al actualizar moneda",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async delete(
    id: number
  ): Promise<CurrencySucessResponse | CurrencyErrorResponse> {
    try {
      const response = await api.delete(`/currencies/${id}`);
      return response.data;
    } catch (error) {
      if (isApiError<CurrencyErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al eliminar la moneda",
            error: "CURRENCY_DELETE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al eliminar moneda",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },
};
