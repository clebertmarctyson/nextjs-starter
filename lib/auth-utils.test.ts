import { describe, it, expect } from "vitest";
import type { Session } from "next-auth";
import { attachUserId } from "./auth-utils";

function mockSession(overrides: Partial<Session["user"]> = {}): Session {
  return {
    expires: "2099-01-01T00:00:00.000Z",
    user: {
      id: "",
      name: "Ada",
      email: "ada@example.com",
      image: "https://example.com/avatar.png",
      ...overrides,
    },
  };
}

describe("attachUserId", () => {
  it("copies the persisted user id onto session.user", () => {
    const session = mockSession();
    const user = { id: "user_123" };

    const result = attachUserId(session, user);

    expect(result.user.id).toBe("user_123");
  });

  it("leaves other session.user fields untouched", () => {
    const session = mockSession();
    const user = { id: "user_123" };

    const result = attachUserId(session, user);

    expect(result.user.name).toBe("Ada");
    expect(result.user.email).toBe("ada@example.com");
  });

  it("does nothing when session.user is absent", () => {
    const session = { expires: "2099-01-01T00:00:00.000Z" } as Session;
    const user = { id: "user_123" };

    const result = attachUserId(session, user);

    expect(result.user).toBeUndefined();
  });
});
