"use client"
import { useTransition } from "react";
import toast from "react-hot-toast";
import { RiDownloadLine } from "react-icons/ri";
import Modal from "./Modal";
import PaymentOptionList from "./PaymentOptionList";

export default function InvoiceBtn({ onDownload }) {
    const [isPending, startTransition] = useTransition();
    const handleClick = () => {
        startTransition(() => {
            onDownload();
            toast.success("Invoice is downloading...")
        })
    }

    return (
        <div className="mt-14 flex lg: justify-centeritems-center flex-col lg:flex-row gap-8 lg:gap-0 justify-between">
            <button onClick={handleClick} disabled={isPending} className="px-3.5 py-3 font-mono cursor-pointer font-bold flex items-center justify-center gap-2 text-primary border border-primary rounded-lg bg-white disabled:bg-gray-200 disabled:cursor-not-allowed">
                <span className="text-2xl"><RiDownloadLine /></span>
                <span>Download Invoice</span>
            </button>
            <Modal>
                <Modal.Open name="pay-now">
                    <button className="px-3.5 py-3 font-mono cursor-pointer font-bold flex items-center justify-center text-white rounded-lg bg-primary">
                        Pay Now
                    </button>
                </Modal.Open>
                <Modal.Window name="pay-now">
                    <PaymentOptionList/>
                </Modal.Window>
            </Modal>
        </div>
    )
}