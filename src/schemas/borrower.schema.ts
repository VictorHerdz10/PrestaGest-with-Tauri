// src/schemas/borrower.schema.ts
import { z } from 'zod';

export const borrowerSchema = z.object({
  phone: z.string()
    .min(8, { message: 'El teléfono debe tener mínimo 8 dígitos' })
    .regex(/^\d+$/, { message: 'El teléfono solo puede contener números' }),
  name: z.string()
    .min(1, { message: 'El nombre es requerido' })
    .max(100, { message: 'El nombre debe tener menos de 100 caracteres' }),
  location: z.string()
    .min(1, { message: 'La ubicación es requerida' })
    .max(200, { message: 'La ubicación debe tener menos de 200 caracteres' }),
});

export type BorrowerForm = z.infer<typeof borrowerSchema>;

export type BorrowerResponse = {
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

export type BorrowerErrorResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
};

export type BorrowerSuccessResponse = {
  statusCode: number;
  message: string;
  error: string;
};