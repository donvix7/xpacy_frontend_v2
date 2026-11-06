import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InviteManagerForm from "@/app/_components/InviteManagerForm";

export default async function Page() {
    const cookieStore = await cookies();
    if (cookieStore.get("organizationAdmin")?.value !== "1") {
        redirect("/dashboard/property-owner/bookings");
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <InviteManagerForm />
        </div>
    );
}
