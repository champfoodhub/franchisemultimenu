import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Helper function to build URL from queryKey
function buildUrlFromQueryKey(queryKey: readonly unknown[]): string {
  if (queryKey.length === 0) return "";
  
  // First element is the path
  let url = String(queryKey[0]);
  
  // Check if there are additional elements (query parameters)
  if (queryKey.length > 1) {
    const params: string[] = [];
    for (let i = 1; i < queryKey.length; i++) {
      const param = queryKey[i];
      if (param !== undefined && param !== null && param !== false) {
        // If it's a string with "=" it's already a param string
        if (typeof param === "string" && param.includes("=")) {
          params.push(param);
        } else if (typeof param === "number") {
          params.push(String(param));
        } else if (typeof param !== "boolean") {
          params.push(String(param));
        }
      }
    }
    if (params.length > 0) {
      url += (url.includes("?") ? "&" : "?") + params.join("&");
    }
  }
  
  return url;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build URL from queryKey array (handles paths with query params)
    const url = buildUrlFromQueryKey(queryKey);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Public query function for endpoints that don't require authentication
export const getPublicQueryFn: <T>() => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    // Build URL from queryKey array (handles paths with query params)
    const url = buildUrlFromQueryKey(queryKey);
    
    const res = await fetch(url);

    if (!res.ok) {
      // For public endpoints, return empty array on error instead of throwing
      if (res.status >= 400 && res.status < 500) {
        return [];
      }
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
    
    try {
      return await res.json();
    } catch {
      // Return empty array if JSON parsing fails
      return [];
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
