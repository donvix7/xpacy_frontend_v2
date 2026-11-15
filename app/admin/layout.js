export default function AdminLayout({ children }) {
    return (
        <div className="xp-surface min-h-screen bg-canvas text-ink flex flex-col">
            {children}
        </div>
    );
}

