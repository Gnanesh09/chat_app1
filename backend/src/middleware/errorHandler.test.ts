import { describe, test, expect, spyOn, beforeEach, afterEach } from "bun:test";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "./errorHandler";

function createMockResponse(initialStatusCode = 200) {
  const res: Partial<Response> & { statusCode: number } = {
    statusCode: initialStatusCode,
    status(code: number) {
      res.statusCode = code;
      return res as Response;
    },
    json(body: unknown) {
      (res as any).body = body;
      return res as Response;
    },
  };
  return res as Response & { body?: unknown };
}

describe("errorHandler", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let consoleLogSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  test("defaults to 500 when response status code is still 200", () => {
    const res = createMockResponse(200);
    const err = new Error("Something broke");

    errorHandler(err, {} as Request, res, (() => {}) as NextFunction);

    expect(res.statusCode).toBe(500);
    expect((res as any).body).toMatchObject({ message: "Something broke" });
  });

  test("preserves an already-set non-200 status code", () => {
    const res = createMockResponse(404);
    const err = new Error("Not found");

    errorHandler(err, {} as Request, res, (() => {}) as NextFunction);

    expect(res.statusCode).toBe(404);
    expect((res as any).body).toMatchObject({ message: "Not found" });
  });

  test("falls back to a default message when err.message is empty", () => {
    const res = createMockResponse(200);
    const err = new Error("");

    errorHandler(err, {} as Request, res, (() => {}) as NextFunction);

    expect((res as any).body).toMatchObject({ message: "Internal Server Error" });
  });

  test("includes the stack trace when NODE_ENV is development", () => {
    process.env.NODE_ENV = "development";
    const res = createMockResponse(200);
    const err = new Error("Boom");

    errorHandler(err, {} as Request, res, (() => {}) as NextFunction);

    expect((res as any).body).toHaveProperty("stack");
    expect((res as any).body.stack).toBe(err.stack);
  });

  test("omits the stack trace when NODE_ENV is not development", () => {
    process.env.NODE_ENV = "production";
    const res = createMockResponse(200);
    const err = new Error("Boom");

    errorHandler(err, {} as Request, res, (() => {}) as NextFunction);

    expect((res as any).body).not.toHaveProperty("stack");
  });

  test("logs the error message to the console", () => {
    const res = createMockResponse(200);
    const err = new Error("Logged error");

    errorHandler(err, {} as Request, res, (() => {}) as NextFunction);

    expect(consoleLogSpy).toHaveBeenCalledWith("Error:", "Logged error");
  });
});