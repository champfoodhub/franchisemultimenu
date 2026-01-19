import { DashboardShell } from "@/components/layout-shell";
import { Card, Button, Input } from "@/components/ui-custom";
import { useAuth } from "@/hooks/use-auth";
import { useBranch, useUpdateBranch } from "@/hooks/use-foodhub";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { type InsertBranch } from "@shared/schema";
import { Store, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BranchSettings() {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const { data: branch, isLoading } = useBranch(branchId!);
  const { mutate: updateBranch, isPending } = useUpdateBranch();
  const { toast } = useToast();

  const form = useForm<InsertBranch>({
    resolver: zodResolver(api.branches.create.input),
    defaultValues: {
      name: branch?.name || "",
      address: branch?.address || "",
      timezone: branch?.timezone || "UTC",
      isActive: branch?.isActive ?? true,
    },
    values: branch ? {
      name: branch.name,
      address: branch.address,
      timezone: branch.timezone,
      isActive: branch.isActive ?? true,
    } : undefined
  });

  const onSubmit = (data: InsertBranch) => {
    if (!branchId) return;
    updateBranch({ id: branchId, ...data }, {
      onSuccess: () => {
        toast({ title: "Settings Updated", description: "Branch settings saved successfully." });
      }
    });
  };

  if (!branchId) return <div className="p-8 text-center text-red-500 font-bold">Error: User not assigned to a branch.</div>;

  return (
    <DashboardShell>
      <header className="mb-8">
        <h2 className="text-3xl font-bold font-display">Branch Settings</h2>
        <p className="text-muted-foreground">Manage your branch information and preferences.</p>
      </header>

      <div className="max-w-2xl">
        <Card className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Store className="w-5 h-5" />
                <span>Basic Information</span>
              </div>
              <Input 
                label="Branch Name" 
                {...form.register("name")} 
                error={form.formState.errors.name?.message} 
              />
              <Input 
                label="Address" 
                {...form.register("address")} 
                error={form.formState.errors.address?.message} 
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Clock className="w-5 h-5" />
                <span>Localization</span>
              </div>
              <Input 
                label="Timezone" 
                {...form.register("timezone")} 
                error={form.formState.errors.timezone?.message} 
              />
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
              Save Changes
            </Button>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
