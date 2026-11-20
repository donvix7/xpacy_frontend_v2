import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import HeaderCta from "./HeaderCta";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import Navigation from "./Navigation";
import SpinnerMini from "./SpinnerMini";
import MobileHeaderCta from "./MobileHeaderCta";
import ThemeToggle from "./ThemeToggle";

export default async function AppHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const isLoggedIn = Boolean(token);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-card/90 px-4 py-3 backdrop-blur-md transition-colors sm:px-6 md:px-[7%] md:py-3.5 shadow-xs">
      {/* Brand logo */}
      <div className="flex shrink-0 items-center">
        <Logo />
      </div>

      {/* Desktop navigation links */}
      <div className="hidden lg:flex lg:items-center lg:justify-center">
        <Suspense fallback={<div className="h-6 w-64 animate-pulse rounded-lg bg-soft" />}>
          <Navigation isLoggedIn={isLoggedIn} />
        </Suspense>
      </div>

      {/* Actions: Theme toggle + Auth CTA / Profile + Mobile hamburger menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <Suspense fallback={<SpinnerMini />}>
          <HeaderCta />
        </Suspense>
        <Suspense fallback={<SpinnerMini />}>
          <MobileNav isLoggedIn={isLoggedIn}>
            <MobileHeaderCta />
          </MobileNav>
        </Suspense>
      </div>
    </header>
  );
}
