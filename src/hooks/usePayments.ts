// src/hooks/usePayments.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../services/payment.service";
import { toast } from "sonner";
import {
  type PaymentForm,
  type PaymentResponse,
} from "../schemas/payment.schema";

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const data = await paymentService.getAll();
      if ("error" in data) {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
        throw new Error(data.message as string);
      }
      return data as PaymentResponse[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentForm) => paymentService.create(data),
    onSuccess: (data) => {
      if (data.status_code === 201) {
        toast.success(data.message);
        // Invalidar ambas queries
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["borrowers"] });
        queryClient.invalidateQueries({ queryKey: ["loans"] });
      } else {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear pago");
    },
  });
}

export function useUpdatePayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PaymentForm> }) =>
      paymentService.update(id, data),
    onSuccess: (data, { id }) => {
      if ("error" in data) {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      } else {
        toast.success("Pago actualizado correctamente");
        // Actualizar cache localmente e invalidar borrowers
        queryClient.setQueryData<PaymentResponse[]>(
          ["payments"],
          (old) =>
            old?.map((payment) =>
              payment.id === id ? { ...payment, ...data } : payment
            ) ?? []
        );
        queryClient.invalidateQueries({ queryKey: ["borrowers"] });
        queryClient.invalidateQueries({ queryKey: ["loans"] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar pago");
    },
  });
}

export function useDeletePayments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paymentService.delete(id),
    onSuccess: (data, id) => {
      toast.success(data.message);
      // Actualizar cache localmente e invalidar borrowers
      queryClient.setQueryData<PaymentResponse[]>(
        ["payments"],
        (old) => old?.filter((payment) => payment.id !== id) ?? []
      );
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar pago");
    },
  });
}
