import { describe, test, expect, mock, beforeEach } from "bun:test";
import type { Response, NextFunction } from "express";

const getAuthMock = mock();
const requireAuthMiddleware = mock((req: any, res: any, next: any) => next());
const findOneMock = mock();

mock.module("@clerk/express", () => ({
  getAuth: getAuthMock,
  requireAuth: () => requireAuthMiddleware,
}));

mock.module("../models/User", () => ({
  User: {
    findOne: findOneMock,
  },
}));

const { protectRoute } = await import("./auth");

function createMockResponse() {
  const res: any = {
    statusCode: 200,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
  };
  return res as Response & { body?: unknown; statusCode: number };
}

describe("protectRoute", () => {
  beforeEach(() => {
    getAuthMock.mockReset();
    findOneMock.mockReset();
  });

  test("is an array containing requireAuth() followed by the user-lookup middleware", () => {
    expect(Array.isArray(protectRoute)).toBe(true);
    expect(protectRoute).toHaveLength(2);
    expect(protectRoute[0]).toBe(requireAuthMiddleware);
    expect(typeof protectRoute[1]).toBe("function");
  });

  test("attaches req.userId and calls next() when the Clerk user is found in the database", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_123" });
    const dbUser = { _id: { toString: () => "mongo_abc" } };
    findOneMock.mockResolvedValue(dbUser);

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    const lookupMiddleware = protectRoute[1] as any;
    await lookupMiddleware(req, res, next);

    expect(findOneMock).toHaveBeenCalledWith({ clerkId: "clerk_123" });
    expect(req.userId).toBe("mongo_abc");
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test("responds with 404 when no matching user exists in the database", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_missing" });
    findOneMock.mockResolvedValue(null);

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    const lookupMiddleware = protectRoute[1] as any;
    await lookupMiddleware(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "User not found" });
    expect(req.userId).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards errors to next() and sets a 500 status when the lookup throws", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_err" });
    const dbError = new Error("database unavailable");
    findOneMock.mockRejectedValue(dbError);

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    const lookupMiddleware = protectRoute[1] as any;
    await lookupMiddleware(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(next).toHaveBeenCalledWith(dbError);
  });
});