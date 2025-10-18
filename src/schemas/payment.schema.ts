// src/schemas/payment.schema.ts
import { z } from "zod";

export const paymentSchema = z.object({
  amount: z
    .number({
      required_error: "El monto es requerido",
      invalid_type_error: "El monto es requerido",
    })
    .positive({ message: "El monto debe ser positivo" })
    .max(100000000, { message: "El monto no puede exceder 100,000,000" }),
  currency: z.string({
      required_error: "La moneda es requerida",
      invalid_type_error: "La moneda es requerida",
    }),
  exchangeRate: z
    .number({
      required_error: "La tasa de cambio es requerida",
      invalid_type_error: "La tasa de cambio debe ser un número",
    })
    .positive({ message: "La tasa de cambio debe ser positiva" }),
  borrowerId: z
    .number({
      required_error: "Debe seleccionar un prestatario",
      invalid_type_error: "El prestatario debe ser un número",
    })
    .positive({ message: "Debe seleccionar un prestatario válido" }),
});

export type PaymentForm = z.infer<typeof paymentSchema>;

export interface PaymentResponse {
  id: number;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountCUP: number;
  borrower: {
    id: number;
    name: string;
    phone: string;
    location: string;
    totalLoans: number;
    totalPaid: number;
    balance: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  createdAt: string;
  updatedAt: string;
}

export type PaymentErrorResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
};

export type PaymentSuccessResponse = {
  statusCode: number;
  message: string;
  error: string;
};