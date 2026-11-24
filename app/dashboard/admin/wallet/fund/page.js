import { redirect } from "next/navigation";

export default function AdminFundWalletRedirectPage() {
    redirect("/admin/fund-wallet?returnTo=/dashboard/admin/wallet");
}
