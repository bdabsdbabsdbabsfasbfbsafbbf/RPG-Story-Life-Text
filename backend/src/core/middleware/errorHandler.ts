import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  const prismaErr = err as any;
  if (prismaErr?.code === "P2002") {
    res.status(409).json({
      error: "Já existe um registro com esse nome/slug",
      details: prismaErr?.meta?.target,
    });
    return;
  }

  if (prismaErr?.code === "P2025") {
    res.status(404).json({
      error: "Registro não encontrado",
    });
    return;
  }

  console.error("[Error]", err);
  res.status(500).json({
    error: "Internal server error",
  });
}
