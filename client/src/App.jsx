import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Reports from "./pages/Reports";
import Layout from "./components/Layout";
import { TrendingUp } from "lucide-react";

const LoadingScreen = () => (
  <div className="min-h-[100dvh] flex items-center justify-center bg-[#090C13]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-[0_0_24px_oklch(0.60_0.22_278/0.2)]">
        <TrendingUp size={18} className="text-primary animate-pulse" strokeWidth={2.5} />
      </div>
      <p className="text-[13px] text-gray-600 tracking-widest uppercase font-medium">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return token ? <Navigate to="/dashboard" /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Accounts />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
