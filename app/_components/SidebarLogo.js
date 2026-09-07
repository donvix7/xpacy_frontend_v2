"use client"
import Image from "next/image";
import Link from "next/link";
import { IoClose } from "react-icons/io5";
export default function SidebarLogo({ onClose }) {
  return (
    <Link href="/">
      <Image src={"/logo-1.png"} width={"156"} height={"32"} alt={"Xpacy Logo"} />
    </Link>
  );
}
