export type CommentStatus = "published" | "hidden";

export type PublicComment = {
  id: string;
  username: string;
  body: string;
  createdAt: string;
};

export type AdminComment = PublicComment & {
  status: CommentStatus;
  updatedAt: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type Paginated<T> = { items: T[]; pagination: Pagination };
