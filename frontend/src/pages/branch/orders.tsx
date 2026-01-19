import { DashboardShell } from "@/components/layout-shell";
import { Card } from "@/components/ui-custom";
import { ShoppingBag, CheckCircle2, Clock } from "lucide-react";

export default function BranchOrders() {
  const orders = [
    { id: "1001", customer: "John Doe", items: "Signature Burger (x2)", status: "Completed", total: "$25.98", time: "10 mins ago" },
    { id: "1002", customer: "Jane Smith", items: "Morning Pancakes (x1)", status: "Processing", total: "$9.99", time: "Just now" },
  ];

  return (
    <DashboardShell>
      <header className="mb-8">
        <h2 className="text-3xl font-bold font-display">Simulated Orders</h2>
        <p className="text-muted-foreground">Live order feed for your branch.</p>
      </header>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 flex items-center justify-between hover-elevate">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">Order #{order.id} - {order.customer}</p>
                <p className="text-sm text-muted-foreground">{order.items}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{order.total}</p>
              <div className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
                <Clock className="w-3 h-3" />
                {order.time}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-8">
              {order.status === 'Completed' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />}
              <span className={`text-sm font-bold ${order.status === 'Completed' ? 'text-green-600' : 'text-orange-600'}`}>{order.status}</span>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
