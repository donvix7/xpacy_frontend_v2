export default function SummaryCards({ cards = [], title = "Summary" }) {
    if (cards.length === 0) return null;

    const gridCols =
        cards.length <= 4 ? "lg:grid-cols-4" : cards.length === 6 ? "lg:grid-cols-3" : "lg:grid-cols-5";

    return (
        <div className="border-[1.5px] border-primary-200 p-6 rounded-lg flex flex-col gap-4">
            {title && (
                <h3 className="lg:text-md text-black text-base font-sans">{title}</h3>
            )}
            <div className={`grid grid-cols-2 md:grid-cols-3 ${gridCols} gap-4`}>
                {cards.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl border border-primary-200 p-6 duration-300 flex justify-between">
                        <div className="flex flex-col gap-2">
                            <p className="text-gray-600 text-sm capitalize">{item.title || item.label}</p>
                            <p className="text-2xl font-bold mt-1">{item.count ?? item.value}</p>
                        </div>
                        {item.icon && (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${item.color}`}>
                                {item.icon}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}