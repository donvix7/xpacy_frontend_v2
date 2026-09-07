"use client";

export default function ServiceTimeline({ timeline = [] }) {
    if (!timeline || timeline.length === 0) return null;

    return (
        <div className="flex flex-col gap-6 font-mono">
            <h3 className="text-xl font-bold text-primary-900 mb-2">History Timeline</h3>
            <div className="flex flex-col relative">
                {/* Vertical Line */}
                <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-gray-200"></div>

                <div className="flex flex-col gap-8">
                    {timeline.map((item, index) => (
                        <div key={index} className="flex items-start gap-6 relative">
                            {/* Dot */}
                            <div className={`z-10 w-3 h-3 rounded-full mt-1.5 ${item.completed ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            
                            <div className="flex flex-col">
                                <p className="text-sm text-gray-800">
                                    <span className="font-bold">{item.date}</span>: {item.event}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
