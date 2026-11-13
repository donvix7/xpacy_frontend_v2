import Link from "next/link";
import { Suspense } from "react";
import HeaderCta from "./HeaderCta";
import Logo from "./Logo";
import MobileNav from "./MobileNav";
import Navigation from "./Navigation";
import SpinnerMini from "./SpinnerMini";
import MobileHeaderCta from "./MobileHeaderCta";
export default async function AppHeader() {

  return (
    <header className="flex items-center justify-between px-5 py-4 sm:px-6 md:px-[7%] md:py-6 sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg ">
      <Logo />
      <Suspense fallback={<SpinnerMini />}>
        <Navigation>
          <HeaderCta />
        </Navigation>
      </Suspense>
   <Suspense fallback={<SpinnerMini />}>
        <MobileNav>
          <MobileHeaderCta />
        </MobileNav>
      </Suspense>
   
    </header >
  );
}
