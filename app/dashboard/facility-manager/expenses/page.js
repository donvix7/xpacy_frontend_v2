import { cookies } from "next/headers";
import ExpensesListView from "@/app/_components/ExpensesListView";
import { getAllExpenses } from "@/app/_lib/data-services";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

export const metadata = {
    title: "Expenses | Xpacy",
    description: "Track and manage property and organization expenses.",
};

export default async function PropertyOwnerExpensesPage() {
    const cookieStore = await cookies();
    const organizationId =
        cookieStore.get("organizationId")?.value ||
        cookieStore.get("organization_id")?.value ||
        "";

    const results = await Promise.allSettled([getAllExpenses(organizationId)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const expenses =
        results[0].status === "fulfilled" && Array.isArray(results[0].value)
            ? results[0].value
            : [];

    return (
        <ExpensesListView
            expenses={expenses}
            basePath="/dashboard/facility-manager"
            dataErrorMessages={dataErrorMessages}
        />
    );
}
