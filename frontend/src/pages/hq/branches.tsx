import { useState } from "react";
import { DashboardShell } from "@/components/layout-shell";
import { useBranches, useCreateBranch, useUpdateBranch } from "@/hooks/use-foodhub";
import { Card, Button, Input, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination, TableSearch } from "@/components/ui-custom";
import { Plus, Search, MapPin, Globe, Pencil, Grid, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { type InsertBranch, type Branch } from "@/shared/schema";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function HqBranches() {
  const { data: branches, isLoading } = useBranches();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBranches = branches?.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.address.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredBranches.length / ITEMS_PER_PAGE);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display">Branches</h2>
          <p className="text-muted-foreground">Manage your physical locations.</p>
        </div>
        <div className="flex gap-3">
          <TableSearch 
            value={search} 
            onChange={handleSearchChange}
            placeholder="Search branches..."
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
          <Button onClick={() => { setEditingBranch(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </Button>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-12 bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-48 bg-muted/20 animate-pulse rounded-xl" />
          </div>
        )
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <BranchCard 
              key={branch.id} 
              branch={branch} 
              onEdit={() => { setEditingBranch(branch); setIsDialogOpen(true); }} 
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Branch Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-mono text-xs">{branch.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="font-semibold">{branch.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      {branch.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{branch.timezone}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? 'success' : 'destructive'}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingBranch(branch); setIsDialogOpen(true); }}>
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
            totalItems={filteredBranches.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <BranchDialog 
        key={`branch-dialog-${editingBranch?.id ?? 'new'}-${isDialogOpen}`}
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={editingBranch} 
      />
    </DashboardShell>
  );
}

function BranchCard({ branch, onEdit }: { branch: Branch, onEdit: () => void }) {
  return (
    <Card className="p-6 hover-elevate transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <MapPin className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
            {branch.timezone}
          </div>
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{branch.name}</h3>
      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4" />
        {branch.address}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs font-bold text-green-600">Active</span>
      </div>
    </Card>
  );
}

function BranchDialog({ open, onOpenChange, initialData }: { open: boolean, onOpenChange: (v: boolean) => void, initialData: Branch | null }) {
  const { mutate: createBranch, isPending: isCreating } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch();
  
  const form = useForm<InsertBranch>({
    resolver: zodResolver(api.branches.create.input),
    defaultValues: { name: "", address: "", timezone: "EST", isActive: true },
    values: initialData ? {
      name: initialData.name,
      address: initialData.address,
      timezone: initialData.timezone,
      isActive: initialData.isActive ?? true
    } : undefined
  });

  const onSubmit = (data: InsertBranch) => {
    if (initialData) {
      updateBranch({ id: initialData.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createBranch(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Branch" : "Add New Branch"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Input label="Branch Name" {...form.register("name")} error={form.formState.errors.name?.message} />
          <Input label="Address" {...form.register("address")} error={form.formState.errors.address?.message} />
          <Input label="Timezone" placeholder="EST, PST, UTC..." {...form.register("timezone")} error={form.formState.errors.timezone?.message} />
          <Button type="submit" className="w-full" isLoading={isCreating || isUpdating}>
            {initialData ? "Update Branch" : "Create Branch"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

