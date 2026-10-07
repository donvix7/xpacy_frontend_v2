"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isPublicNavigationLinkActive, publicNavigationLinks } from "@/app/_lib/public-navigation";

export default function Navigation({children}) {
  const pathname = usePathname();
  return (
    <>
      <nav>
        <ul className="hidden lg:flex lg:space-x-6">
          {publicNavigationLinks.map(({ label, href }) => {
            const active = isPublicNavigationLinkActive(pathname, href);
            return (
              <li key={href} className={`border-b-2 p-2.5 text-md transition-colors hover:border-primary ${active ? "border-primary text-primary" : "border-transparent text-gray-700"}`}>
                <Link href={href} aria-current={active ? "page" : undefined} className="block">
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {children}
    </>
  );
}
