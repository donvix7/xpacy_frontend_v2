"use client";

import Link from "next/link";
import Modal from "./Modal";
import OptionsMenu from "./OptionsMenu";

export default function TableItemOptionsMenu({ actions, menuId = "list" }) {
  return (
    <OptionsMenu id={menuId}>
      {actions.map((action, i) => {
        const content = (
          <div className={`flex items-center px-3.5 py-2.5 gap-3 rounded-lg hover:bg-soft text-ink transition-colors ${i !== actions.length - 1 ? "border-b border-line/60" : ""}`}>
            {action.icon && <span className="text-base text-mute">{action.icon}</span>}
            <span className="text-[13px] font-medium text-ink">{action.label}</span>
          </div>
        );

        // Modal action
        if (action.modal) {
          return (
            <Modal key={i}>
              <Modal.Open>{content}</Modal.Open>
              <Modal.Window>{action.modal}</Modal.Window>
            </Modal>
          );
        }

        // Link action
        if (action.href) {
          return (
            <Link key={i} href={action.href} className="w-full text-left">
              {content}
            </Link>
          );
        }

        // Button action
        return (
          <button key={i} onClick={action.onClick} className="w-full text-left">
            {content}
          </button>
        );
      })}
    </OptionsMenu>
  );
}
