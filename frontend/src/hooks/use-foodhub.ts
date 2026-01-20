import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertProduct, type InsertBranch, type InsertInventory, type InsertSchedule } from "@shared/schema";

// === PRODUCTS (HQ) ===
export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await fetch(api.products.create.path, {
        method: api.products.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create product");
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertProduct>) => {
      const url = buildUrl(api.products.update.path, { id });
      const res = await fetch(url, {
        method: api.products.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update product");
      return api.products.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

// === BRANCHES (HQ) ===
export function useBranches() {
  return useQuery({
    queryKey: [api.branches.list.path],
    queryFn: async () => {
      const res = await fetch(api.branches.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch branches");
      return api.branches.list.responses[200].parse(await res.json());
    },
  });
}

export function useBranch(id: number) {
  return useQuery({
    queryKey: ["/api/branches", id],
    queryFn: async () => {
      const res = await fetch(`/api/branches/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch branch");
      return api.branches.create.responses[201].parse(await res.json()); // Reuse insert schema for shape
    },
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBranch) => {
      const res = await fetch(api.branches.create.path, {
        method: api.branches.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create branch");
      return api.branches.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.branches.list.path] }),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertBranch>) => {
      const res = await fetch(`/api/branches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update branch");
      return api.branches.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.branches.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/branches", variables.id] });
    },
  });
}

// === INVENTORY (BRANCH) ===
export function useBranchInventory(branchId: number) {
  return useQuery({
    queryKey: [api.inventory.list.path, branchId],
    queryFn: async () => {
      const url = buildUrl(api.inventory.list.path, { branchId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return api.inventory.list.responses[200].parse(await res.json());
    },
    enabled: !!branchId,
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, branchId, ...updates }: { id: number, branchId: number } & Partial<InsertInventory>) => {
      const url = buildUrl(api.inventory.update.path, { id });
      const res = await fetch(url, {
        method: api.inventory.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update inventory");
      return api.inventory.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.inventory.list.path, variables.branchId] 
      });
    },
  });
}

// === SCHEDULES (HQ) ===
export function useSchedules() {
  return useQuery({
    queryKey: [api.schedules.list.path],
    queryFn: async () => {
      const res = await fetch(api.schedules.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return api.schedules.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSchedule) => {
      const res = await fetch(api.schedules.create.path, {
        method: api.schedules.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create schedule");
      return api.schedules.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.schedules.list.path] }),
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertSchedule>) => {
      const url = buildUrl(api.schedules.update.path, { id });
      const res = await fetch(url, {
        method: api.schedules.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update schedule");
      return api.schedules.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.schedules.list.path] }),
  });
}

// === PUBLIC MENU ===
export function useActiveMenu(branchId?: number) {
  return useQuery({
    queryKey: [api.schedules.active.path, branchId].filter(Boolean),
    queryFn: async () => {
      let url = api.schedules.active.path;
      if (branchId) {
        url += `?branchId=${branchId}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        // Return empty array instead of throwing to prevent blank screen
        return [];
      }
      try {
        const data = await res.json();
        // Validate the response data
        return api.schedules.active.responses[200].parse(data);
      } catch (e) {
        console.warn('Failed to parse menu response, returning empty array');
        // Return empty array if parsing fails
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
}

// === PRODUCT SCHEDULES (HQ) ===
export function useProductSchedules(productId: number) {
  return useQuery({
    queryKey: ["/api/products", productId, "schedules"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}/schedules`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch product schedules");
      return res.json();
    },
    enabled: !!productId,
  });
}

export function useUpdateProductSchedules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, scheduleIds }: { productId: number; scheduleIds: number[] }) => {
      const res = await fetch(`/api/products/${productId}/schedules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleIds }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update product schedules");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", variables.productId, "schedules"] });
    },
  });
}
