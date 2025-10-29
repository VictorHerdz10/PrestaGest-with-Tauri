// src/hooks/useBorrowers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowerService } from "../services/borrower.service";
import { toast } from "sonner";
import {
  type BorrowerForm,
  type BorrowerResponse,
} from "../schemas/borrower.schema";

export function useBorrowers() {
  return useQuery({
    queryKey: ["borrowers"],
    queryFn: async () => {
      const data = await borrowerService.getAll();
      if ("error" in data) {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
        throw new Error(data.message as string);
      }
      return data as BorrowerResponse[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos de cache
    gcTime: 5 * 60 * 1000, // 5 minutos en garbage collector
    refetchOnWindowFocus: true, // Recargar al enfocar la ventana
  });
}

export function useCreateBorrower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BorrowerForm) => borrowerService.create(data),
    onSuccess: (data) => {
      console.log(data)
      if (data.status_code === 201) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["borrowers"] });
      } else {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear prestatario");
    },
  });
}

export function useUpdateBorrower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BorrowerForm }) =>
      borrowerService.update(id, data),
    onSuccess: (data, { id }) => {
      if ("error" in data) {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      } else {
        toast.success("Prestatario actualizado correctamente");
        queryClient.setQueryData<BorrowerResponse[]>(
          ["borrowers"],
          (old) =>
            old?.map((borrower) =>
              borrower.id === id ? { ...borrower, ...data } : borrower
            ) ?? []
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar prestatario");
    },
  });
}

export function useDeleteBorrower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => borrowerService.delete(id),
    onSuccess: (data, id) => {
      toast.success(data.message);
      queryClient.setQueryData<BorrowerResponse[]>(
        ["borrowers"],
        (old) => old?.filter((borrower) => borrower.id !== id) ?? []
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar prestatario");
    },
  });
}
