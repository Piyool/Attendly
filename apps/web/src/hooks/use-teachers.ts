import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, fetchPaginatedApi, PaginatedResult } from "@/lib/api-client";
import {
  TeacherRecordDto,
  TeacherCreateDto,
  TeacherUpdateDto,
  TeacherFilterDto,
} from "@komas/shared-types";

export function useTeachers(filter: TeacherFilterDto = {}) {
  const { q = "", status = "", page = 1, per_page = 20 } = filter;

  return useQuery({
    queryKey: ["teachers", { q, status, page, per_page }],
    queryFn: async (): Promise<PaginatedResult<TeacherRecordDto[]>> => {
      const searchParams = new URLSearchParams();
      if (q.trim()) searchParams.set("q", q.trim());
      if (status && status !== "ALL") searchParams.set("status", status);
      if (page) searchParams.set("page", page.toString());
      if (per_page) searchParams.set("per_page", per_page.toString());

      const queryStr = searchParams.toString();
      const endpoint = `/api/v1/teachers${queryStr ? `?${queryStr}` : ""}`;
      return fetchPaginatedApi<TeacherRecordDto[]>(endpoint);
    },
    staleTime: 1000 * 30, // 30s
    retry: 1,
  });
}

export function useTeacher(id: string | null) {
  return useQuery({
    queryKey: ["teacher", id],
    queryFn: () => fetchApi<TeacherRecordDto>(`/api/v1/teachers/${id}`),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeacherCreateDto) =>
      fetchApi<TeacherRecordDto>("/api/v1/teachers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeacherUpdateDto }) =>
      fetchApi<TeacherRecordDto>(`/api/v1/teachers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<void>(`/api/v1/teachers/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
