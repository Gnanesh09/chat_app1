import { describe, test, expect, mock, beforeEach } from "bun:test";
import type { NextFunction, Response } from "express";

const getAuthMock = mock();
const getUserMock = mock();
const findByIdMock = mock();
const findOneMock = mock();
const createMock = mock();

mock.module("@clerk/express", () => ({
  getAuth: getAuthMock,
  clerkClient: {
    users: {
      getUser: getUserMock,
    },
  },
}));

mock.module("../models/User", () => ({
  User: {
    findById: findByIdMock,
    findOne: findOneMock,
    create: createMock,
  },
}));

const { getMe, authCallback } = await import("./authController");

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

describe("getMe", () => {
  beforeEach(() => {
    findByIdMock.mockReset();
  });

  test("returns the user with 200 when found", async () => {
    const user = { _id: "mongo_1", name: "Ada Lovelace" };
    findByIdMock.mockResolvedValue(user);

    const req: any = { userId: "mongo_1" };
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await getMe(req, res, next);

    expect(findByIdMock).toHaveBeenCalledWith("mongo_1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(user);
  });

  test("returns 404 when the user does not exist", async () => {
    findByIdMock.mockResolvedValue(null);

    const req: any = { userId: "missing" };
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await getMe(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: "User not found" });
  });

  test("returns 500 when the lookup throws", async () => {
    findByIdMock.mockRejectedValue(new Error("db down"));

    const req: any = { userId: "mongo_1" };
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await getMe(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: "internal server eror" });
  });
});

describe("authCallback", () => {
  beforeEach(() => {
    getAuthMock.mockReset();
    getUserMock.mockReset();
    findOneMock.mockReset();
    createMock.mockReset();
  });

  test("responds with 401 when there is no authenticated Clerk user", async () => {
    getAuthMock.mockReturnValue({ userId: null });

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await authCallback(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Unauthorized" });
    expect(findOneMock).not.toHaveBeenCalled();
  });

  test("returns the existing user without calling Clerk or creating a new record", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_1" });
    const existingUser = { clerkId: "clerk_1", name: "Existing User" };
    findOneMock.mockResolvedValue(existingUser);

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await authCallback(req, res, next);

    expect(findOneMock).toHaveBeenCalledWith({ clerkId: "clerk_1" });
    expect(getUserMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
    expect(res.body).toEqual(existingUser);
  });

  test("creates a new user from Clerk profile data using firstName + lastName", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_2" });
    findOneMock.mockResolvedValue(null);
    getUserMock.mockResolvedValue({
      firstName: "Grace",
      lastName: "Hopper",
      emailAddresses: [{ emailAddress: "grace@example.com" }],
      imageUrl: "https://example.com/avatar.png",
    });
    const createdUser = { clerkId: "clerk_2", name: "Grace Hopper" };
    createMock.mockResolvedValue(createdUser);

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await authCallback(req, res, next);

    expect(getUserMock).toHaveBeenCalledWith("clerk_2");
    expect(createMock).toHaveBeenCalledWith({
      clerkId: "clerk_2",
      name: "Grace Hopper",
      email: "grace@example.com",
      avatar: "https://example.com/avatar.png",
    });
    expect(res.body).toEqual(createdUser);
  });

  test("trims a trailing space when the Clerk profile has no lastName", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_3" });
    findOneMock.mockResolvedValue(null);
    getUserMock.mockResolvedValue({
      firstName: "Cher",
      lastName: undefined,
      emailAddresses: [{ emailAddress: "cher@example.com" }],
      imageUrl: "",
    });
    createMock.mockResolvedValue({ clerkId: "clerk_3", name: "Cher" });

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await authCallback(req, res, next);

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Cher" })
    );
  });

  test("falls back to the email username when firstName is missing", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_4" });
    findOneMock.mockResolvedValue(null);
    getUserMock.mockResolvedValue({
      firstName: null,
      lastName: null,
      emailAddresses: [{ emailAddress: "anonymous@example.com" }],
      imageUrl: "",
    });
    createMock.mockResolvedValue({ clerkId: "clerk_4", name: "anonymous" });

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await authCallback(req, res, next);

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ name: "anonymous", email: "anonymous@example.com" })
    );
  });

  test("forwards errors to next() and sets a 500 status when something throws", async () => {
    getAuthMock.mockReturnValue({ userId: "clerk_5" });
    const dbError = new Error("connection lost");
    findOneMock.mockRejectedValue(dbError);

    const req: any = {};
    const res = createMockResponse();
    const next = mock() as unknown as NextFunction;

    await authCallback(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(next).toHaveBeenCalledWith(dbError);
  });
});