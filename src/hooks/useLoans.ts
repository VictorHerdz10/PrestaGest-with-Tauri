import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loanService } from "../services/loan.service";
import { toast } from "sonner";
import {
  type LoanForm,
  type LoanResponse,
} from "../schemas/loan.schema";

export function useLoans() {
  return useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const data = await loanService.getAll();
      if ("error" in data) {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
        throw new Error(data.message as string);
      }
      return data as LoanResponse[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLoans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoanForm) => loanService.create(data),
    onSuccess: (data) => {
      if (data.statusCode === 201) {
        toast.success(data.message);
        // Invalidar ambas queries
        queryClient.invalidateQueries({ queryKey: ["loans"] });
        queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      } else {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear préstamo");
    },
  });
}

export function useUpdateLoans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LoanForm }) =>
      loanService.update(id, data),
    onSuccess: (data, { id }) => {
      if ("error" in data) {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      } else {
        toast.success("Préstamo actualizado correctamente");
        // Actualizar cache localmente e invalidar borrowers
        queryClient.setQueryData<LoanResponse[]>(
          ["loans"],
          (old) =>
            old?.map((loan) =>
              loan.id === id ? { ...loan, ...data } : loan
            ) ?? []
        );
        queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar préstamo");
    },
  });
}

export function useDeleteLoans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => loanService.delete(id),
    onSuccess: (data, id) => {
      toast.success(data.message);
      // Actualizar cache localmente e invalidar borrowers
      queryClient.setQueryData<LoanResponse[]>(
        ["loans"],
        (old) => old?.filter((loan) => loan.id !== id) ?? []
      );
      queryClient.invalidateQueries({ queryKey: ["borrowers"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar préstamo");
    },
  });
}