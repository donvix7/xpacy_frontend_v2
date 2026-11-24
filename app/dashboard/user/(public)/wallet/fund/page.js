import { redirect } from "next/navigation";

export default function UserFundWalletRedirectPage() {
    redirect("/admin/fund-wallet?returnTo=/dashboard/user/wallet");
}
