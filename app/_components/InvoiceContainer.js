"use client"
import Invoice from "@/app/_components/Invoice";
import InvoiceBtn from "@/app/_components/InvoiceBtns";
import { useRef } from "react";
import { toPng } from "html-to-image";
import MobileInvoice from "./MobileInvoice";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

export default function InvoiceContainer({ invoice, token, users = [] }) {
    //     const {toPDF, toIMG, targetRef} = usePDF({
    //     filename: `Invoice_${invoice?.invoiceNumber || "invoice"}`,
    //     page: { margin: Margin.MEDIUM, orientation: 'portrait',},
    //   })
    const targetRef = useRef(null)
    const downloadPng = async () => {
        if (!targetRef.current) return null;
        try {
            const dataUrl = await toPng(targetRef.current, { cacheBust: true });
            // Convert DataURL → Blob
            const res = await fetch(dataUrl);
            const blob = await res.blob();

            // Save file
            saveAs(blob, `Invoice_${invoice?.invoiceNumber || "invoice"}.png`);
        } catch (error) {
            toast.error("image download failed")
        }
    }
    return (
        <>
            <Invoice invoice={invoice} ref={targetRef} users={users} />
            <MobileInvoice invoice={invoice} ref={targetRef} users={users} />
            <InvoiceBtn token={token} onDownload={downloadPng} />
        </>
    )
}

