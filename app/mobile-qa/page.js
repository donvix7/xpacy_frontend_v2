export const metadata = { title: "Mobile QA" };

const FRAME_HEIGHTS = 2600;

export default function MobileQaPage() {
    return (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 16, background: "#ddd" }}>
            {[360, 390, 430].map((width) => (
                <div key={width} style={{ width, flex: "0 0 auto" }}>
                    <p style={{ font: "12px monospace", marginBottom: 4 }}>{width}px</p>
                    <iframe
                        title={`frame-${width}`}
                        data-width={width}
                        src="/"
                        style={{ width, height: FRAME_HEIGHTS, border: "1px solid #999", background: "#fff" }}
                    />
                </div>
            ))}
        </div>
    );
}
