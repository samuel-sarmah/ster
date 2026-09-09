import { describe, it, expect, vi, beforeEach } from "vitest";

const exchangeCodeForSession = vi.fn();
const signOut = vi.fn();
const deleteUser = vi.fn();
const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { exchangeCodeForSession, signOut },
    from,
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createServiceRoleClient: () => ({ auth: { admin: { deleteUser } } }),
}));

const { GET } = await import("../route");

const NEW_USER_ID = "new-user";
const RETURNING_USER_ID = "returning-user";

/** Minimal stand-in for the chained PostgREST builders the route uses. */
function tableStub(rows: Record<string, { id?: string; role?: string } | null>) {
  return (table: string) => {
    const result = { data: rows[table] ?? null, error: null };
    const builder: Record<string, unknown> = {
      select: () => builder,
      update: () => builder,
      eq: () => builder,
      maybeSingle: async () => result,
      single: async () => result,
      then: undefined,
    };
    return builder;
  };
}

function userCreatedAt(iso: string, id: string) {
  return { data: { user: { id, created_at: iso } }, error: null };
}

const justNow = () => new Date().toISOString();
const longAgo = () => new Date(Date.now() - 30 * 86_400_000).toISOString();

function call(query: string) {
  return GET(new Request(`http://localhost:3000/callback?${query}`));
}

beforeEach(() => {
  vi.clearAllMocks();
  signOut.mockResolvedValue({ error: null });
  deleteUser.mockResolvedValue({ error: null });
  from.mockImplementation(tableStub({ profiles: { role: "creator" } }));
});

describe("GET /callback — login must not create accounts", () => {
  it("refuses a login that just created the account, and deletes it", async () => {
    exchangeCodeForSession.mockResolvedValue(userCreatedAt(justNow(), NEW_USER_ID));

    const res = await call("code=abc&intent=login");

    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/signup?error=no_account"
    );
    expect(signOut).toHaveBeenCalled();
    expect(deleteUser).toHaveBeenCalledWith(NEW_USER_ID);
  });

  it("treats a missing intent as login, so a stale link can't create an account", async () => {
    exchangeCodeForSession.mockResolvedValue(userCreatedAt(justNow(), NEW_USER_ID));

    const res = await call("code=abc");

    expect(res.headers.get("location")).toContain("/signup?error=no_account");
    expect(deleteUser).toHaveBeenCalledWith(NEW_USER_ID);
  });

  it("still refuses when the account cannot be deleted", async () => {
    exchangeCodeForSession.mockResolvedValue(userCreatedAt(justNow(), NEW_USER_ID));
    deleteUser.mockResolvedValue({ error: new Error("no service key") });

    const res = await call("code=abc&intent=login");

    expect(res.headers.get("location")).toContain("/signup?error=no_account");
    expect(signOut).toHaveBeenCalled();
  });

  it("lets a returning user log in and keeps their redirect", async () => {
    exchangeCodeForSession.mockResolvedValue(userCreatedAt(longAgo(), RETURNING_USER_ID));
    from.mockImplementation(
      tableStub({ profiles: { role: "creator" }, creator_profiles: { id: RETURNING_USER_ID } })
    );

    const res = await call("code=abc&intent=login&redirect=/creator/dashboard");

    expect(res.headers.get("location")).toBe("http://localhost:3000/creator/dashboard");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("lets an existing user who never finished onboarding log in", async () => {
    // They have an account — the login flow must not delete it just because
    // the role-specific profile is missing.
    exchangeCodeForSession.mockResolvedValue(userCreatedAt(longAgo(), RETURNING_USER_ID));

    const res = await call("code=abc&intent=login");

    expect(res.headers.get("location")).toBe("http://localhost:3000/onboarding");
    expect(deleteUser).not.toHaveBeenCalled();
  });
});

describe("GET /callback — signup still provisions accounts", () => {
  it("sends a brand-new signup to onboarding", async () => {
    exchangeCodeForSession.mockResolvedValue(userCreatedAt(justNow(), NEW_USER_ID));

    const res = await call("code=abc&intent=signup&role=brand");

    expect(res.headers.get("location")).toBe("http://localhost:3000/onboarding");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("infers signup intent from a role param on an in-flight OAuth round-trip", async () => {
    exchangeCodeForSession.mockResolvedValue(userCreatedAt(justNow(), NEW_USER_ID));

    const res = await call("code=abc&role=creator");

    expect(res.headers.get("location")).toContain("/onboarding");
    expect(deleteUser).not.toHaveBeenCalled();
  });
});

describe("GET /callback — failures", () => {
  it("redirects to login when the code exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ data: {}, error: new Error("bad code") });

    const res = await call("code=abc&intent=login");

    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?error=auth_failed"
    );
  });

  it("redirects to login when no code is present", async () => {
    const res = await call("intent=login");

    expect(res.headers.get("location")).toContain("/login?error=auth_failed");
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
