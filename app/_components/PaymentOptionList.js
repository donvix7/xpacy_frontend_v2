import { useParams } from "next/navigation";
import CustomCheckbox from "./CustomCheckbox";
import { useEffect, useState, useTransition } from "react";
import { processInvoice } from "../_lib/action";


export default function PaymentOptionList({ onClose }) {
    const [authorizedUrl, setAuthorizedUrl] = useState("")
    const [checked, setChecked] = useState(false);
    const [isPending, startTransition] = useTransition();
    const params = useParams();
    const handleChange = (e) => {
        setChecked(e.target.checked)
    }
    useEffect(() => {
        if (checked) {
            startTransition(async () => {
                const data = await processInvoice(params?.invoiceId);
                setAuthorizedUrl(data?.authorization_url)
            })
        }
    }, [checked]);

    const handleOpenPaystack = () => {
        if (!authorizedUrl) return
        window.open(authorizedUrl, "_blank", "noopener,noreferrer")
        onClose();
    }

    return (
        <div className="lg:p-10 p-6 flex flex-col gap-6 lg:w-[433px] w-[300px]">
            <h3 className="text-md py-2.5">Choose Payment Method </h3>
            <div className={` ${checked && "bg-gray-200"} p-4 rounded-lg border border-primary-100`}>
                <CustomCheckbox label={"Paystack"} handleChange={handleChange} checked={checked} labelSize={" text-md "} />
            </div>
            <button onClick={handleOpenPaystack} disabled={isPending || !authorizedUrl} className="flex items-center font-bold px-3 py-2.5 justify-center rounded-lg bg-primary text-white font-mono disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-black cursor-pointer">Continue</button>
        </div>
    )
}