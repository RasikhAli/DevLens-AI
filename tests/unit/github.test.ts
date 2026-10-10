import { describe, it, expect } from "vitest";
import { GitHubClient } from "../../src/lib/integrations/github/client";

describe("GitHub Client Parsing", () => {
  it("extracts clean username from raw strings, @-handles, and URLs", () => {
    expect(GitHubClient.extractUsername("octocat")).toBe("octocat");
    expect(GitHubClient.extractUsername("@octocat")).toBe("octocat");
    expect(GitHubClient.extractUsername("https://github.com/torvalds")).toBe("torvalds");
    expect(GitHubClient.extractUsername("http://github.com/facebook/react")).toBe("facebook");
  });
});
