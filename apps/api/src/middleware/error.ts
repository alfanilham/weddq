import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "ValidationError", details: err.flatten() });
  }
  const e = err as { status?: number; message?: string };
  const status = e.status ?? 500;
  const msg = e.message ?? "Internal Server Error";
  if (status >= 500) console.error("[ERR]", err);
  res.status(status).json({ error: msg });
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
