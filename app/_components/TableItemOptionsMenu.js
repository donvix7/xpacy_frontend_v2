"use client"
import Link from "next/link"
import Modal from "./Modal"
import OptionsMenu from "./OptionsMenu"

export default function TableItemOptionsMenu({ actions, menuId = "list" }) {
  return (
    <OptionsMenu id={menuId}>
      {actions.map((action, i) => {
        const content = (
          <div className={`flex items-center px-4 py-4 gap-4 hover:bg-gray-50 transition-colors ${i !== actions.length - 1 ? "border-b border-gray-100" : ""}`}>
            {action.icon && <span className="text-xl">{action.icon}</span>}
            <span className="text-sm font-medium text-gray-600">{action.label}</span>
          </div>
        )

        // Modal action
        if (action.modal) {
          return (
            <Modal key={i}>
              <Modal.Open>{content}</Modal.Open>
              <Modal.Window>{action.modal}</Modal.Window>
            </Modal>
          )
        }

        // Link action
        if (action.href) {
          return (
            <Link key={i} href={action.href} className="w-full text-left">
              {content}
            </Link>
          )
        }

        // Button action
        return (
          <button key={i} onClick={action.onClick} className="w-full text-left">
            {content}
          </button>
        )
      })}
    </OptionsMenu>
  )
}