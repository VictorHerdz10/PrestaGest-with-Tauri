import { z } from 'zod';

// Esquemas para las solicitudes (requests)
export const loginSchema = z.object({
  phone: z.string()
    .min(1, { message: 'El teléfono es requerido' })
    .regex(/^[0-9]+$/, { message: 'El teléfono debe contener solo números' }),
  password: z.string()
    .min(1, { message: 'La contraseña es requerida' })
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, { message: 'El nombre es requerido' })
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(50, { message: 'El nombre debe tener menos de 50 caracteres' }),
  phone: z.string()
    .min(1, { message: 'El teléfono es requerido' })
    .regex(/^[0-9]+$/, { message: 'El teléfono debe contener solo números' }),
  password: z.string()
    .min(1, { message: 'La contraseña es requerida' })
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(32, { message: 'La contraseña debe tener menos de 32 caracteres' }),
  confirmPassword: z.string()
    .min(1, { message: 'Debes confirmar tu contraseña' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ['confirmPassword']
});

// Tipos para respuestas
export type AuthUser = {
  id: number;
  name: string;
  phone: string;
  role: string;
};

export type AuthResponse = {
  access_token: string;
};
export type RegisterResponse = {
  statusCode: number;
  message: string;
  error: string;
};

export type ErrorResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
};
export type ApiErrorResponse = {
  statusCode: number;
  message: string;
  error: string;
};

// Tipos para TypeScript
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginSuccessResponse = AuthResponse;
export type LoginErrorResponse = ErrorResponse;
export type RegisterSuccessResponse = RegisterResponse;
export type RegisterErrorResponse = ErrorResponse;
export type User = AuthUser;
export type ErrorApi = ApiErrorResponse;