import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import CascadeFailure from "./pages/CascadeFailure";
import Carriers from "./pages/Carriers";
import Warehouses from "./pages/Warehouses";
import Decisions from "./pages/Decisions";
import Explainability from "./pages/Explainability";
import Blockchain from "./pages/Blockchain";
import Learning from "./pages/Learning";
import Risk from "./pages/Risk";
import RTO from "./pages/RTO";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/cascade" element={<CascadeFailure />} />
          <Route path="/carriers" element={<Carriers />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/explainability" element={<Explainability />} />
          <Route path="/blockchain" element={<Blockchain />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/risk" element={<Risk />} />
          <Route path="/rto" element={<RTO />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
