import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: (result.error as ZodError).issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: (result.error as ZodError).issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }
    req.query = result.data;
    next();
  };
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error("[error]", err);
  res.status(500).json({ error: "Internal server error" });
}