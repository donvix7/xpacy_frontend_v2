"use client"
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getPublicNavigationLinks, isPublicNavigationLinkActive } from "@/app/_lib/public-navigation";

export default function Navigation({ children, isLoggedIn = false }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const links = getPublicNavigationLinks(searchParams.get("organizationId"), isLoggedIn);

  return (
    <nav aria-label="Main Navigation">
      <ul className="flex items-center gap-1 xl:gap-2">
        {links.map(({ label, href }) => {
          const active = isPublicNavigationLinkActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-soft text-ink font-semibold"
                    : "text-mute hover:bg-soft/70 hover:text-ink"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      {children}
    </nav>
  );
}
