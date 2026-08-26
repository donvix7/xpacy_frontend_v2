export default function SummaryCards({ cards = [] }) {
    if (cards.length === 0) return null;

    const gridCols = cards.length <= 4
        ? "lg:grid-cols-4"
        : cards.length === 5
            ? "lg:grid-cols-5"
            : cards.length === 8
                ? "lg:grid-cols-4"
                : "lg:grid-cols-3";

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4`}>
            {cards.map((card, i) => (
                <div key={i} className="bg-white rounded-xl border border-primary-200 p-6 flex justify-between ">
                    <div className="flex flex-col justify-between">
                        <p className="text-gray-600 text-sm capitalize">{card.label}</p>
                        <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                    {card.icon && (
                        <div className={`min-w-12 h-12 rounded-full flex items-center justify-center ${card.textColor} ${card.color || "bg-primary-700"}`}>
                            {card.icon}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
