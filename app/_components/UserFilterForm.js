

export default function UserFilterForm({ onClose }) {

    return (
        <form className="flex flex-col gap-6 p-6 w-[290px] rounded-lg  shadow-lg font-mono">
            <span className="text-neutrals-900 " >Filter by:</span>
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold">Payment status</label>
                <select className="p-2.5 border border-neutral-200 rounded-lg">
                    <option>Select Status</option>
                </select>
            </div>
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold">Price Range</label>
                <select className="p-2.5 border border-neutral-200 rounded-lg">
                    <option>Select price range</option>
                </select>
            </div>
            <div className="flex items-center justify-center gap-4">
                <button type={"reset"} onClick={onClose} className="px-3.5 py-2 flex items-center justify-center rounded-lg border border-primary bg-white font-bold">
                    Cancel
                </button>
                <button type={"submit"} className="px-3.5 py-2 flex items-center justify-center rounded-lg  bg-primary text-white font-bold">
                    Filter
                </button>
            </div>
        </form>
    )
}