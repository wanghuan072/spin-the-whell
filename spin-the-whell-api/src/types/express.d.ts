declare global {
  namespace Express {
    interface Request {
      admin?: { id: string; username: string };
      user?: { id: string; displayName: string; avatarUrl: string | null };
    }
  }
}

export {};
