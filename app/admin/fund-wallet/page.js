import { cookies } from "next/headers";
import DataErrorNotice from "@/app/_components/DataErrorNotice";
import FundWalletForm from "@/app/_components/FundWalletForm";
import { getSettledErrorMessages } from "@/app/_lib/api-error";
import { getWallet } from "@/app/_lib/data-services";

export const metadata = {
    title: "Fund Wallet | Xpacy",
    description: "Deposit funds into your Xpacy wallet via bank transfer or Nomba checkout.",
};

export default async function FundWalletPage({ searchParams }) {
    const resolved = (await searchParams) || {};
    const rawReturnTo = resolved?.returnTo;
    const returnTo = Array.isArray(rawReturnTo) ? rawReturnTo[0] : rawReturnTo || "";

    const cookieStore = await cookies();
    const userRole = String(cookieStore.get("userRole")?.value || "")
        .toLowerCase()
        .replace(/[_-\s]+/g, "");

    const defaultWalletBase =
        userRole === "admin" || userRole === "superadmin"
            ? "/dashboard/admin/wallet"
            : userRole === "propertyowner" || userRole === "owner"
              ? "/dashboard/property-owner/wallet"
              : "/dashboard/user/wallet";

    const backHref =
        returnTo.startsWith("/") && !returnTo.startsWith("//")
            ? returnTo
            : defaultWalletBase;
    const settingsHref = `${defaultWalletBase}/settings`;

    const results = await Promise.allSettled([getWallet()]);
    const dataErrorMessages = getSettledErrorMessages(results);

    const walletRaw =
        results[0].status === "fulfilled" ? results[0].value : null;

    const wallet =
        walletRaw?.wallet ??
        walletRaw?.data?.wallet ??
        walletRaw?.data ??
        walletRaw ??
        {};

    const virtualAccount = wallet?.virtualAccount || null;
    const vaNumber =
        virtualAccount?.bankAccountNumber ||
        virtualAccount?.accountNumber ||
        virtualAccount?.account_number ||
        null;
    const vaName =
        virtualAccount?.bankAccountName ||
        virtualAccount?.accountName ||
        virtualAccount?.account_name ||
        "";
    const vaBank =
        virtualAccount?.bankName ||
        virtualAccount?.bank_name ||
        "";
    const currency = wallet?.currency || virtualAccount?.currency || "NGN";
    const balance = Number(wallet?.balance ?? 0);

    return (
        <>
            {dataErrorMessages.length > 0 ? (
                <div className="mx-auto max-w-3xl px-4 pt-4">
                    <DataErrorNotice messages={dataErrorMessages} />
                </div>
            ) : null}
            <FundWalletForm
                currency={currency}
                balance={balance}
                vaNumber={vaNumber}
                vaName={vaName}
                vaBank={vaBank}
                backHref={backHref}
                settingsHref={settingsHref}
            />
        </>
    );
}

