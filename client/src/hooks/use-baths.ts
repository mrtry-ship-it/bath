import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type BathInput } from "@shared/routes";

// GET /api/baths
export function useBaths() {
  return useQuery({
    queryKey: [api.baths.list.path],
    queryFn: async () => {
      const res = await fetch(api.baths.list.path, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch baths');
      return api.baths.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/baths/:id
export function useBath(id: number) {
  return useQuery({
    queryKey: [api.baths.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.baths.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch bath');
      return api.baths.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/baths
export function useCreateBath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BathInput) => {
      const validated = api.baths.create.input.parse(data);
      const res = await fetch(api.baths.create.path, {
        method: api.baths.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.baths.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to create bath entry');
      }
      return api.baths.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.baths.list.path] }),
  });
}

// PUT /api/baths/:id
export function useUpdateBath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<BathInput>) => {
      const validated = api.baths.update.input.parse(updates);
      const url = buildUrl(api.baths.update.path, { id });
      const res = await fetch(url, {
        method: api.baths.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.baths.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to update bath');
      }
      return api.baths.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.baths.list.path] }),
  });
}

// DELETE /api/baths/:id
export function useDeleteBath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.baths.delete.path, { id });
      const res = await fetch(url, { method: api.baths.delete.method, credentials: "include" });
      if (!res.ok) throw new Error('Failed to delete bath');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.baths.list.path] }),
  });
}
