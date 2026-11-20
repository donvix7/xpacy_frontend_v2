export default function AdminLayout({ children }) {
    return (
        <div className="xp-dashboard min-h-screen bg-canvas text-ink flex flex-col">
            {children}
        </div>
    );
}

