export const publicNavigationLinks = [
  { label: "Home", href: "/" },
  { label: "Shortlet", href: "/shortlet" },
  { label: "Rent", href: "/rent" },
  { label: "Buy", href: "/buy" },
  { label: "Blogs", href: "/blogs" },
  { label: "Management", href: "/management" },
  { label: "Contact", href: "/contact" },
];

export function isPublicNavigationLinkActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
