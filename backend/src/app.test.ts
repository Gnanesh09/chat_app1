import { describe, test, expect, mock, beforeAll, afterAll, beforeEach } from "bun:test";
import type { Server } from "node:http";

const getAuthMock = mock();
const getUserMock = mock();

mock.module("@clerk/express", () => ({
  clerkMiddleware: () => (_req: any, _res: any, next: any) => next(),
  requireAuth: () => (_req: any, _res: any, next: any) => next(),
  getAuth: getAuthMock,
  clerkClient: {
    users: {
      getUser: getUserMock,
    },
  },
}));

// Prevent the auth routes' dependency chain from touching a real database
mock.module("./models/User", () => ({
  User: {
    findOne: mock(),
    findById: mock(),
    create: mock(),
  },
}));

const { default: app } = await import("./app");

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("GET /health", () => {
  test("responds with 200 and an ok status payload", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ status: "ok", message: "Server is running " });
  });
});

describe("GET /protected", () => {
  beforeEach(() => {
    getAuthMock.mockReset();
    getUserMock.mockReset();
    process.env.NODE_ENV = "test";
  });

  test("returns 401 when the request is not authenticated", async () => {
    getAuthMock.mockReturnValue({ isAuthenticated: false, userId: null });

    const res = await fetch(`${baseUrl}/protected`);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expect(getUserMock).not.toHaveBeenCalled();
  });

  test("returns the Clerk user when the request is authenticated", async () => {
    getAuthMock.mockReturnValue({ isAuthenticated: true, userId: "user_123" });
    const clerkUser = { id: "user_123", firstName: "Test" };
    getUserMock.mockResolvedValue(clerkUser);

    const res = await fetch(`${baseUrl}/protected`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ user: clerkUser });
    expect(getUserMock).toHaveBeenCalledWith("user_123");
  });

  test("delegates to the error handler when fetching the Clerk user fails", async () => {
    getAuthMock.mockReturnValue({ isAuthenticated: true, userId: "user_err" });
    getUserMock.mockRejectedValue(new Error("Clerk API unavailable"));

    const res = await fetch(`${baseUrl}/protected`);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Clerk API unavailable");
  });
});