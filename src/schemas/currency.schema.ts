// src/schemas/currency.schema.ts
import { z } from 'zod';

export const currencySchema = z.object({
  code: z.string()
    .regex(/^[A-Z]+$/, { message: 'El código debe contener solo letras mayúsculas' }),
  name: z.string()
    .min(1, { message: 'El nombre es requerido' })
    .max(50, { message: 'El nombre debe tener menos de 50 caracteres' }),
  exchangeRate: z.number()
    .positive({ message: 'La tasa debe ser un número positivo' })
    .max(1000000, { message: 'La tasa no puede ser mayor a 1,000,000' }),
});

export type CurrencyForm = z.infer<typeof currencySchema>;

export type CurrencyResponse = {
  id: number;
  code: string;
  name: string;
  exchangeRate: number;
  updatedAt: string;
};

export type CurrencyErrorResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
};
export type CurrencySucessResponse = {
  statusCode: number;
  message: string;
  error: string;
};