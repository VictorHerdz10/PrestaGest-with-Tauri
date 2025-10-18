// src/views/dashboard/CurrenciesView.tsx
import { useState } from 'react';
import { useCurrencies, useCreateCurrency, useUpdateCurrency, useDeleteCurrency } from '../../hooks/useCurrencies';
import { type CurrencyForm as CurrencyFormData } from '../../schemas/currency.schema';
import { CurrencyCard } from '../../components/currency/CurrencyCard';
import { CurrencyModal } from '../../components/currency/CurrencyModal';
import { Button } from '../../components/ui/Button';

export function CurrenciesView() {
  const { data: currencies, isLoading, error } = useCurrencies();
  const createMutation = useCreateCurrency();
  const updateMutation = useUpdateCurrency();
  const deleteMutation = useDeleteCurrency();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<number | null>(null);

  const handleCardClick = (currencyId: number) => {
    setCurrentCurrency(currencyId);
    setIsModalOpen(true);
  };

  const handleAddCurrency = () => {
    setCurrentCurrency(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CurrencyFormData) => {
    try {
      if (currentCurrency === null) {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync({ id: currentCurrency, data });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (currentCurrency !== null) {
      try {
        await deleteMutation.mutateAsync(currentCurrency);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const selectedCurrency = currentCurrency !== null 
    ? currencies?.find(c => c.id === currentCurrency)
    : undefined;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gestión de Monedas
          </span>
        </h1>
        <Button
          onClick={handleAddCurrency}
          variant="primary"
        >
          Agregar Moneda
        </Button>
      </div>

      {isLoading && <div className="text-center py-8">Cargando monedas...</div>}
      {error && <div className="text-center py-8 text-red-500">Error al cargar las monedas</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currencies?.map((currency) => (
          <CurrencyCard
            key={currency.id}
            currency={currency}
            onClick={() => handleCardClick(currency.id)}
          />
        ))}
      </div>

      <CurrencyModal
        currency={selectedCurrency}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        isCreate={currentCurrency === null}
        onDelete={currentCurrency !== null ? handleDelete : undefined}
      />
    </div>
  );
}

export default CurrenciesView;