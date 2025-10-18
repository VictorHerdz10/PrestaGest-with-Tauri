// src/hooks/useExchangeRate.ts
import { useQuery } from "@tanstack/react-query";
import { currencyService } from "../services/currency.service";
import { CurrencyResponse } from "../schemas/currency.schema";

interface ExchangeRateData {
  currencies: CurrencyResponse[];
  defaultRate: number;
}

export function useExchangeRate() {
  return useQuery<CurrencyResponse[], Error, ExchangeRateData>({
    queryKey: ["currencies"],
    queryFn: async () => {
      const data = await currencyService.getAll();
      if ("error" in data) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message
        );
      }
      return data as CurrencyResponse[];
    },
    select: (data) => ({
      currencies: data,
      defaultRate: data.find((c) => c.code === "USD")?.exchangeRate || 1, 
    }),
    staleTime: 5 * 60 * 1000,
  });
}