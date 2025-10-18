// src/services/payment.service.ts
import api from "./axios/api.service";
import {
  PaymentForm,
  PaymentResponse,
  PaymentErrorResponse,
  PaymentSuccessResponse,
} from "../schemas/payment.schema";
import { isApiError } from "../utils/isApiError";

export const paymentService = {
  async getAll(): Promise<PaymentResponse[] | PaymentErrorResponse> {
    try {
      const response = await api.get<PaymentResponse[]>("/payments");
      return response.data;
    } catch (error) {
      if (isApiError<PaymentErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al obtener los pagos",
            error: "PAYMENT_FETCH_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al obtener pagos",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },

  async create(
    data: PaymentForm
  ): Promise<PaymentSuccessResponse | PaymentErrorResponse> {
    try {
      const response = await api.post<PaymentSuccessResponse>("/payments", data);
      return response.data;
    } catch (error) {
      if (isApiError<PaymentErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al crear el pago",
            error: "PAYMENT_CREATE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al crear pago",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },
  

  async delete(id: number): Promise<PaymentSuccessResponse | PaymentErrorResponse> {
    try {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    } catch (error) {
      if (isApiError<PaymentErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al eliminar el pago",
            error: "PAYMENT_DELETE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al eliminar pago",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },
  async update(
    id: number,
    data: Partial<PaymentForm>
  ): Promise<PaymentResponse | PaymentErrorResponse> {
    try {
      const response = await api.patch<PaymentResponse>(`/payments/${id}`, data);
      return response.data;
    } catch (error) {
      if (isApiError<PaymentErrorResponse>(error)) {
        return (
          error.response?.data ?? {
            message: "Error al actualizar el pago",
            error: "PAYMENT_UPDATE_ERROR",
            statusCode: 500,
          }
        );
      }
      return {
        message: "Error desconocido al actualizar pago",
        error: "UNKNOWN_ERROR",
        statusCode: 500,
      };
    }
  },
};
