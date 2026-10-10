import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../src/lib/auth/password";
import { createSessionToken, verifySessionToken } from "../../src/lib/auth/session";

describe("Authentication & Session Security", () => {
  it("hashes passwords and verifies matching plaintexts", async () => {
    const plain = "superSecretPassword123!";
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(await verifyPassword(plain, hashed)).toBe(true);
    expect(await verifyPassword("wrongPassword", hashed)).toBe(false);
  });

  it("creates and verifies valid JWT session tokens", () => {
    const mockUser = {
      id: "user-123",
      email: "recruiter@devlens.ai",
      name: "Engineering Lead",
    };

    const token = createSessionToken(mockUser);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe("user-123");
    expect(verified?.email).toBe("recruiter@devlens.ai");
  });

  it("rejects invalid or tampered session tokens", () => {
    expect(verifySessionToken("invalid.token.here")).toBeNull();
    expect(verifySessionToken("")).toBeNull();
  });
});
