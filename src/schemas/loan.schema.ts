// src/schemas/loan.schema.ts
import { z } from "zod";

export const loanSchema = z.object({
  amount: z
    .number({
      required_error: "El monto es requerido",
      invalid_type_error: "El monto es requerido",
    })
    .positive({ message: "El monto debe ser positivo" })
    .max(100000000, { message: "El monto no puede exceder 100,000,000" }),
  borrowerId: z
    .number({
      required_error: "Debe seleccionar un prestatario",
      invalid_type_error: "El prestatario debe ser un número",
    })
    .positive({ message: "Debe seleccionar un prestatario válido" }),
});

export type LoanForm = z.infer<typeof loanSchema>;

export interface LoanResponse {
  id: number;
  amount: number;
  currency: string;
  status: "active" | "paid";
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

export type LoanErrorResponse = {
  status_code: number;
  message: string | string[];
  error: string;
};

export type LoanSuccessResponse = {
  status_code: number;
  message: string;
  error: string;
};