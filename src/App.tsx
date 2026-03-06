import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Menu from "./pages/Menu";
import AddEditItem from "./pages/AddEditItem";
import Profile from "./pages/Profile";
import StoreSettings from "./pages/StoreSettings";
import OperatingHours from "./pages/OperatingHours";
import PayoutSettings from "./pages/PayoutSettings";
import HelpSupport from "./pages/HelpSupport";
import AppSettings from "./pages/AppSettings";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="mx-auto max-w-md min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/add" element={<AddEditItem />} />
            <Route path="/menu/edit" element={<AddEditItem />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/store-settings" element={<StoreSettings />} />
            <Route path="/profile/operating-hours" element={<OperatingHours />} />
            <Route path="/profile/payout-settings" element={<PayoutSettings />} />
            <Route path="/profile/help-support" element={<HelpSupport />} />
            <Route path="/profile/app-settings" element={<AppSettings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
