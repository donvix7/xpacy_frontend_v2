export const publicNavigationLinks = [
  { label: "Home", href: "/" },
  { label: "Rent", href: "/rent" },
  { label: "Buy", href: "/buy" },
  { label: "Shortlet", href: "/shortlet" },
  { label: "Explore", href: "/listings" },
  { label: "Management", href: "/management" },
  { label: "Pricing", href: "/subscriptions" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
];

export function isValidOrganizationId(value) {
  return typeof value === "string" && value.trim() !== "" && value !== '""' && value !== "null" && value !== "undefined";
}

export function getPublicNavigationLinks(organizationId, isLoggedIn = false) {
  const isOrg = isValidOrganizationId(organizationId);
  const baseLinks = isLoggedIn
    ? publicNavigationLinks
    : publicNavigationLinks.filter(({ label }) => label === "Home" || label === "Explore");

  return baseLinks.map(({ label, href }) => ({
    label,
    href: isOrg && label !== "Home" && label !== "Blogs"
      ? `${href}?organizationId=${encodeURIComponent(organizationId)}`
      : href,
  }));
}

export function isPublicNavigationLinkActive(pathname, href) {
  const path = href.split("?")[0];
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
}
