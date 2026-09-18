import Link from "next/link";
import { AppNav, type AppNavItem } from "./app-nav";

/**
 * Shared frame for the brand, creator and admin sections: the same sticky
 * header, 1280px column and type scale as the marketing site, so signing in
 * doesn't feel like landing in a different product.
 */
export function AppShell({
  nav,
  displayName,
  signOut,
  children,
}: {
  nav: AppNavItem[];
  displayName?: string | null;
  signOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6 px-6 pt-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2 pb-3">
            <img src="/logo.svg" alt="" className="size-7" />
            <span className="text-lg font-bold tracking-tight">Sterz</span>
          </Link>
          <div className="hidden pb-3 sm:block">
            <AppNav items={nav} />
          </div>
          <div className="flex items-center gap-3 pb-3">
            {displayName && (
              <span className="hidden text-[13px] text-muted-foreground md:inline">{displayName}</span>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-md px-3 text-[13px] font-semibold text-foreground shadow-[0_0_0_1px_var(--border)] transition-colors hover:bg-muted"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[1280px] px-6 sm:hidden">
          <AppNav items={nav} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-10 lg:px-8">{children}</main>
    </div>
  );
}
