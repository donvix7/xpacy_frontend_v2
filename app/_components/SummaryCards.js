import SummaryItemCard from "./SummaryItemCard";

export default function SummaryCards({ cards = [], title = "Summary" }) {
    if (cards.length === 0) return null;

    const gridCols =
        cards.length <= 4 ? "lg:grid-cols-4" : cards.length === 6 ? "lg:grid-cols-3" : "lg:grid-cols-5";

    return (
        <div className="border-[1.5px] border-primary-200 p-4 sm:p-6 rounded-xl flex flex-col gap-4">
            {title && (
                <h3 className="lg:text-md text-black text-base font-sans">{title}</h3>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols} gap-3 sm:gap-4`}>
                {cards.map((item, index) => (
                    <SummaryItemCard
                        key={index}
                        label={item.title || item.label}
                        value={item.count ?? item.value}
                        icon={item.icon}
                        iconBackground={item.bgColor || item.color}
                    />
                ))}
            </div>
        </div>
    );
}
