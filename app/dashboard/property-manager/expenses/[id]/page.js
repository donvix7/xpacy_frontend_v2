import { cookies } from "next/headers";
import ExpenseDetailsView from "@/app/_components/ExpenseDetailsView";
import { getAllExpenses, getExpenseById } from "@/app/_lib/data-services";
import { getSettledErrorMessages } from "@/app/_lib/api-error";

async function fetchExpense(id, organizationId) {
    try {
        const exp = await getExpenseById(id);
        if (exp && typeof exp === "object" && (exp.id || exp._id)) {
            return exp;
        }
    } catch {
        // fallback below
    }
    const all = await getAllExpenses(organizationId);
    if (Array.isArray(all)) {
        return all.find((e) => String(e.id || e._id) === String(id)) || null;
    }
    return null;
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const exp = await fetchExpense(id);
        return {
            title: exp?.vendor
                ? `${exp.vendor} | Expenses`
                : "Expense Details | Xpacy",
        };
    } catch {
        return { title: "Expense Details | Xpacy" };
    }
}

export default async function PropertyManagerExpenseDetailsPage({ params }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const organizationId =
        cookieStore.get("organizationId")?.value ||
        cookieStore.get("organization_id")?.value ||
        "";

    const results = await Promise.allSettled([fetchExpense(id, organizationId)]);
    const dataErrorMessages = getSettledErrorMessages(results);
    const expense = results[0].status === "fulfilled" ? results[0].value : null;

    return (
        <ExpenseDetailsView
            expense={expense}
            basePath="/dashboard/property-manager"
            dataErrorMessages={dataErrorMessages}
        />
    );
}

