import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/contexts/StoreContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import AddEditItem from "./pages/AddEditItem";
import Earnings from "./pages/Earnings";
import TransactionDetail from "./pages/TransactionDetail";
import VerifyTransaction from "./pages/VerifyTransaction";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import StoreSettings from "./pages/StoreSettings";
import OperatingHours from "./pages/OperatingHours";
import PayoutSettings from "./pages/PayoutSettings";
import HelpSupport from "./pages/HelpSupport";
import AppSettings from "./pages/AppSettings";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <NotificationsProvider>{children}</NotificationsProvider>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <Toaster />
            <Sonner />
            <div className="mx-auto max-w-md min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Onboarding />} />
                <Route path="/auth" element={<Auth />} />
                {/* Public verification page (QR scanners) */}
                <Route path="/verify/:reference" element={<VerifyTransaction />} />

                {/* Protected app */}
                <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                <Route path="/orders" element={<Protected><Orders /></Protected>} />
                <Route path="/menu" element={<Protected><Menu /></Protected>} />
                <Route path="/menu/add" element={<Protected><AddEditItem /></Protected>} />
                <Route path="/menu/edit" element={<Protected><AddEditItem /></Protected>} />
                <Route path="/earnings" element={<Protected><Earnings /></Protected>} />
                <Route path="/earnings/transactions/:id" element={<Protected><TransactionDetail /></Protected>} />
                <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
                <Route path="/profile" element={<Protected><Profile /></Protected>} />
                <Route path="/profile/store-settings" element={<Protected><StoreSettings /></Protected>} />
                <Route path="/profile/operating-hours" element={<Protected><OperatingHours /></Protected>} />
                <Route path="/profile/payout-settings" element={<Protected><PayoutSettings /></Protected>} />
                <Route path="/profile/help-support" element={<Protected><HelpSupport /></Protected>} />
                <Route path="/profile/app-settings" element={<Protected><AppSettings /></Protected>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </div>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
