import { describe, it, expect } from "vitest";
import { validateSafeUrl, isPrivateOrBlockedIP } from "../../src/lib/integrations/portfolio/ssrf-filter";

describe("SSRF Security Validator", () => {
  it("allows legitimate public HTTPS URLs", () => {
    const res = validateSafeUrl("https://example.com/portfolio");
    expect(res.isAllowed).toBe(true);
    expect(res.sanitizedUrl).toBe("https://example.com/portfolio");
  });

  it("blocks localhost and loopback domains", () => {
    expect(validateSafeUrl("http://localhost:3000").isAllowed).toBe(false);
    expect(validateSafeUrl("http://localhost.localdomain").isAllowed).toBe(false);
    expect(validateSafeUrl("http://service.local").isAllowed).toBe(false);
    expect(validateSafeUrl("http://127.0.0.1:8080").isAllowed).toBe(false);
    expect(validateSafeUrl("http://127.0.0.2").isAllowed).toBe(false);
  });

  it("blocks AWS cloud metadata and link-local IP", () => {
    expect(validateSafeUrl("http://169.254.169.254/latest/meta-data/").isAllowed).toBe(false);
    expect(isPrivateOrBlockedIP("169.254.169.254")).toBe(true);
  });

  it("blocks RFC1918 private IPv4 subnets", () => {
    expect(validateSafeUrl("http://10.0.0.1/admin").isAllowed).toBe(false);
    expect(validateSafeUrl("http://192.168.1.1").isAllowed).toBe(false);
    expect(validateSafeUrl("http://172.16.0.1").isAllowed).toBe(false);
    expect(validateSafeUrl("http://172.31.255.255").isAllowed).toBe(false);
  });

  it("blocks file:// and gopher:// or non-HTTP schemes", () => {
    expect(validateSafeUrl("file:///etc/passwd").isAllowed).toBe(false);
    expect(validateSafeUrl("gopher://evil.com").isAllowed).toBe(false);
    expect(validateSafeUrl("javascript:alert(1)").isAllowed).toBe(false);
  });
});
