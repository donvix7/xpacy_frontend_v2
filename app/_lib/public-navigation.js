export const publicNavigationLinks = [
  { label: "Home", href: "/" },
  { label: "Listings", href: '/listings?organizationId=""' },
  { label: "Rent", href: "/rent" },
  { label: "Buy", href: "/buy" },
  { label: "Blogs", href: "/blogs" },
  { label: "Management", href: `/management?organizationId=""` },
  { label: "Contact", href: '/contact?organizationId=""' },
];

export function isPublicNavigationLinkActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
