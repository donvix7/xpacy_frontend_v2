import SummaryItemCard from "./SummaryItemCard";

export default function SummaryCards({ cards = [], title = "Key metrics" }) {
    if (cards.length === 0) return null;

    const gridCols =
        cards.length <= 4 ? "lg:grid-cols-4" : cards.length === 6 ? "lg:grid-cols-3" : "lg:grid-cols-5";

    return (
        <section className="flex flex-col gap-4">
            {title && (
                <h2 className="text-lg font-semibold text-ink">{title}</h2>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols} gap-3 sm:gap-5`}>
                {cards.map((item, index) => (
                    <SummaryItemCard
                        key={index}
                        label={item.title || item.label}
                        value={item.count ?? item.value}
                        icon={item.icon}
                        iconBackground={item.bgColor || item.color}
                        meta={item.meta}
                        accent={item.accent}
                    />
                ))}
            </div>
        </section>
    );
}
