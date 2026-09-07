"use client"
import { useState } from "react";
import CustomCheckbox from "./CustomCheckbox";
import { FaChevronDown } from "react-icons/fa";

export default function ExportOptionsMenu({ options, onExport, onClose }) {
    const [selectedOptions, setSelectedOptions] = useState(
        options.reduce((acc, opt) => ({ ...acc, [opt.id]: false }), {})
    );
    const [formats, setFormats] = useState(
        options.reduce((acc, opt) => ({ ...acc, [opt.id]: "Excel" }), {})
    );

    const handleCheckboxChange = (id) => {
        setSelectedOptions(prev => ({ ...prev, [id]: !prev[id] }));
    }

    const handleFormatChange = (id, format) => {
        setFormats(prev => ({ ...prev, [id]: format }));
    }

    const handleExportClick = () => {
        const selected = options.filter(opt => selectedOptions[opt.id]);
        if (selected.length === 0) {
            console.warn("No options selected for export");
            return;
        }
        
        const selectedWithFormats = selected.map(opt => ({
            ...opt,
            format: formats[opt.id]
        }));

        onExport(selectedWithFormats);
        if (onClose) onClose();
    }

    return (
        <div className="flex flex-col gap-6 p-4 w-[280px] bg-white shadow-2xl rounded-lg border border-gray-100 overflow-hidden">
            <h3 className="font-bold text-lg font-mono">Export Options</h3>
            <div className="flex flex-col gap-4">
                {options.map((option) => (
                    <div key={option.id} className="space-y-2">
                        <CustomCheckbox 
                            id={`export-opt-${option.id}`}
                            label={option.label}
                            checked={selectedOptions[option.id]}
                            handleChange={() => handleCheckboxChange(option.id)}
                        />
                        <div className="">
                            <select 
                                value={formats[option.id]}
                                onChange={(e) => handleFormatChange(option.id, e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-md py-3 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            >
                                <option value="Excel">Excel (.xlsx)</option>
                                <option value="CSV">CSV (.csv)</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
                <button 
                    onClick={onClose}
                    className="py-3 rounded-lg font-mono font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleExportClick}
                    disabled={!Object.values(selectedOptions).some(Boolean)}
                    className="bg-primary text-white py-3 rounded-lg font-mono font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}
