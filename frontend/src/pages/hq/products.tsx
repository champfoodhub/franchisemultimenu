import { useState } from "react";
import { DashboardShell } from "@/components/layout-shell";
import { useProducts, useCreateProduct, useUpdateProduct, useSchedules, useProductSchedules, useUpdateProductSchedules } from "@/hooks/use-foodhub";
import { Card, Button, Input, Badge, Checkbox, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination, TableSearch } from "@/components/ui-custom";
import { Plus, Search, Pencil, Image as ImageIcon, Calendar, Check, X, Grid, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { type InsertProduct, type Product, type Schedule } from "@/shared/schema";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function HqProducts() {
  const { data: products, isLoading } = useProducts();
  const { data: schedules } = useSchedules();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    (p.menu && p.menu.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display">Products</h2>
          <p className="text-muted-foreground">Manage your master catalog.</p>
        </div>
        <div className="flex gap-3">
          <TableSearch 
            value={search} 
            onChange={handleSearchChange}
            placeholder="Search products..."
            className="w-full md:w-64"
          />
          <div className="flex border-2 border-input rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                "p-2.5 transition-all",
                viewMode === 'cards' ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-2.5 transition-all border-l-2 border-input",
                viewMode === 'table' ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-muted/20 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-12 bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-48 bg-muted/20 animate-pulse rounded-xl" />
          </div>
        )
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              schedules={schedules || []}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.includes(p.id))}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{product.category}</Badge>
                  </TableCell>
                  <TableCell>{product.menu || '-'}</TableCell>
                  <TableCell className="font-semibold">${product.basePrice}</TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? 'success' : 'destructive'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ProductDialog 
        key={`product-dialog-${editingProduct?.id ?? 'new'}-${isDialogOpen}`}
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={editingProduct} 
      />
    </DashboardShell>
  );
}

function ProductCard({ product, schedules }: { product: Product; schedules: Schedule[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: productSchedules, isLoading: isLoadingSchedules } = useProductSchedules(product.id);
  const updateSchedules = useUpdateProductSchedules();
  const [open, setOpen] = useState(false);

  const assignedScheduleIds = productSchedules?.map(s => s.id) || [];
  
  const handleScheduleToggle = (scheduleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newScheduleIds = assignedScheduleIds.includes(scheduleId)
      ? assignedScheduleIds.filter(id => id !== scheduleId)
      : [...assignedScheduleIds, scheduleId];
    
    updateSchedules.mutate({ productId: product.id, scheduleIds: newScheduleIds });
    setOpen(false);
  };

  return (
    <Card className="p-0 overflow-hidden group hover:shadow-lg transition-all duration-300 border-transparent hover:border-primary/20">
      <div className="relative h-48 bg-muted overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1 flex-wrap justify-end">
           <Badge className="bg-white/90 backdrop-blur shadow-sm text-foreground font-bold">{product.category}</Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
          <span className="font-bold text-primary">${product.basePrice}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{product.description}</p>
        
        {/* Menu Column */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Menu: {product.menu || 'Not set'}</span>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-between h-auto min-h-[32px] py-1 px-2"
              >
                <span className="truncate">
                  {isLoadingSchedules ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : assignedScheduleIds.length === 0 ? (
                    <span className="text-muted-foreground text-xs">Select menus...</span>
                  ) : (
                    <span className="text-xs">
                      {productSchedules?.map(s => s.name).join(", ") || `${assignedScheduleIds.length} menu(s)`}
                    </span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search menus..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No menu found.</CommandEmpty>
                  <CommandGroup>
                    {schedules.map((schedule) => {
                      const isSelected = assignedScheduleIds.includes(schedule.id);
                      return (
                        <CommandItem
                          key={schedule.id}
                          value={schedule.name}
                          onClick={(e) => handleScheduleToggle(schedule.id, e)}
                        >
                          <div className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                          )}>
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="flex-1">{schedule.name}</span>
                          <Badge variant="outline" className="text-xs ml-2">
                            {schedule.type === 'TIME_SLOT' ? 'Time Slot' : 'Seasonal'}
                          </Badge>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <Button variant="outline" size="sm" className="w-full" onClick={() => setIsEditDialogOpen(true)}>
          <Pencil className="w-3 h-3 mr-2" /> Edit Product
        </Button>
      </div>

      <ProductDialog 
        key={`product-dialog-${product.id}-${isEditDialogOpen}`}
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        initialData={product} 
      />
    </Card>
  );
}

function ProductDialog({ open, onOpenChange, initialData }: { open: boolean, onOpenChange: (v: boolean) => void, initialData: Product | null }) {
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  
  const form = useForm<InsertProduct>({
    resolver: zodResolver(api.products.create.input),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      category: "",
      menu: "",
      imageUrl: "",
      isActive: true
    },
    values: initialData ? {
      name: initialData.name,
      description: initialData.description,
      basePrice: Number(initialData.basePrice),
      category: initialData.category,
      menu: initialData.menu ?? "",
      imageUrl: initialData.imageUrl,
      isActive: initialData.isActive ?? true
    } : undefined
  });

  const onSubmit = (data: InsertProduct) => {
    if (initialData) {
      updateProduct({ id: initialData.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createProduct(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Product" : "Create New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Input label="Name" {...form.register("name")} error={form.formState.errors.name?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" placeholder="e.g. Burgers" {...form.register("category")} error={form.formState.errors.category?.message} />
            <Input label="Base Price" type="number" step="0.01" {...form.register("basePrice")} error={form.formState.errors.basePrice?.message} />
          </div>
          <Input label="Menu" placeholder="e.g. Breakfast, Lunch, Dinner" {...form.register("menu")} error={form.formState.errors.menu?.message} />
          <Input label="Image URL (Unsplash)" placeholder="https://images.unsplash.com/..." {...form.register("imageUrl")} error={form.formState.errors.imageUrl?.message} />
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Description</label>
            <textarea 
              className="w-full rounded-xl border-2 border-input px-4 py-2 text-sm focus:outline-none focus:border-primary min-h-[100px] resize-none" 
              {...form.register("description")}
            />
          </div>
          <Button type="submit" className="w-full" isLoading={isCreating || isUpdating}>
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

