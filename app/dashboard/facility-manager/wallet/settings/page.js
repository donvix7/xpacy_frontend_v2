import WalletSettingsView from "@/app/_components/WalletSettingsView";

export default function WalletSettingsPage() {
    return (
        <WalletSettingsView
            backHref="/dashboard/facility-manager/wallet"
            fundHref="/admin/fund-wallet?returnTo=/dashboard/facility-manager/wallet"
        />
    );
}
