export const publicNavigationLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/listings" },
  { label: "Blogs", href: "/blogs" },
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
