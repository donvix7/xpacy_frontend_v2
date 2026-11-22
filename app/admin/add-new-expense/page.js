import { Suspense } from "react";
import { cookies } from "next/headers";
import ExpenseForm from "@/app/_components/ExpenseForm";
import {
    getAllExpenses,
    getExpenseById,
    getManagedProperties,
    getMyProperties,
} from "@/app/_lib/data-services";

export async function generateMetadata({ searchParams }) {
    const resolved = (await searchParams) || {};
    const isEdit = Boolean(resolved?.expenseId || resolved?.id || resolved?.edit);
    return {
        title: isEdit ? "Edit Expense | Xpacy" : "Create Expense | Xpacy",
        description: isEdit
            ? "Update an existing expense record."
            : "Record a new property or organization expense.",
    };
}

export default async function AddNewExpensePage({ searchParams }) {
    const resolved = (await searchParams) || {};
    const cookieStore = await cookies();

    const rawExpenseId = resolved?.expenseId || resolved?.id || resolved?.edit;
    const expenseId = Array.isArray(rawExpenseId)
        ? rawExpenseId[0]
        : rawExpenseId || "";
    const cleanExpenseId =
        typeof expenseId === "string" && expenseId.trim()
            ? expenseId.trim()
            : null;

    const rawPropertyId = resolved?.propertyId;
    const propertyId = Array.isArray(rawPropertyId)
        ? rawPropertyId[0]
        : rawPropertyId || "";

    const rawReturnTo = resolved?.returnTo;
    const returnTo = Array.isArray(rawReturnTo)
        ? rawReturnTo[0]
        : rawReturnTo || "";

    const organizationId =
        cookieStore.get("organizationId")?.value ||
        cookieStore.get("organization_id")?.value ||
        "";

    const [expenseRes, ownedRes, managedRes] = await Promise.allSettled([
        cleanExpenseId ? getExpenseById(cleanExpenseId) : Promise.resolve(null),
        getMyProperties().catch(() => []),
        getManagedProperties().catch(() => []),
    ]);

    let initialData =
        expenseRes.status === "fulfilled" ? expenseRes.value : null;

    if (!initialData && cleanExpenseId) {
        try {
            const all = await getAllExpenses(organizationId);
            if (Array.isArray(all)) {
                initialData =
                    all.find(
                        (e) => String(e.id || e._id) === String(cleanExpenseId)
                    ) || null;
            }
        } catch {
            initialData = null;
        }
    }

    const unwrap = (r) =>
        r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [];
    const seen = new Set();
    const properties = [...unwrap(ownedRes), ...unwrap(managedRes)].filter(
        (p) => {
            const key = p?.id || p?._id;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        }
    );

    return (
        <Suspense fallback={null}>
            <ExpenseForm
                expenseId={cleanExpenseId}
                initialData={initialData}
                isEditMode={Boolean(cleanExpenseId)}
                properties={properties}
                defaultPropertyId={
                    typeof propertyId === "string" ? propertyId.trim() : ""
                }
                organizationId={organizationId}
                defaultReturnTo={returnTo}
            />
        </Suspense>
    );
}

