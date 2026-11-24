import WalletSettingsView from "@/app/_components/WalletSettingsView";

export default function WalletSettingsPage() {
    return (
        <WalletSettingsView
            backHref="/dashboard/user/wallet"
            fundHref="/admin/fund-wallet?returnTo=/dashboard/user/wallet"
        />
    );
}
