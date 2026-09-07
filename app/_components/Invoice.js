"use client"
import Image from "next/image"
import { FaFacebook, FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6"
import { format } from "date-fns"
import { formatCurrency } from "../_lib/utils"
import { useEffect } from "react"

export default function Invoice({
  invoice,
  mode = "view",
  onChange,
  className = "hidden lg:flex",
  users = [],
  ref
}) {

  const isEdit = mode === "edit"
  const rawRecipient = invoice?.recipientID || invoice?.recipientId || invoice?.reciepientID || invoice?.recipient;
  const recipientIdStr = typeof rawRecipient === 'object' && rawRecipient !== null ? String(rawRecipient._id || rawRecipient.id) : String(rawRecipient);
  
  let sysUser = users?.find(u => String(u._id || u.id) === recipientIdStr);
  let recipient = (isEdit && invoice?.user) ? invoice.user : (sysUser || invoice?.user);
  if (!recipient && typeof rawRecipient === 'object' && rawRecipient !== null) {
      recipient = rawRecipient;
  }

  const update = (path, value) => {
    onChange?.(path, value)
  }

  const itemsStr = JSON.stringify(invoice?.items || [])

  // Calculate derived values directly during render
  const itemsList = invoice?.items || []
  const calculatedSubTotal = itemsList.reduce(
    (sum, i) => sum + Number(i?.unitPrice || 0) * Number(i?.quantity || 0),
    0
  );
  
  const taxRate = Number(invoice?.tax || 0); 
  const calculatedTaxAmount = calculatedSubTotal * (taxRate / 100);
  const calculatedTotal = calculatedSubTotal + calculatedTaxAmount;

  // Fire onChange to update parent state if they diverge
  useEffect(() => {
    if (invoice?.subTotal !== calculatedSubTotal) onChange?.("subTotal", calculatedSubTotal);
    if (invoice?.total !== calculatedTotal) onChange?.("total", calculatedTotal);
  }, [itemsStr, invoice?.tax, calculatedSubTotal, calculatedTotal, invoice?.subTotal, invoice?.total, onChange]);

  return (
    <div ref={ref} className={`${className} flex-col gap-8 lg:gap-16 p-4 lg:p-6 rounded-lg border-2 border-primary-200 bg-white`}>
      {/* Header */}
      <header className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-0">
        <div className="w-[180px] h-[123px] relative">
          <Image src="/invoice-logo.png" alt="logo" fill className="object-cover" />
        </div>

        <div className="flex flex-col gap-8">
          <h1 className="text-[64px] text-primary font-bold">INVOICE</h1>
          <div className="flex flex-col items-end gap-6 font-mono">
            <Field label="Invoice Number" value={invoice?.invoiceNumber || invoice?.invoice_number || ""} />
            <Field label="Issued Date" value={invoice?.issuedDate || new Date()} type="date" isEdit={isEdit} onChange={v => update("issuedDate", v)} />
            <Field label="Due Date" value={invoice?.dueDate || new Date()} type="date" isEdit={isEdit} onChange={v => update("dueDate", v)} />
              
          </div>
        </div>
      </header>

      {/* Recipient */}
      <section className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 lg:gap-0">
        <div className="flex flex-col gap-6">
          <h2 className="text-primary">Recipient&apos;s Details</h2>
          <div className="space-y-2 font-mono">
            <EditableText value={recipient?.firstname || recipient?.first_name || ""} isEdit={isEdit} onChange={v => update("user.firstname", v)} placeholder={"Enter Recipent's first name"} />
            <EditableText value={recipient?.lastname || recipient?.last_name || ""} isEdit={isEdit} onChange={v => update("user.lastname", v)} placeholder={"Enter Recipent's last name"} />
            <EditableText value={recipient?.address || ""} isEdit={isEdit} onChange={v => update("user.address", v)} placeholder={"Enter Recipent's address"} />
            <EditableText value={recipient?.email || ""} isEdit={isEdit} onChange={v => update("user.email", v)} placeholder={"Enter Recipent's email"} />
            <EditableText value={recipient?.phone || recipient?.phone_number || ""} isEdit={isEdit} onChange={v => update("user.phone", v)} placeholder={"Enter Recipent's phone number"} />
          </div>
        </div>
        {(() => {
          const status = invoice?.status || "Pending";
          const statusLower = status.toLowerCase();
          let statusColor = "bg-error";
          if (['paid', 'completed', 'active', 'confirmed', 'success', 'successful'].includes(statusLower)) statusColor = "bg-green-500";
          else if (['pending', 'processing'].includes(statusLower)) statusColor = "bg-yellow-500";
          
          return (
            <span className={`${statusColor} w-max text-secondary-100 px-4 py-2 rounded-full text-2xl font-bold font-mono`}>
              {status}
            </span>
          )
        })()}
      </section>

      {/* Items */}
      <section className="py-6 overflow-x-auto">
        <table className="w-full font-mono border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4 font-bold w-[45%]">Description</th>
              <th className="p-4 font-bold text-right w-[15%]">Price</th>
              <th className="p-4 font-bold text-right w-[15%]">Qty</th>
              <th className="p-4 font-bold text-right w-[25%]">Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice?.items || []).map((item, i) => (
              <tr key={i} className="border-b">
                <td className="p-4 align-top text-left">
                  <Cell value={item?.description || ""} isEdit={isEdit} onChange={v => update(`items.${i}.description`, v)} align="left" />
                </td>
                <td className="p-4 align-top text-right">
                  <Cell value={item?.unitPrice || 0} isEdit={isEdit} onChange={v => update(`items.${i}.unitPrice`, Number(v))} type="number" />
                </td>
                <td className="p-4 align-top text-right">
                  <Cell value={item?.quantity || 1} isEdit={isEdit} onChange={v => update(`items.${i}.quantity`, Number(v))} type="number" />
                </td>
                <td className="p-4 align-middle text-right font-bold">
                  {formatCurrency((item?.unitPrice || 0) * (item?.quantity || 1))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-bold">
            <tr className="border-b">
              <td colSpan={3} className="p-4 text-left">Sub-total</td>
              <td className="p-4 text-right">{formatCurrency(calculatedSubTotal || 0)}</td>
            </tr>
            <tr className="border-b">
              <td colSpan={3} className="p-4 text-left">Tax (%)</td>
              <td className="p-4 text-right flex items-center justify-end gap-2">
                {isEdit ? (
                  <>
                    <input
                      type="number"
                      value={invoice?.tax ?? ""}
                      // Use update function instead of setTax
                      onChange={(e) => update("tax", Number(e.target.value))}
                      className="w-[80px] border py-1.5 px-3 rounded-lg border-primary-100 outline-none text-right font-mono"
                    />
                    <span>%</span>
                  </>
                ) : (
                  <span>{invoice?.tax}%</span>
                )}
              </td>
            </tr>
            <tr className="border-b bg-primary-200">
              <td colSpan={3} className="p-4 text-left">TOTAL</td>
              <td className="p-4 text-right">{formatCurrency(calculatedTotal || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {/* Footer */}
      <section className="flex flex-col-reverse lg:flex-row justify-between gap-8 lg:gap-0 items-center lg:items-start">
        <div className="flex flex-col gap-6 font-mono text-center lg:text-left items-center lg:items-start">
          <p><b>Address:</b> No. 1 Joe Akonobi Street</p>
          <p><b>Email:</b> info@xpacy.com</p>
          <p><b>Phone:</b> 09068557780</p>
          <div className="flex space-x-6 text-2xl">
            <FaFacebook />
            <FaXTwitter />
            <FaInstagram />
            <FaTiktok />
          </div>
        </div>
        <div className="w-[217px] h-[217px] relative">
          <Image src="/invoice-stamp.png" alt="stamp" fill />
        </div>
      </section>
    </div>
  )
}

/* ---------- Primitives ---------- */

const Field = ({ label, value, isEdit, onChange, type="text" }) => {
  const displayValue = () => {
    if (type === "date") {
      if (!value) return "N/A"
      try {
        return format(new Date(value), "dd/MM/yy")
      } catch (e) {
        return "Invalid Date"
      }
    }
    return value || ""
  }

  const inputValue = () => {
    if (type === "date") {
      if (!value) return ""
      try {
        return new Date(value).toISOString().slice(0, 10)
      } catch (e) {
        return ""
      }
    }
    return value || ""
  }

  return (
    <p>
      {label}:{" "}
      {isEdit ? (
        <input
          type={type}
          value={inputValue()}
          onChange={e => onChange(type === "date" ? new Date(e.target.value) : e.target.value)}
          className="border border-primary-700 px-3 py-2 rounded-lg outline-none"
        />
      ) : (
        <span>{displayValue()}</span>
      )}
    </p>
  )
}

const EditableText = ({ value, isEdit, onChange, placeholder }) =>
  isEdit ? (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="border-b border-primary-200 outline-none w-full" />
  ) : (
    <p>{value}</p>
  )

const Cell = ({ value, isEdit, onChange, type="text", align="right" }) => (
  <>
    {isEdit ? (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full border py-2 px-3 rounded-lg border-primary-100 outline-none text-${align}`}
      />
    ) : (
      <p className={`text-${align}`}>{value}</p>
    )}
  </>
)