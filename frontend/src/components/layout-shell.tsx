import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, LayoutDashboard, Utensils, Calendar, Store, Boxes, Settings, Menu } from "lucide-react";
import { Button } from "./ui-custom";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const hqItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/hq" },
  { icon: Utensils, label: "Products", href: "/hq/products" },
  { icon: Calendar, label: "Schedules", href: "/hq/schedules" },
  { icon: Store, label: "Branches", href: "/hq/branches" },
];

const branchItems: SidebarItem[] = [
  { icon: Boxes, label: "Inventory", href: "/branch" },
  { icon: Settings, label: "Settings", href: "/branch/settings" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const items = user?.role === "HQ_ADMIN" ? hqItems : branchItems;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row font-body">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-border min-h-screen p-6 flex flex-col fixed md:relative z-20">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Menu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display leading-none text-foreground">FoodHub</h1>
            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">{user?.role === "HQ_ADMIN" ? "Headquarters" : "Branch Manager"}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {items.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 mt-6 border-t border-border">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.username}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 p-4 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
