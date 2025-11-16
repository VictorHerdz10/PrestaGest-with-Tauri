// src/views/dashboard/PaymentsView.tsx
import { useState, useEffect } from "react";
import {
  usePayments,
  useCreatePayments,
  useDeletePayments,
  useUpdatePayments,
} from "../../hooks/usePayments";
import { useBorrowers } from "../../hooks/useBorrowers";
import {
  FiPlus,
  FiTrash2,
  FiDollarSign,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiEye,
  FiRefreshCw,
  FiEdit,
} from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../utils/formatCurrency";
import {
  PaymentForm,
  PaymentResponse,
  paymentSchema,
} from "../../schemas/payment.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pagination } from "../../components/ui/Pagination";
import { useExchangeRate } from "../../hooks/useExchangeRate";
import { useCurrencies } from "../../hooks/useCurrencies";

export default function PaymentsView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
  const [selectedBorrower, setSelectedBorrower] = useState<number | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const paymentsPerPage = 10;
  const { data: currencies } = useCurrencies();
  const { data: payments } = usePayments();
  const { data: borrowers } = useBorrowers();
  const { data: exchangeData, refetch: refetchExchangeRate } = useExchangeRate();
  
  const createMutation = useCreatePayments();
  const deleteMutation = useDeletePayments();
  const updateMutation = useUpdatePayments();
  
  const defaultExchangeRate = exchangeData?.defaultRate || 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      currency: "USD",
      exchange_rate: defaultExchangeRate,
      amount: 0,
      borrowerId: undefined,
    },
  });

  // Resetear el formulario cuando se cierran los diálogos
  useEffect(() => {
    if (!isDialogOpen && !isEditDialogOpen) {
      reset({
        currency: "USD",
        exchange_rate: defaultExchangeRate,
        amount: 0,
        borrowerId: undefined,
      });
      setEditingPayment(null);
    }
  }, [isDialogOpen, isEditDialogOpen, reset, defaultExchangeRate]);

  // Calcular totales
  const totalPaymentsAmount = payments?.reduce((sum, payment) => sum + payment.amount_cup, 0) || 0;
  const totalPaymentsCount = payments?.length || 0;

  // Prestatarios con resumen de pagos
const borrowersSummary = borrowers?.map((borrower) => {
  const borrowerPayments = payments?.filter((payment) => payment.borrower.id === borrower.id) || [];
  const totalPaid = borrowerPayments.reduce((sum, payment) => sum + payment.amount_cup, 0);

  // Determinar el estado basado en préstamos y pagos
  let status;
  if (borrower.total_loans === 0 && borrower.total_paid === 0) {
    status = "registered"; // Nuevo estado para prestatarios sin actividad
  } else if (borrower.balance > 0) {
    status = "active"; // Tiene préstamos pendientes
  } else {
    status = "paid"; // Todo pagado
  }

  return {
    ...borrower,
    totalPaid,
    paymentCount: borrowerPayments.length,
    status, // Usamos el estado calculado
  };
});

  // Paginación
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments?.slice(indexOfFirstPayment, indexOfLastPayment) || [];
  const totalPages = Math.ceil((payments?.length || 0) / paymentsPerPage);

  // Calcular monto en CUP en tiempo real
  const amount = watch("amount") || 0;
  const rate = watch("exchange_rate") || 1;
  const cupAmount = amount * rate;

  // Handlers
  const handleCreatePayment = (data: PaymentForm) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
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

  const handleUpdatePayment = (data: PaymentForm) => {
    if (!editingPayment) return;

    updateMutation.mutate(
      { id: editingPayment.id, data },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    setIsConfirmOpen(false);
  };

  const openDeleteDialog = (payment: PaymentResponse) => {
    setSelectedPayment(payment);
    setIsConfirmOpen(true);
  };

  const openEditDialog = (payment: PaymentResponse) => {
    setEditingPayment(payment);
    setIsEditDialogOpen(true);
    reset({
      borrowerId: payment.borrower.id,
      amount: payment.amount,
      currency: payment.currency,
      exchange_rate: payment.exchange_rate,
    });
  };

  const openHistoryModal = (borrowerId: number) => {
    setSelectedBorrower(borrowerId);
    setIsHistoryOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Registro de Pagos
            </span>
          </h1>
          <p className="text-gray-700">
            Registro y seguimiento de pagos realizados por prestatarios
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          <FiPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Pago</span>
        </Button>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-indigo-800">
              Total Pagado (CUP)
            </h3>
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-900">
            {formatCurrency(totalPaymentsAmount)}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">
              Pagos Registrados
            </h3>
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <FiCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-900">
            {totalPaymentsCount}
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
                      Total (CUP)
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
                        {formatCurrency(borrower.totalPaid)}
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

      {/* Historial de Pagos */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Todos los Pagos</h3>
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
                      Moneda
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Tasa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CUP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.borrower.name}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden">
                          {payment.currency} · {formatDate(payment.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {payment.currency}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {payment.exchange_rate}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount_cup)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditDialog(payment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar pago"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteDialog(payment)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar pago"
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

      {/* Modal para crear pago */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Nuevo Pago"
      >
        <form onSubmit={handleSubmit(handleCreatePayment)} className="space-y-4">
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
                      {formatCurrency(borrower.balance)} CUP
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      field.onChange(selectedCode);
                      const selectedCurrency = currencies?.find(
                        (c) => c.code === selectedCode
                      );
                      if (selectedCurrency) {
                        setValue("exchange_rate", selectedCurrency.exchange_rate);
                      }
                    }}
                    error={errors.currency?.message}
                  >
                    <option value="">Seleccionar moneda</option>
                    {currencies?.map((currency) => (
                      <option key={currency.id} value={currency.code}>
                        {currency.name} ({currency.code}) - Tasa:{" "}
                        {currency.exchange_rate}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasa de Cambio
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  {...register("exchange_rate", { valueAsNumber: true })}
                  error={errors.exchange_rate?.message}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => refetchExchangeRate()}
                  className="p-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto del pago
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Ej: 100"
              error={errors.amount?.message}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Equivalente en CUP:</span>{" "}
              {formatCurrency(cupAmount)}
            </p>
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
              Registrar Pago
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal para editar pago */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title={`Editar Pago - ${editingPayment?.borrower.name}`}
      >
        <form onSubmit={handleSubmit(handleUpdatePayment)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prestatario
            </label>
            <div className="p-2 bg-gray-100 rounded-md">
              <p className="text-sm font-medium">
                {editingPayment?.borrower.name} ({editingPayment?.borrower.phone})
              </p>
              <p className="text-xs text-gray-500">
                Saldo actual: {formatCurrency(editingPayment?.borrower.balance || 0)} CUP
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      field.onChange(selectedCode);
                      const selectedCurrency = currencies?.find(
                        (c) => c.code === selectedCode
                      );
                      if (selectedCurrency) {
                        setValue("exchange_rate", selectedCurrency.exchange_rate);
                      }
                    }}
                    error={errors.currency?.message}
                  >
                    <option value="">Seleccionar moneda</option>
                    {currencies?.map((currency) => (
                      <option key={currency.id} value={currency.code}>
                        {currency.name} ({currency.code})
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tasa de Cambio
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  {...register("exchange_rate", { valueAsNumber: true })}
                  error={errors.exchange_rate?.message}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => refetchExchangeRate()}
                  className="p-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto del pago
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Ej: 100"
              error={errors.amount?.message}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Equivalente en CUP:</span>{" "}
              {formatCurrency(watch("amount") * watch("exchange_rate"))}
            </p>
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
              Actualizar Pago
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => selectedPayment && handleDelete(selectedPayment.id)}
        title="Eliminar Pago"
        message="¿Estás seguro que deseas eliminar este pago? Esta acción no se puede deshacer."
        confirmText="Eliminar"
      />

      {/* Modal para historial de pagos por prestatario */}
      <Dialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Historial de Pagos"
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
                      Moneda
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CUP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments
                    ?.filter((payment) => payment.borrower.id === selectedBorrower)
                    .map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.currency}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.exchange_rate}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount_cup)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.created_at)}
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