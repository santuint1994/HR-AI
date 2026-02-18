/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    } | null;
  }
}
