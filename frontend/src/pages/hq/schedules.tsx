import { useState } from "react";
import { DashboardShell } from "@/components/layout-shell";
import { useSchedules, useCreateSchedule, useUpdateSchedule, useProducts } from "@/hooks/use-foodhub";
import { Card, Button, Input, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination, TableSearch } from "@/components/ui-custom";
import { Plus, Search, Calendar, Clock, Pencil, Grid, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { type InsertSchedule, type Schedule } from "@/shared/schema";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function HqSchedules() {
  const { data: schedules, isLoading } = useSchedules();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSchedules = schedules?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE);
  const paginatedSchedules = filteredSchedules.slice(
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
          <h2 className="text-3xl font-bold font-display">Schedules</h2>
          <p className="text-muted-foreground">Automate your menu switches.</p>
        </div>
        <div className="flex gap-3">
          <TableSearch 
            value={search} 
            onChange={handleSearchChange}
            placeholder="Search schedules..."
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
          <Button onClick={() => { setEditingSchedule(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
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
          {filteredSchedules.map((schedule) => (
            <ScheduleCard 
              key={schedule.id} 
              schedule={schedule}
              onEdit={() => { setEditingSchedule(schedule); setIsDialogOpen(true); }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Schedule Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-mono text-xs">{schedule.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${schedule.type === 'TIME_SLOT' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {schedule.type === 'TIME_SLOT' ? <Clock className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                      </div>
                      <span className="font-semibold">{schedule.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={schedule.type === 'TIME_SLOT' ? 'outline' : 'default'}>
                      {schedule.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {schedule.type === 'TIME_SLOT' ? (
                      <span className="text-sm">{schedule.startTime} - {schedule.endTime}</span>
                    ) : (
                      <span className="text-sm">Seasonal</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={schedule.isActive ? 'success' : 'destructive'}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingSchedule(schedule); setIsDialogOpen(true); }}>
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
            totalItems={filteredSchedules.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ScheduleDialog 
        key={`schedule-dialog-${editingSchedule?.id ?? 'new'}-${isDialogOpen}`}
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        initialData={editingSchedule} 
      />
    </DashboardShell>
  );
}

function ScheduleCard({ schedule, onEdit }: { schedule: Schedule, onEdit: () => void }) {
  return (
    <Card className="p-6 hover-elevate transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${schedule.type === 'TIME_SLOT' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
          {schedule.type === 'TIME_SLOT' ? <Clock className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={schedule.type === 'TIME_SLOT' ? 'outline' : 'default'}>
            {schedule.type}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{schedule.name}</h3>
      {schedule.type === 'TIME_SLOT' ? (
        <p className="text-sm text-muted-foreground mb-4">
          {schedule.startTime} - {schedule.endTime}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          Seasonal Promotion
        </p>
      )}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs font-bold text-green-600">Active</span>
      </div>
    </Card>
  );
}

function ScheduleDialog({ open, onOpenChange, initialData }: { open: boolean, onOpenChange: (v: boolean) => void, initialData: Schedule | null }) {
  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateSchedule();
  
  const form = useForm<InsertSchedule>({
    resolver: zodResolver(api.schedules.create.input),
    defaultValues: { 
      name: "", 
      type: "TIME_SLOT", 
      startTime: "09:00", 
      endTime: "17:00", 
      daysOfWeek: [1,2,3,4,5],
      isActive: true 
    },
    values: initialData ? {
      name: initialData.name,
      type: initialData.type,
      startTime: initialData.startTime ?? "09:00",
      endTime: initialData.endTime ?? "17:00",
      daysOfWeek: (initialData.daysOfWeek as number[]) ?? [1,2,3,4,5],
      isActive: initialData.isActive ?? true
    } : undefined
  });

  const onSubmit = (data: InsertSchedule) => {
    if (initialData) {
      updateSchedule({ id: initialData.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createSchedule(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Input label="Name" {...form.register("name")} error={form.formState.errors.name?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time (HH:MM)" {...form.register("startTime")} error={form.formState.errors.startTime?.message} />
            <Input label="End Time (HH:MM)" {...form.register("endTime")} error={form.formState.errors.endTime?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={isCreating || isUpdating}>
            {initialData ? "Update Schedule" : "Create Schedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

