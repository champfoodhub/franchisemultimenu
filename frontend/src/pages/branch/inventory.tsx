import { DashboardShell } from "@/components/layout-shell";
import { useBranchInventory, useUpdateInventory } from "@/hooks/use-foodhub";
import { useAuth } from "@/hooks/use-auth";
import { Card, Input, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSearch } from "@/components/ui-custom";
import { useState } from "react";
import { Save, AlertCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BranchInventory() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { data: inventory, isLoading } = useBranchInventory(branchId!);
  const [search, setSearch] = useState("");
  
  if (!branchId) return <div className="p-8 text-center text-red-500 font-bold">Error: User not assigned to a branch.</div>;

  const filteredInventory = inventory?.filter((item: any) => 
    item.product.name.toLowerCase().includes(search.toLowerCase()) ||
    item.product.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display">Inventory Management</h2>
          <p className="text-muted-foreground">Control stock levels and local discounts.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="pl-9 h-11 rounded-xl border border-input bg-background w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <Card className="h-64 flex items-center justify-center">Loading inventory...</Card>
      ) : filteredInventory.length > 0 ? (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Stock Level</TableHead>
                <TableHead className="text-center">Discount %</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item: any) => (
                <InventoryRow key={item.id} item={item} branchId={branchId} />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="p-12 text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No inventory items found.</p>
          <p className="text-sm mt-2">
            {inventory?.length === 0 
              ? "Contact HQ to add products to your catalog." 
              : "No products match your search."}
          </p>
        </Card>
      )}
    </DashboardShell>
  );
}

function InventoryRow({ item, branchId }: { item: any, branchId: number }) {
  const [stock, setStock] = useState(item.stock.toString());
  const [discount, setDiscount] = useState(item.discount.toString());
  const { mutate: update, isPending } = useUpdateInventory();
  const { toast } = useToast();

  const hasChanges = parseInt(stock) !== item.stock || parseInt(discount) !== item.discount;

  const handleSave = () => {
    update({
      id: item.id,
      branchId,
      stock: parseInt(stock),
      discount: parseInt(discount)
    }, {
      onSuccess: () => toast({ title: "Updated!", description: "Inventory saved successfully." })
    });
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {item.product.imageUrl ? (
              <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
            )}
          </div>
          <div>
            <p className="font-semibold">{item.product.name}</p>
            <p className="text-xs text-muted-foreground">{item.product.category}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center font-semibold">
        ${item.product.basePrice}
      </TableCell>
      <TableCell className="text-center">
        <Input 
          type="number" 
          value={stock} 
          onChange={(e) => setStock(e.target.value)} 
          className="h-9 w-24 mx-auto text-center"
        />
      </TableCell>
      <TableCell className="text-center">
        <div className="relative inline-block w-24">
          <Input 
            type="number" 
            max="100" 
            value={discount} 
            onChange={(e) => setDiscount(e.target.value)} 
            className="h-9 w-full pr-8 text-center"
          />
          <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">%</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={item.isAvailable ? 'success' : 'destructive'}>
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        {hasChanges && (
          <Button size="sm" onClick={handleSave} isLoading={isPending} variant="primary">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

