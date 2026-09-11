import { describe, it, expect } from "vitest";
import { authErrorMessage } from "../auth-error-messages";

describe("authErrorMessage", () => {
  it("explains a login refused for having no account", () => {
    expect(authErrorMessage("no_account")).toMatch(/doesn't exist yet/);
  });

  it("explains a failed code exchange", () => {
    expect(authErrorMessage("auth_failed")).toMatch(/couldn't complete/);
  });

  it("returns null for no code or an unknown one", () => {
    // Unknown codes must not render — the value comes straight off the URL.
    expect(authErrorMessage(null)).toBeNull();
    expect(authErrorMessage("")).toBeNull();
    expect(authErrorMessage("<script>alert(1)</script>")).toBeNull();
  });
});
