import type { Paginated, PublicComment } from "@/types/comment";
import { apiRequest } from "./core";

export function getComments(page = 1) {
  return apiRequest<Paginated<PublicComment>>(`/api/comments?page=${page}&limit=12`);
}

export function submitComment(input: { body: string; website: string; startedAt: number }) {
  return apiRequest<{ comment: PublicComment }>("/api/comments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
