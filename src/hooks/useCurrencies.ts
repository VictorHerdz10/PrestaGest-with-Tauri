import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { currencyService } from "../services/currency.service";
import { toast } from "sonner";
import {
  type CurrencyForm,
  type CurrencyResponse,
} from "../schemas/currency.schema";

export function useCurrencies() {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const data = await currencyService.getAll();
      if ("error" in data) {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
        throw new Error(data.message as string);
      }
      return data as CurrencyResponse[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CurrencyForm) => currencyService.create(data),
    onSuccess: (data) => {
      if (data.status_code === 201) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["currencies"] });
      } else {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear moneda");
    },
  });
}

export function useUpdateCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CurrencyForm }) =>
      currencyService.update(id, data),
    onSuccess: (data, { id }) => {
      if ("error" in data) {
        toast.error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      } else {
        toast.success("Moneda actualizada correctamente");
        queryClient.setQueryData<CurrencyResponse[]>(
          ["currencies"],
          (old) =>
            old?.map((currency) =>
              currency.id === id ? { ...currency, ...data } : currency
            ) ?? []
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar moneda");
    },
  });
}

export function useDeleteCurrency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => currencyService.delete(id),
    onSuccess: (_, id) => {
      toast.success("Moneda eliminada correctamente");
      queryClient.setQueryData<CurrencyResponse[]>(
        ["currencies"],
        (old) => old?.filter((currency) => currency.id !== id) ?? []
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar moneda");
    },
  });
}
