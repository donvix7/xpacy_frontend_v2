import Link from "next/link";
import { getPublicNavigationLinks } from "@/app/_lib/public-navigation";

function propertyImage(property) {
  const image = property?.images?.[0] || property?.image || property?.coverImage;
  if (!image) return null;
  return /^https?:\/\//i.test(image)
    ? image
    : `https://app.xpacy.com/src/upload/properties/${image}`;
}

function propertyHref(property, organizationId) {
  const slug = property?.property_slug || property?.slug;
  const type = String(property?.property_status || property?.purpose || "property").toLowerCase();
  return slug
    ? `/${type}/${slug}?organizationId=${encodeURIComponent(organizationId)}`
    : `/listings?organizationId=${encodeURIComponent(organizationId)}`;
}

export default function OrganizationLandingPage({ organization, organizationId, properties = [] }) {
  const name = organization?.name || organization?.organizationName || "Our Organization";
  const location = [organization?.city, organization?.state, organization?.country].filter(Boolean).join(", ");
  const description = organization?.description || organization?.about || organization?.tagline ||
    `Explore properties and services from ${name}${location ? ` in ${location}` : ""}.`;
  const query = `organizationId=${encodeURIComponent(organizationId)}`;
  const links = getPublicNavigationLinks(organizationId).filter(({ label }) => label !== "Home" && label !== "Blogs");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href={`/?${query}`} className="text-xl font-bold tracking-tight text-primary">
            {name}
          </Link>
          <nav aria-label={`${name} navigation`} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-slate-700">
            {links.map(({ label, href }) => <Link key={label} href={href} className="hover:text-primary">{label}</Link>)}
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-slate-950">
        {properties[0] && propertyImage(properties[0]) && (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url("${propertyImage(properties[0])}")` }}
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-900/90 to-primary/60" />
        <div className="mx-auto grid min-h-[440px] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.3fr_0.7fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl text-white">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-secondary">{location || "Property and management services"}</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Welcome to {name}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/listings?${query}`} className="rounded-lg bg-secondary px-6 py-3 font-bold text-slate-950 transition hover:bg-secondary-500">Explore properties</Link>
              <Link href={`/contact?${query}`} className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10">Contact {name}</Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Your local property team</p>
            <h2 className="mt-3 text-2xl font-bold">Property options, managed by {name}</h2>
            <p className="mt-3 text-sm leading-6 text-white/80">Browse available homes, find a rental, or speak with the team about property management.</p>
            <p className="mt-5 border-t border-white/20 pt-4 text-sm text-white/80">
              {properties.length} {properties.length === 1 ? "property" : "properties"} currently available to explore
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">{name}</p>
            <h2 className="mt-2 text-3xl font-bold">Properties from our organization</h2>
            {location && <p className="mt-2 text-slate-600">Find your next property in {location}.</p>}
          </div>
          <Link href={`/listings?${query}`} className="font-semibold text-primary hover:underline">View all listings →</Link>
        </div>

        {properties.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map((property, index) => {
              const image = propertyImage(property);
              const title = property?.property_name || property?.name || property?.title || "Organization property";
              const address = [property?.city, property?.state].filter(Boolean).join(", ") || property?.address || "Location details available on request";
              return (
                <Link key={property.id || property._id || index} href={propertyHref(property, organizationId)} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-56 bg-slate-100">
                    {image ? <img src={image} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Image coming soon</div>}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">{String(property?.property_status || property?.purpose || "Property").replaceAll("_", " ")}</p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{address}</p>
                    {property?.property_price != null && <p className="mt-4 font-bold text-primary">{property.currency || "NGN"} {Number(property.property_price).toLocaleString()}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <h3 className="text-lg font-semibold">No properties are listed yet</h3>
            <p className="mt-2 text-sm text-slate-600">Contact {name} to ask about upcoming availability.</p>
            <Link href={`/contact?${query}`} className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-white">Contact the organization</Link>
          </div>
        )}
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">About {name}</p>
            <h2 className="mt-2 text-2xl font-bold">A team focused on your property needs</h2>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Get in touch with {name}</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              {organization?.email && <p>Email: <a className="font-semibold text-primary hover:underline" href={`mailto:${organization.email}`}>{organization.email}</a></p>}
              {organization?.phone && <p>Phone: <a className="font-semibold text-primary hover:underline" href={`tel:${organization.phone}`}>{organization.phone}</a></p>}
              {location && <p>Location: {location}</p>}
              {organization?.address && <p>Address: {organization.address}</p>}
            </div>
            <Link href={`/contact?${query}`} className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-white">Send an enquiry</Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-5 py-7 text-center text-sm text-white/75">
        © {new Date().getFullYear()} {name}. All rights reserved.
      </footer>
    </main>
  );
}
