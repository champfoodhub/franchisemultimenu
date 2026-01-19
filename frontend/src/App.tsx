import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Pages
import LoginPage from "@/pages/login";
import HqDashboard from "@/pages/hq/dashboard";
import HqProducts from "@/pages/hq/products";
import HqBranches from "@/pages/hq/branches";
import HqSchedules from "@/pages/hq/schedules";
import BranchInventory from "@/pages/branch/inventory";
import BranchOrders from "@/pages/branch/orders";
import BranchSettings from "@/pages/branch/settings";
import PublicMenu from "@/pages/menu";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicMenu} />
      <Route path="/login" component={LoginPage} />
      
      {/* HQ Routes */}
      <Route path="/hq" component={HqDashboard} />
      <Route path="/hq/products" component={HqProducts} />
      <Route path="/hq/branches" component={HqBranches} />
      <Route path="/hq/schedules" component={HqSchedules} />
      
      {/* Branch Routes */}
      <Route path="/branch" component={BranchInventory} />
      <Route path="/branch/orders" component={BranchOrders} />
      <Route path="/branch/settings" component={BranchSettings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
