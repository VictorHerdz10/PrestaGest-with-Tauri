// src/views/dashboard/LoansView.tsx
import { useEffect, useState } from "react";
import { useLoans, useCreateLoans, useDeleteLoans, useUpdateLoans } from "../../hooks/useLoans";
import { useBorrowers } from "../../hooks/useBorrowers";
import {
  FiPlus,
  FiTrash2,
  FiDollarSign,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiEye,
  FiEdit,
} from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatCurrency";
import { LoanForm, LoanResponse, loanSchema } from "../../schemas/loan.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pagination } from "../../components/ui/Pagination";

export default function LoansView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanResponse | null>(null);
  const [selectedBorrower, setSelectedBorrower] = useState<number | null>(null);
  const [editingLoan, setEditingLoan] = useState<LoanResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const loansPerPage = 10;

  const { data: borrowers, isLoading: isLoadingBorrowers, refetch: refetchBorrowers } = useBorrowers();
  const { data: loans, isLoading: isLoadingLoans } = useLoans();
  const createMutation = useCreateLoans();
  const deleteMutation = useDeleteLoans();
  const updateMutation = useUpdateLoans();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<LoanForm>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      amount: 0,
      borrowerId: undefined,
    },
  });

  // Resetear el formulario cuando se cierran los diálogos
  useEffect(() => {
    if (!isDialogOpen && !isEditDialogOpen) {
      reset({
        amount: 0,
        borrowerId: undefined,
      });
      setEditingLoan(null);
    }
  }, [isDialogOpen, isEditDialogOpen, reset]);

  // Calcular totales
  const totalLoansAmount = loans?.reduce((sum, loan) => sum + loan.amount, 0) || 0;
  const totalActiveLoans = loans?.filter((loan) => loan.status === "active").length || 0;
  const totalPaidLoans = loans?.filter((loan) => loan.status === "paid").length || 0;

  // Prestatarios con resumen
const borrowersSummary = borrowers?.map((borrower) => {
  const borrowerLoans = loans?.filter((loan) => loan.borrower.id === borrower.id) || [];
  const totalAmount = borrowerLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const activeAmount = borrowerLoans
    .filter((loan) => loan.status === "active")
    .reduce((sum, loan) => sum + loan.amount, 0);

  // Determinar el estado correctamente
  let status;
  if (borrowerLoans.length === 0) {
    status = "registered"; // Nuevo estado para prestatarios sin préstamos
  } else {
    status = activeAmount > 0 ? "active" : "paid";
  }

  return {
    ...borrower,
    totalAmount,
    activeAmount,
    loanCount: borrowerLoans.length,
    status, // Usamos el estado calculado
  };
});

  // Efecto para recargar borrowers al montar el componente
  useEffect(() => {
    refetchBorrowers();
  }, [refetchBorrowers]);

  // Mostrar loading state si es necesario
  if (isLoadingBorrowers || isLoadingLoans) {
    return <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">Cargando datos...</div>;
  }

  // Paginación
  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = loans?.slice(indexOfFirstLoan, indexOfLastLoan) || [];
  const totalPages = Math.ceil((loans?.length || 0) / loansPerPage);

  // Handlers
  const handleCreateLoan = (data: LoanForm) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        refetchBorrowers();
      },
    });
  };

  const handleUpdateLoan = (data: LoanForm) => {
    if (!editingLoan) return;

    updateMutation.mutate(
      { id: editingLoan.id, data },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          refetchBorrowers();
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    setIsConfirmOpen(false);
  };

  const openDeleteDialog = (loan: LoanResponse) => {
    setSelectedLoan(loan);
    setIsConfirmOpen(true);
  };

  const openEditDialog = (loan: LoanResponse) => {
    setEditingLoan(loan);
    setIsEditDialogOpen(true);
    reset({
      borrowerId: loan.borrower.id,
      amount: loan.amount,
    });
  };

  const openHistoryModal = (borrowerId: number) => {
    setSelectedBorrower(borrowerId);
    setIsHistoryOpen(true);
  };

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="primary" className="flex items-center gap-1">
          <FiClock className="w-3 h-3" /> Activo
        </Badge>
      );
    case "paid":
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <FiCheckCircle className="w-3 h-3" /> Pagado
        </Badge>
      );
    case "registered":
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-gradient-to-r from-indigo-400 to-purple-400 text-white ">
          <FiUser className="w-3 h-3" /> Registrado
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gestión de Préstamos
            </span>
          </h1>
          <p className="text-gray-700">
            Registro y seguimiento de préstamos por prestatario
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          <FiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Préstamo</span>
        </Button>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-indigo-800">
              Total Prestado
            </h3>
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-900">
            {formatCurrency(totalLoansAmount)}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-800">
              Préstamos Activos
            </h3>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-900">
            {totalActiveLoans}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">
              Préstamos Pagados
            </h3>
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <FiCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-900">
            {totalPaidLoans}
          </p>
        </div>
      </div>

      {/* Listado de Prestatarios */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Prestatarios</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Contacto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {borrowersSummary?.map((borrower) => (
                    <tr key={borrower.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <FiUser className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {borrower.name}
                            </div>
                            <div className="text-sm text-gray-500 sm:hidden">
                              {borrower.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {borrower.phone}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(borrower.totalAmount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(borrower.balance)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        {getStatusBadge(borrower.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openHistoryModal(borrower.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Ver historial"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Préstamos */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Todos los Préstamos</h3>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prestatario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {loan.borrower.name}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden">
                          {formatDate(loan.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(loan.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {formatDate(loan.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditDialog(loan)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar préstamo"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(loan)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar préstamo"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear préstamo */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Nuevo Préstamo"
      >
        <form onSubmit={handleSubmit(handleCreateLoan)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prestatario
            </label>
            <Controller
              name="borrowerId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value?.toString() || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={errors.borrowerId?.message}
                >
                  <option value="">Seleccionar prestatario</option>
                  {borrowers?.map((borrower) => (
                    <option key={borrower.id} value={borrower.id}>
                      {borrower.name} ({borrower.phone}) - Saldo:{" "}
                      {formatCurrency(borrower.balance)}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto del préstamo
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Ej: 10000"
              error={errors.amount?.message}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
              isLoading={createMutation.isPending}
            >
              Registrar Préstamo
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal para editar préstamo */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title={`Editar Préstamo - ${editingLoan?.borrower.name}`}
      >
        <form onSubmit={handleSubmit(handleUpdateLoan)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prestatario
            </label>
            <div className="p-2 bg-gray-100 rounded-md">
              <p className="text-sm font-medium">
                {editingLoan?.borrower.name} ({editingLoan?.borrower.phone})
              </p>
              <p className="text-xs text-gray-500">
                Saldo actual: {formatCurrency(editingLoan?.borrower.balance || 0)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto del préstamo
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Ej: 10000"
              error={errors.amount?.message}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
              isLoading={updateMutation.isPending}
            >
              Actualizar Préstamo
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => selectedLoan && handleDelete(selectedLoan.id)}
        title="Eliminar Préstamo"
        message="¿Estás seguro que deseas eliminar este préstamo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
      />

      {/* Modal para historial de préstamos por prestatario */}
      <Dialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Historial de Préstamos"
        size="lg"
      >
        {selectedBorrower && (
          <div className="space-y-4">
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans
                    ?.filter((loan) => loan.borrower.id === selectedBorrower)
                    .map((loan) => (
                      <tr key={loan.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(loan.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(loan.createdAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(loan.status)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}