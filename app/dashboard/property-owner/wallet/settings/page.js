import WalletSettingsView from "@/app/_components/WalletSettingsView";

export default function WalletSettingsPage() {
    return (
        <WalletSettingsView
            backHref="/dashboard/property-owner/wallet"
            fundHref="/admin/fund-wallet?returnTo=/dashboard/property-owner/wallet"
        />
    );
}
