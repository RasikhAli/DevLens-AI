/**
 * SSRF (Server-Side Request Forgery) protection validator for DevLens AI
 * Blocks private IP networks, loopback addresses, cloud metadata services, and non-HTTP protocols.
 */

export interface SSRFValidationResult {
  isAllowed: boolean;
  reason?: string;
  sanitizedUrl?: string;
}

export function isPrivateOrBlockedIP(ip: string): boolean {
  const trimmed = ip.trim();

  // IPv4 Loopback (127.0.0.0/8)
  if (/^127\.\d+\.\d+\.\d+$/.test(trimmed)) return true;

  // 0.0.0.0/8
  if (/^0\.\d+\.\d+\.\d+$/.test(trimmed)) return true;

  // RFC1918 Private Ranges
  // 10.0.0.0 - 10.255.255.255
  if (/^10\.\d+\.\d+\.\d+$/.test(trimmed)) return true;

  // 172.16.0.0 - 172.31.255.255
  const match172 = trimmed.match(/^172\.(\d+)\.\d+\.\d+$/);
  if (match172) {
    const secondOctet = parseInt(match172[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  // 192.168.0.0 - 192.168.255.255
  if (/^192\.168\.\d+\.\d+$/.test(trimmed)) return true;

  // Link-local / Cloud Metadata (169.254.0.0/16)
  if (/^169\.254\.\d+\.\d+$/.test(trimmed)) return true;

  // IPv6 Loopback and Unique Local
  if (
    trimmed === "::1" ||
    trimmed === "::" ||
    trimmed.startsWith("fc") ||
    trimmed.startsWith("fd") ||
    trimmed.startsWith("fe80")
  ) {
    return true;
  }

  return false;
}

export function validateSafeUrl(urlString: string): SSRFValidationResult {
  if (!urlString || typeof urlString !== "string") {
    return { isAllowed: false, reason: "Empty or invalid URL input" };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { isAllowed: false, reason: "Malformed URL syntax" };
  }

  // Only allow http and https protocols
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      isAllowed: false,
      reason: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard loopback hostnames
  if (
    hostname === "localhost" ||
    hostname === "localhost.localdomain" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan")
  ) {
    return { isAllowed: false, reason: "Access to local or internal domain names is prohibited." };
  }

  // Check direct IP address input against blocklist
  if (isPrivateOrBlockedIP(hostname)) {
    return {
      isAllowed: false,
      reason: "Requests to private IP addresses or cloud metadata endpoints are blocked.",
    };
  }

  // Ensure port (if specified) is standard web port (80, 443, 8080)
  if (parsed.port && !["80", "443", "8080", "8443"].includes(parsed.port)) {
    return {
      isAllowed: false,
      reason: `Connection to non-standard port ${parsed.port} is restricted for security.`,
    };
  }

  return {
    isAllowed: true,
    sanitizedUrl: parsed.toString(),
  };
}
