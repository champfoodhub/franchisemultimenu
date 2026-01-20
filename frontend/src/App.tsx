import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const LoginPage = lazy(() => import("@/pages/login"));
const HqDashboard = lazy(() => import("@/pages/hq/dashboard"));
const HqProducts = lazy(() => import("@/pages/hq/products"));
const HqBranches = lazy(() => import("@/pages/hq/branches"));
const HqSchedules = lazy(() => import("@/pages/hq/schedules"));
const BranchInventory = lazy(() => import("@/pages/branch/inventory"));
const BranchOrders = lazy(() => import("@/pages/branch/orders"));
const BranchSettings = lazy(() => import("@/pages/branch/settings"));
const PublicMenu = lazy(() => import("@/pages/menu"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicMenu} />
      <Route path="/menu" component={PublicMenu} />
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
          <Suspense fallback={<LoadingFallback />}>
            <Router />
          </Suspense>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
