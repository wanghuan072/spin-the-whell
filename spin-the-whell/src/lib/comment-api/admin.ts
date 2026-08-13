import type { AdminComment, CommentStatus, Paginated } from "@/types/comment";
import { apiRequest } from "./core";

export type AdminUser = { id: string; username: string };
export type CommentInput = { username: string; body: string; status: CommentStatus };

export function getCurrentAdmin() {
  return apiRequest<{ admin: AdminUser }>("/api/admin/auth/me");
}

export function loginAdmin(username: string, password: string) {
  return apiRequest<{ admin: AdminUser }>("/api/admin/auth/login", {
    method: "POST", body: JSON.stringify({ username, password }),
  });
}

export function logoutAdmin() {
  return apiRequest<void>("/api/admin/auth/logout", { method: "POST" });
}

export function getAdminComments(options: { page: number; limit: number; search: string; status: "all" | CommentStatus }) {
  const query = new URLSearchParams({
    page: String(options.page), limit: String(options.limit), search: options.search, status: options.status,
  });
  return apiRequest<Paginated<AdminComment>>(`/api/admin/comments?${query}`);
}

export function createComment(input: CommentInput) {
  return apiRequest<{ comment: AdminComment }>("/api/admin/comments", {
    method: "POST", body: JSON.stringify(input),
  });
}

export function updateComment(id: string, input: Partial<CommentInput>) {
  return apiRequest<{ comment: AdminComment }>(`/api/admin/comments/${id}`, {
    method: "PATCH", body: JSON.stringify(input),
  });
}

export function deleteComment(id: string) {
  return apiRequest<void>(`/api/admin/comments/${id}`, { method: "DELETE" });
}
