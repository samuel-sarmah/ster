"use client";

import { usePathname } from "next/navigation";

// The authenticated app sections render their own header in their own
// layouts, so the marketing header must not also render there. The footer is
// shown on every page so it spans the whole site.
const APP_PREFIXES = ["/creator", "/brand", "/admin"];

export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAppRoute = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {!isAppRoute && header}
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}
