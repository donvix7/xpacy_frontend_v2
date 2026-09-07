"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation({children}) {
  const pathname = usePathname();
  return (
    <>
      <nav>
        <ul className="hidden lg:flex lg:space-x-6 ">
          <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md ${pathname === '/' && 'border-b-2 border-primary'}`}>
            <Link href={"/"}>Home</Link>
          </li>
          <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md ${pathname === '/shortlet' && 'border-b-2 border-primary'}`}>
            <Link href={"/shortlet"}>Shortlet</Link>
          </li>
          <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md ${pathname === '/rent' && 'border-b-2 border-primary'}`}>
            <Link href={"/rent"}>Rent</Link>
          </li>
          <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md ${pathname === '/buy' && 'border-b-2 border-primary'}`}>
            <Link href={"/buy"}>Buy</Link>
          </li>
           <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md ${pathname === '/blogs' && 'border-b-2 border-primary'}`}>
            <Link href={"/blogs"}>Blogs</Link>
          </li>
          <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md ${pathname === '/management' && 'border-b-2 border-primary'}`}>
            <Link href={"/management"}>Management</Link>
          </li>
          <li className={`p-2.5 hover:border-b-2 hover:border-primary text-md ${pathname === '/contact' && 'border-b-2 border-primary'}`}>
            <Link href={"/contact"}>Contact </Link>
          </li>
        </ul>
      </nav>
      {children}
    </>
  );
}
