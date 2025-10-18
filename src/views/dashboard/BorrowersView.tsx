// src/views/dashboard/BorrowersView.tsx
import { useState } from 'react';
import { useBorrowers, useCreateBorrower, useUpdateBorrower, useDeleteBorrower } from '../../hooks/useBorrowers';
import { type BorrowerForm as BorrowerFormData } from '../../schemas/borrower.schema';
import { BorrowerCard } from '../../components/borrower/BorrowerCard';
import { BorrowerModal } from '../../components/borrower/BorrowerModal';
import { Button } from '../../components/ui/Button';

export default function BorrowersView() {
  const { data: borrowers, isLoading, error } = useBorrowers();
  const createMutation = useCreateBorrower();
  const updateMutation = useUpdateBorrower();
  const deleteMutation = useDeleteBorrower();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBorrower, setCurrentBorrower] = useState<number | null>(null);

  const handleCardClick = (borrowerId: number) => {
    setCurrentBorrower(borrowerId);
    setIsModalOpen(true);
  };

  const handleAddBorrower = () => {
    setCurrentBorrower(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: BorrowerFormData) => {
    try {
      if (currentBorrower === null) {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync({ id: currentBorrower, data });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (currentBorrower !== null) {
      try {
        await deleteMutation.mutateAsync(currentBorrower);
        setIsModalOpen(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const selectedBorrower = currentBorrower !== null 
    ? borrowers?.find(b => b.id === currentBorrower)
    : undefined;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gestión de Prestatarios
          </span>
        </h1>
        <Button
          onClick={handleAddBorrower}
          variant="primary"
        >
          Agregar Prestatario
        </Button>
      </div>

      {isLoading && <div className="text-center py-8">Cargando prestatarios...</div>}
      {error && <div className="text-center py-8 text-red-500">Error al cargar los prestatarios</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {borrowers?.map((borrower) => (
          <BorrowerCard
            key={borrower.id}
            borrower={borrower}
            onClick={() => handleCardClick(borrower.id)}
          />
        ))}
      </div>

      <BorrowerModal
        borrower={selectedBorrower}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        isCreate={currentBorrower === null}
        onDelete={currentBorrower !== null ? handleDelete : undefined}
      />
    </div>
  );
}