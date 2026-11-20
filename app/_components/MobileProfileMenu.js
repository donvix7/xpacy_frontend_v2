"use client";

import ProfileDisplay from "./ProfileDisplay";

export default function MobileProfileMenu({ profile, role = "user" }) {
    return <ProfileDisplay profile={profile} role={role} className="lg:hidden" />;
}
