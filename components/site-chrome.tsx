"use client";

import { usePathname } from "next/navigation";

// The authenticated app sections render their own nav header/footer in their
// own layouts, so the marketing site chrome must not also render there.
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
    <>
      {!isAppRoute && header}
      <div className="flex-1">{children}</div>
      {!isAppRoute && footer}
    </>
  );
}
