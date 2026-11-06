export const publicNavigationLinks = [
  { label: "Home", href: "/" },
  { label: "Rent", href: "/rent" },
  { label: "Buy", href: "/buy" },
  { label: "Shortlet", href: "/shortlet" },
  { label: "Blogs", href: "/blogs" },
  { label: "Explore", href: "/listings" },
  { label: "Management", href: "/management" },
  { label: "Contact", href: "/contact" },
];

export function isValidOrganizationId(value) {
  return typeof value === "string" && value.trim() !== "" && value !== '""' && value !== "null" && value !== "undefined";
}

export function getPublicNavigationLinks(organizationId) {
  const organizationScopedLinks = new Set(["Rent", "Buy", "Shortlet", "Management", "Contact"]);
  return publicNavigationLinks
    .filter(({ label }) => isValidOrganizationId(organizationId) || !organizationScopedLinks.has(label))
    .map(({ label, href }) => ({
      label,
      href: isValidOrganizationId(organizationId) && label !== "Home" && label !== "Blogs"
        ? `${href}?organizationId=${encodeURIComponent(organizationId)}`
        : href,
    }));
}

export function isPublicNavigationLinkActive(pathname, href) {
  const path = href.split("?")[0];
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
}
