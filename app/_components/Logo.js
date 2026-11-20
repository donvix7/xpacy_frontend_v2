import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      {/* Light theme: high-resolution dark logo */}
      <Image
        src="/logo.png"
        width={140}
        height={32}
        alt="Xpacy Logo"
        priority
        className="logo-light-theme h-7 sm:h-8 w-auto object-contain"
      />
      {/* Dark theme: clean white logo */}
      <Image
        src="/logo-1.png"
        width={140}
        height={32}
        alt="Xpacy Logo"
        priority
        className="logo-dark-theme h-7 sm:h-8 w-auto object-contain"
      />
    </Link>
  );
}
