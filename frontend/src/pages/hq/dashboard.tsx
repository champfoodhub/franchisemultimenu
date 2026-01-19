import { DashboardShell } from "@/components/layout-shell";
import { useProducts, useBranches, useSchedules } from "@/hooks/use-foodhub";
import { Card } from "@/components/ui-custom";
import { Store, Utensils, Calendar, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export default function HqDashboard() {
  const { data: products } = useProducts();
  const { data: branches } = useBranches();
  const { data: schedules } = useSchedules();

  return (
    <DashboardShell>
      <header>
        <h2 className="text-3xl font-bold font-display text-foreground">Overview</h2>
        <p className="text-muted-foreground mt-1">Welcome to HQ. Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Utensils} 
          label="Total Products" 
          value={products?.length || 0} 
          color="text-blue-500" 
          bg="bg-blue-50"
        />
        <StatCard 
          icon={Store} 
          label="Active Branches" 
          value={branches?.length || 0} 
          color="text-emerald-500" 
          bg="bg-emerald-50"
        />
        <StatCard 
          icon={Calendar} 
          label="Schedules" 
          value={schedules?.length || 0} 
          color="text-amber-500" 
          bg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Network Sales Trend</h3>
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              +12.5% vs last week
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#ef4444" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-6">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          <div className="space-y-3">
            <ActionItem label="Add New Product" href="/hq/products" />
            <ActionItem label="Create Schedule" href="/hq/schedules" />
            <ActionItem label="Register Branch" href="/hq/branches" />
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <Card className="flex items-center gap-4 border-l-4 border-l-primary/20 hover:border-l-primary transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold font-display">{value}</p>
      </div>
    </Card>
  );
}

function ActionItem({ label, href }: { label: string, href: string }) {
  return (
    <a href={href} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted font-medium transition-colors group cursor-pointer">
      {label}
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        →
      </div>
    </a>
  );
}
