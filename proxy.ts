import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_PREFIXES: Record<string, string[]> = {
  brand: ["/brand"],
  creator: ["/creator"],
  admin: ["/admin"],
};

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] =
    null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable — allow the request through without auth context
    return supabaseResponse;
  }

  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes
  const isProtected =
    pathname.startsWith("/brand") ||
    pathname.startsWith("/creator") ||
    pathname.startsWith("/admin");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // No profile means the DB trigger hasn't run or migration is pending —
    // send to onboarding so the user isn't bounced into an infinite loop.
    const dest = profile?.role
      ? `/${profile.role}/dashboard`
      : "/onboarding";

    const redirectResponse = NextResponse.redirect(new URL(dest, request.url));
    // Propagate any token-refresh cookies so the browser stays authenticated.
    supabaseResponse.headers.getSetCookie().forEach((cookie) => {
      redirectResponse.headers.append("set-cookie", cookie);
    });
    return redirectResponse;
  }

  // Enforce role-based access
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_suspended")
      .eq("id", user.id)
      .single();

    if (profile?.is_suspended) {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }

    const role = profile?.role;
    if (role) {
      const allowedPrefixes = ROLE_PREFIXES[role] ?? [];
      const hasAccess = allowedPrefixes.some((prefix) =>
        pathname.startsWith(prefix)
      );
      if (!hasAccess) {
        return NextResponse.redirect(
          new URL(`/${role}/dashboard`, request.url)
        );
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
