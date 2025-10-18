// src/router.tsx
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LoginView from "./views/auth/LoginView";
import AuthLayout from "./layout/AuthLayout";
import RegisterView from "./views/auth/RegisterView";
import HomeView from "./views/HomeView";
import DashboardView from "./views/dashboard/DashboardView";
import PrivateRoute from "./layout/PrivateRoute";
import DashboardLayout from "./layout/DashboardLayout";
import BorrowersView from "./views/dashboard/BorrowersView";
import LoansView from "./views/dashboard/LoansView";
import CurrenciesView from "./views/dashboard/CurrenciesView";
import ExchangeView from "./views/dashboard/ExchangeView";
import ReportsView from "./views/dashboard/ReportsView";
import PaymentsView from "./views/dashboard/PaymentsView";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
        </Route>
        
        {/* Ruta protegida */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/dashboard/borrowers" element={<BorrowersView />} />
            <Route path="/dashboard/loans" element={<LoansView />} />
            <Route path="/dashboard/currencies" element={<CurrenciesView />} />
            <Route path="/dashboard/exchange" element={<ExchangeView />} />
            <Route path="/dashboard/reports" element={<ReportsView />} />
            <Route path="/dashboard/payments" element={<PaymentsView />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}