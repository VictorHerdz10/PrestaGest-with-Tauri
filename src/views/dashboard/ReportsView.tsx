// src/views/dashboard/ReportsView.tsx
import { useState } from "react";
import {
  FiBarChart2,
  FiPieChart,
  FiDownload,
  FiDollarSign,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { formatCurrency, formatDate } from "../../utils/formatCurrency";
import { useLoans } from "../../hooks/useLoans";
import { usePayments } from "../../hooks/usePayments";
import { useBorrowers } from "../../hooks/useBorrowers";
import { Chart as ChartJS, registerables, TooltipItem } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Dialog } from "../../components/ui/Dialog";
import type {
  LoanResponse,
  PaymentResponse,
  BorrowerResponse,
} from "../../schemas";
import { toast } from "sonner";

// Registrar componentes de ChartJS
ChartJS.register(...registerables);

type ReportType = "all" | "loans" | "payments";
type ExportFormat = "excel" | "pdf";

interface ChartData {
  labels: string[];
  data: number[];
}

interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
  }[];
}

interface MovementItem {
  id: number;
  createdAt: string;
  type: "loan" | "payment";
  borrower: {
    id: number;
    name: string;
  };
  amount: number;
  amount_cup?: number;
  currency?: string;
  status?: "active" | "paid";
}

const ITEMS_PER_PAGE = 10;

export default function ReportsView() {
  const { data: loans = [] } = useLoans();
  const { data: payments = [] } = usePayments();
  const { data: borrowers = [] } = useBorrowers();

  const [isLoading, setIsLoading] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<number | null>(null);
  const [reportType, setReportType] = useState<ReportType>("all");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("excel");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar datos
  const filteredLoans = loans.filter((loan: LoanResponse) => {
    if (reportType === "payments") return false;
    if (selectedBorrower && loan.borrower.id !== selectedBorrower) return false;
    return true;
  });

  const filteredPayments = payments.filter((payment: PaymentResponse) => {
    if (reportType === "loans") return false;
    if (selectedBorrower && payment.borrower.id !== selectedBorrower)
      return false;
    return true;
  });
  // Función para convertir LoanResponse a MovementItem
  const loanToMovementItem = (loan: LoanResponse): MovementItem => ({
    id: loan.id,
    createdAt: loan.created_at,
    type: "loan",
    borrower: loan.borrower,
    amount: loan.amount,
    status: loan.status,
  });
  
const getFilteredMetrics = () => {
  const filteredLoansCount = filteredLoans.length;
  const filteredPaymentsCount = filteredPayments.length;
  
  const filteredTotalLoans = filteredLoans.reduce(
    (sum: number, loan: LoanResponse) => sum + loan.amount, 
    0
  );
  
  const filteredTotalPayments = filteredPayments.reduce(
    (sum: number, payment: PaymentResponse) => sum + (payment.amount_cup || 0), 
    0
  );
  
  const filteredPaidLoans = filteredLoans.filter(
    (loan: LoanResponse) => loan.status === "paid"
  ).length;
  
  const filteredPaymentRate = filteredLoansCount > 0 
    ? Math.round((filteredPaidLoans / filteredLoansCount) * 100) 
    : 0;

  // Prestatarios activos en los resultados filtrados
  const filteredActiveBorrowers = new Set(
    filteredLoans
      .filter((loan: LoanResponse) => loan.status === "active")
      .map((loan: LoanResponse) => loan.borrower.id)
  ).size;

  return {
    loansCount: filteredLoansCount,
    paymentsCount: filteredPaymentsCount,
    totalLoans: filteredTotalLoans,
    totalPayments: filteredTotalPayments,
    paidLoans: filteredPaidLoans,
    paymentRate: filteredPaymentRate,
    activeBorrowers: filteredActiveBorrowers,
  };
};

  // Función para convertir PaymentResponse a MovementItem
  const paymentToMovementItem = (payment: PaymentResponse): MovementItem => ({
    id: payment.id,
    createdAt: payment.created_at,
    type: "payment",
    borrower: payment.borrower,
    amount: payment.amount,
    amount_cup: payment.amount_cup,
    currency: payment.currency,
  });

  // Agrupar datos por mes para gráficos
  const groupByMonth = (
    data: Array<LoanResponse | PaymentResponse>
  ): ChartData => {
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const result = Array(12).fill(0);

    data.forEach((item) => {
      const date = new Date(item.created_at);
      const month = date.getMonth();
      const amount = "amount_cup" in item ? item.amount_cup : item.amount;
      result[month] += amount;
    });

    return {
      labels: months,
      data: result,
    };
  };

  const loansByMonth = groupByMonth(loans);
  const paymentsByMonth = groupByMonth(payments);

  // Datos para gráficos
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            return `${context.dataset.label}: ${formatCurrency(
              context.parsed.y
            )}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: string | number) =>
            typeof value === "number" ? formatCurrency(value) : value,
        },
      },
    },
  };
  const barChartData: BarChartData = {
    labels: loansByMonth.labels,
    datasets: [
      {
        label: "Préstamos",
        data: loansByMonth.data,
        backgroundColor: "rgba(79, 70, 229, 0.7)",
      },
      {
        label: "Pagos",
        data: paymentsByMonth.data,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
      },
    ],
  };

  // Distribución de prestatarios
  const activeBorrowersCount = borrowers.filter(
    (borrower: BorrowerResponse) => {
      // Un prestatario está activo si tiene al menos un préstamo no pagado
      return loans.some(
        (loan: LoanResponse) =>
          loan.borrower.id === borrower.id && loan.status === "active"
      );
    }
  ).length;

  const inactiveBorrowersCount = borrowers.length - activeBorrowersCount;

  const pieChartData: PieChartData = {
    labels: ["Activos", "Inactivos"],
    datasets: [
      {
        data: [activeBorrowersCount, inactiveBorrowersCount],
        backgroundColor: ["rgba(79, 70, 229, 0.7)", "rgba(239, 68, 68, 0.7)"],
        borderWidth: 1,
      },
    ],
  };

  // Calcular métricas
  const totalLoans = loans.reduce(
    (sum: number, loan: LoanResponse) => sum + loan.amount,
    0
  );
  const totalPayments = payments.reduce(
    (sum: number, payment: PaymentResponse) => sum + payment.amount_cup,
    0
  );
  const activeBorrowers = borrowers.filter((borrower: BorrowerResponse) => {
    return loans.some(
      (loan: LoanResponse) =>
        loan.borrower.id === borrower.id && loan.status === "active"
    );
  }).length;
  const paidLoans = loans.filter(
    (loan: LoanResponse) => loan.status === "paid"
  ).length;
  const paymentRate =
    loans.length > 0 ? Math.round((paidLoans / loans.length) * 100) : 0;

  // Paginación
  const allItems = [...filteredLoans, ...filteredPayments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE);
  const paginatedItems = allItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Preparar datos para exportación
  const prepareExportData = (): MovementItem[] => {
    let itemsToExport: MovementItem[] = [];

    if (reportType === "all") {
      itemsToExport = [
        ...loans.map(loanToMovementItem),
        ...payments.map(paymentToMovementItem),
      ];
    } else if (reportType === "loans") {
      itemsToExport = loans.map(loanToMovementItem);
    } else {
      itemsToExport = payments.map(paymentToMovementItem);
    }

    if (selectedBorrower) {
      itemsToExport = itemsToExport.filter(
        (item) => item.borrower.id === selectedBorrower
      );
    }

    return itemsToExport.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const exportToExcel = () => {
    setIsLoading(true);
    try {
      const itemsToExport = prepareExportData();
    const filteredMetrics = getFilteredMetrics();

    // Hoja de resumen - ahora muestra datos filtrados
    const summaryData = [
      ["SISTEMA PRESTAGEST - REPORTE DE MOVIMIENTOS"],
      ["Fecha de generación:", new Date().toLocaleDateString()],
      [],
      ["PARÁMETROS DE FILTRADO"],
      [
        "Tipo de reporte:", 
        reportType === "all" ? "Todos" : reportType === "loans" ? "Préstamos" : "Pagos"
      ],
      [
        "Prestatario:", 
        selectedBorrower 
          ? borrowers.find(b => b.id === selectedBorrower)?.name || "Todos" 
          : "Todos"
      ],
      [],
      ["RESUMEN ESTADÍSTICO (FILTRADO)"],
      ["Total Préstamos (CUP):", formatCurrency(filteredMetrics.totalLoans)],
      ["Total Pagos (CUP):", formatCurrency(filteredMetrics.totalPayments)],
      ["Prestatarios Activos:", filteredMetrics.activeBorrowers],
      ["Préstamos Pagados:", `${filteredMetrics.paidLoans} (${filteredMetrics.paymentRate}%)`],
      [],
      ["DETALLE DE MOVIMIENTOS"],
      [
        "Fecha", 
        "Tipo", 
        "Prestatario", 
        "Monto Original", 
        "Moneda", 
        "Monto CUP", 
        "Estado"
      ]
    ];

      // Datos detallados
      const detailData = itemsToExport.map((item) => [
        formatDate(item.createdAt),
        item.type === "payment" ? "Pago" : "Préstamo",
        item.borrower.name,
        formatCurrency(item.amount),
        item.type === "payment" ? item.currency || "N/A" : "CUP",
        item.type === "payment"
          ? formatCurrency(item.amount_cup!)
          : formatCurrency(item.amount),
        item.status
          ? item.status === "active"
            ? "Activo"
            : "Pagado"
          : "Completado",
      ]);

      const data = [...summaryData, ...detailData];

      const ws = XLSX.utils.aoa_to_sheet(data);

      // Ajustar anchos de columnas (más anchas)
      const colWidths = [
        { wch: 25 }, // Fecha
        { wch: 15 }, // Tipo
        { wch: 30 }, // Prestatario
        { wch: 20 }, // Monto Original
        { wch: 15 }, // Moneda
        { wch: 20 }, // Monto CUP
        { wch: 15 }, // Estado
      ];
      ws["!cols"] = colWidths;

      // Estilos para el título
      if (!ws["A1"]) ws["A1"] = {};
      ws["A1"].s = {
        font: { sz: 16, bold: true, color: { rgb: "000080" } },
        alignment: { horizontal: "center" },
      };

      // Combinar celdas para el título
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");

      // Mostrar notificación
      toast.success("Reporte Excel generado con éxito", {
        description: "El archivo se descargará automáticamente",
        duration: 3000,
      });
      XLSX.writeFile(
        wb,
        `PrestaGest_Reporte_${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19)}.xlsx`
      );
    } catch (error) {
      toast.error("Error al generar Excel", {
        description: "Ocurrió un problema al crear el reporte",
        duration: 3000,
      });
      console.error("Error al exportar a Excel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    setIsLoading(true);
    try {
       
      const doc = new jsPDF("l", "mm", "a4") as jsPDF & {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        autoTable: (options: any) => void;
      };
       const filteredMetrics = getFilteredMetrics();
      // Agregar logo
      const logoUrl = "./logo.png";
      const logoResponse = await fetch(logoUrl);
      const logoBlob = await logoResponse.blob();
      const logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });

      // Configuración del documento
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text("SISTEMA PRESTAGEST", 105, 20, { align: "center" });
      doc.setFontSize(16);
      doc.text("Reporte de Movimientos Prestarios", 105, 30, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 260, 15, {
        align: "right",
      });

      // Contenido del reporte
     doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("PARÁMETROS DE FILTRADO", 15, 45);
    
    doc.setFontSize(11);
    doc.text(
      `• Tipo de reporte: ${reportType === "all" ? "Todos" : reportType === "loans" ? "Préstamos" : "Pagos"}`,
      20,
      55
    );
    doc.text(
      `• Prestatario: ${selectedBorrower 
        ? borrowers.find(b => b.id === selectedBorrower)?.name || "Todos" 
        : "Todos"}`,
      20,
      65
    );
    
    doc.text("RESUMEN ESTADÍSTICO (FILTRADO)", 15, 80);
    
    doc.text(
      `• Total Préstamos (CUP): ${formatCurrency(filteredMetrics.totalLoans)}`,
      20,
      90
    );
    doc.text(
      `• Total Pagos (CUP): ${formatCurrency(filteredMetrics.totalPayments)}`,
      20,
      100
    );
    doc.text(
      `• Prestatarios Activos: ${filteredMetrics.activeBorrowers}`,
      20,
      110
    );
    doc.text(
      `• Préstamos Pagados: ${filteredMetrics.paidLoans} (${filteredMetrics.paymentRate}%)`,
      20,
      120
    );

    doc.text("DETALLE DE MOVIMIENTOS", 15, 135);

      const headers = [
        "Fecha",
        "Tipo",
        "Prestatario",
        "Monto",
        "Moneda",
        "Monto CUP",
        "Estado",
      ];

      const data = prepareExportData().map((item) => [
        formatDate(item.createdAt),
        item.type === "payment" ? "Pago" : "Préstamo",
        item.borrower.name,
        formatCurrency(item.amount),
        item.type === "payment" ? item.currency || "N/A" : "CUP",
        formatCurrency(item.type === "payment" ? item.amount_cup! : item.amount),
        item.status
          ? item.status === "active"
            ? "Activo"
            : "Pagado"
          : "Completado",
      ]);

      // Configuración de la tabla
      doc.autoTable({
        startY: 105,
        head: [headers],
        body: data,
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 10,
          cellPadding: 4,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontSize: 11,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 30, fontStyle: "bold" },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 50 },
          6: { cellWidth: 40 },
        },
        didDrawPage: () => {
          // Logo en esquina inferior derecha de cada página (pegado al borde)
          doc.addImage(logoDataUrl, "PNG", 270, 185, 20, 20);
        },
      });

      toast.success("Reporte PDF generado con éxito", {
        description: "El archivo se descargará automáticamente",
        duration: 3000,
      });

      doc.save(
        `PrestaGest_Reporte_${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19)}.pdf`
      );
    } catch (error) {
      toast.error("Error al generar PDF", {
        description: "Ocurrió un problema al crear el reporte",
        duration: 3000,
      });
      console.error("Error al exportar a PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const executeExport = () => {
    setIsExportDialogOpen(false);
    setIsLoading(true);

    try {
      if (exportFormat === "excel") {
        exportToExcel();
      } else {
        exportToPDF();
      }
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6 space-y-8">
      {/* Header y controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Reportes y Análisis
            </span>
          </h1>
          <p className="text-gray-700">
            Visualiza métricas clave e historial de movimientos
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsExportDialogOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600"
          disabled={isLoading}
        >
          <FiDownload className="w-4 h-4" />
          {isLoading ? "Exportando..." : "Exportar"}
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Reporte
          </label>
          <Select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value as ReportType);
              setCurrentPage(1);
            }}
          >
            <option value="all">Todos los movimientos</option>
            <option value="loans">Solo préstamos</option>
            <option value="payments">Solo pagos</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prestatario
          </label>
          <Select
            value={selectedBorrower || ""}
            onChange={(e) => {
              setSelectedBorrower(
                e.target.value ? Number(e.target.value) : null
              );
              setCurrentPage(1);
            }}
          >
            <option value="">Todos los prestatarios</option>
            {borrowers.map((borrower: BorrowerResponse) => (
              <option key={borrower.id} value={borrower.id}>
                {borrower.name} ({borrower.phone})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Resumen Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-indigo-800">
              Total Préstamos
            </h3>
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-900">
            {formatCurrency(totalLoans)}
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            {loans.length} préstamos totales
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">Total Pagos</h3>
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-900">
            {formatCurrency(totalPayments)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {payments.length} pagos totales
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-800">
              Prestatarios Activos
            </h3>
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <FiUser className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-900">
            {activeBorrowers}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {borrowers.length} prestatarios totales
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-purple-800">
              Préstamos Pagados
            </h3>
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <FiCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-900">{paidLoans}</p>
          <p className="text-xs text-purple-600 mt-1">
            {paymentRate}% de tasa de pago
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FiBarChart2 className="text-blue-500" />
              Préstamos vs Pagos por Mes
            </h3>
          </div>
          <div className="h-64">
            <Bar options={barChartOptions} data={barChartData} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <FiPieChart className="text-purple-500" />
              Distribución de Prestatarios
            </h3>
          </div>
          <div className="h-64">
            <Pie data={pieChartData} />
          </div>
        </div>
      </div>

      {/* Tabla de Detalles */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Historial de Movimientos
          </h3>
          <p className="text-sm text-gray-500">
            Mostrando {paginatedItems.length} de {allItems.length} registros
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prestatario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {"amount_cup" in item ? (
                      <span className="text-green-600">Pago</span>
                    ) : (
                      <span className="text-blue-600">Préstamo</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.borrower.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(
                      "amount_cup" in item
                        ? (item as PaymentResponse).amount_cup
                        : (item as LoanResponse).amount
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {"status" in item ? (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.status === "active" ? "Activo" : "Pagado"}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Completado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {/* Diálogo de exportación */}
      <Dialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        title="Opciones de Exportación"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato de Exportación
            </label>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            >
              <option value="excel">Excel (XLSX)</option>
              <option value="pdf">PDF</option>
            </Select>
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-600">
              Se exportarán{" "}
              {reportType === "all"
                ? "todos los movimientos"
                : reportType === "loans"
                ? "todos los préstamos"
                : "todos los pagos"}
              {selectedBorrower ? ` del prestatario seleccionado` : ""}{" "}
              incluyendo un resumen.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              className="bg-gradient-to-r from-green-600 to-teal-600"
              onClick={executeExport}
              disabled={isLoading}
            >
              {isLoading ? "Exportando..." : "Exportar"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
