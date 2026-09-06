"use client"
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FaBed, FaKitchenSet, FaTv, FaBroom, FaClipboardCheck, FaTriangleExclamation, FaXmark, FaCircleCheck } from "react-icons/fa6";



const CONDITIONS = ["New", "Good", "Needs Repair", "Missing"];

const conditionStyle = {
    "New": "bg-[#C3E5C4] text-[#357B38]",
    "Good": "bg-[#DBEAFE] text-[#1D4ED8]",
    "Needs Repair": "bg-[#FEF9C3] text-[#A16207]",
    "Missing": "bg-[#FBC0BC] text-[#C4170B]",
};

const storageKey = (propertyId) => `xpacy-inventory-${propertyId}`;

export default function PropertyManagerInventory({ properties = [] }) {
    // Defined inside the component to prevent hydration mismatches from
    // module-scope JSX instantiation (React icon SVGs differ between SSR & client).
    const INVENTORY_CATEGORIES = [
        { id: "bedroom", label: "Bedroom", icon: <FaBed className="w-5 h-5 text-primary-700" />, color: "bg-primary-100", items: ["Bed", "Mattress", "Sheets", "Pillows"] },
        { id: "kitchen", label: "Kitchen", icon: <FaKitchenSet className="w-5 h-5 text-blue-700" />, color: "bg-blue-100", items: ["Plates", "Cups", "Microwave", "Kettle", "Blender"] },
        { id: "electronics", label: "Electronics", icon: <FaTv className="w-5 h-5 text-amber-700" />, color: "bg-amber-100", items: ["TV", "AC", "DSTV Decoder", "WiFi Router"] },
        { id: "cleaning", label: "Cleaning", icon: <FaBroom className="w-5 h-5 text-green-700" />, color: "bg-green-100", items: ["Mop", "Bucket", "Vacuum"] },
    ];

    const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || properties[0]?._id || "");
    const [inventory, setInventory] = useState({});

    const allItems = useMemo(
        () => INVENTORY_CATEGORIES.flatMap(category => category.items.map(item => ({ category: category.label, item }))),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );


    useEffect(() => {
        if (!selectedPropertyId) return;
        try {
            const stored = localStorage.getItem(storageKey(selectedPropertyId));
            setInventory(stored ? JSON.parse(stored) : {});
        } catch (error) {
            console.error("Error loading inventory:", error);
            setInventory({});
        }
    }, [selectedPropertyId]);

    useEffect(() => {
        if (!selectedPropertyId || Object.keys(inventory).length === 0) return;
        localStorage.setItem(storageKey(selectedPropertyId), JSON.stringify(inventory));
    }, [inventory, selectedPropertyId]);

    const setCondition = (item, condition) => {
        setInventory(prev => ({ ...prev, [item]: condition }));
    };

    const resetInventory = () => {
        setInventory({});
        toast.success("Inventory reset for this property.");
    };

    const counts = useMemo(() => {
        const result = { "New": 0, "Good": 0, "Needs Repair": 0, "Missing": 0, tracked: 0 };
        allItems.forEach(({ item }) => {
            const condition = inventory[item];
            if (condition && CONDITIONS.includes(condition)) {
                result[condition] += 1;
                result.tracked += 1;
            }
        });
        return result;
    }, [inventory, allItems]);

    const summaryItems = [
        { label: "Inventory Items", value: allItems.length, color: "bg-primary-100", icon: <FaClipboardCheck className="w-5 h-5 text-primary-700" /> },
        { label: "In Good Condition", value: counts["Good"], color: "bg-blue-100", icon: <FaCircleCheck className="w-5 h-5 text-blue-700" /> },
        { label: "Needs Repair", value: counts["Needs Repair"], color: "bg-amber-100", icon: <FaTriangleExclamation className="w-5 h-5 text-amber-700" /> },
        { label: "Missing", value: counts["Missing"], color: "bg-red-100", icon: <FaXmark className="w-5 h-5 text-red-700" /> },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Property selector */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-2 font-mono flex-1 min-w-[220px]">
                    <label className="text-sm text-gray-700">Select property to track inventory</label>
                    <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-lg bg-[#FCFEFF]"
                    >
                        {properties.length === 0 && <option value="">No properties available</option>}
                        {properties.map(property => (
                            <option key={property.id || property._id} value={property.id || property._id}>
                                {property.property_name || "Untitled property"}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedPropertyId && allItems.length > 0 && (
                    <button
                        type="button"
                        onClick={resetInventory}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white font-mono text-sm text-gray-700 hover:bg-gray-50 transition-colors self-end"
                    >
                        Reset Inventory
                    </button>
                )}
            </div>

            {/* Condition summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryItems.map(item => (
                    <div key={item.label} className={`p-4 rounded-lg flex items-center gap-3 ${item.color}`}>
                        {item.icon}
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900 font-mono">{item.value}</span>
                            <span className="text-xs uppercase tracking-wider text-gray-600 font-mono">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inventory categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {INVENTORY_CATEGORIES.map(category => (
                    <div key={category.id} className="border-[1.5px] border-primary-200 rounded-lg overflow-hidden">
                        <div className={`px-4 py-3 flex items-center gap-3 ${category.color}`}>
                            {category.icon}
                            <h3 className="font-bold text-gray-900 font-sans">{category.label} Inventory</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {category.items.map(item => {
                                const condition = inventory[item] || "";
                                return (
                                    <div key={item} className="px-4 py-3 flex items-center justify-between gap-4">
                                        <span className="text-sm font-mono text-gray-700">{item}</span>
                                        <select
                                            value={condition}
                                            onChange={(e) => setCondition(item, e.target.value)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-bold font-mono border border-gray-200 focus:outline-none ${condition ? conditionStyle[condition] : "bg-gray-50 text-gray-500"}`}
                                        >
                                            <option value="">Select condition</option>
                                            {CONDITIONS.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}