import Link from "next/link";
import { IoCardOutline } from "react-icons/io5";


export default function PaymentItem({status, purpose, address}) {
    const statusBg = {
        "unpaid": " bg-[#FBC0BC] text-[#C4170B] ",
        "paid": " bg-[#C3E5C4] text-[#357B38] "
    }

    const keys = Object.keys(statusBg)

    return (
        <li className="grid grid-cols-[24px_1fr] gap-y-1 gap-x-5 font-mono p-4 border rounded-lg border-gray-300">
            <span className="text-2xl row-[1/-3] place-content-center"><IoCardOutline /></span>
            <div className="flex items-center justify-between">
                <span className="capitalize">{purpose}</span>
                <span className={`${keys.map((key) => key === status && statusBg[status])} px-1.5 py-1 rounded-full text-sm font-bold`}>{status}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-neutrals-900">{address}</span>
                {status === 'unpaid' && <Link href={"#"} className="text-sm text-primary underline font-bold">Pay Now</Link>}
            </div>
        </li>
    )
}