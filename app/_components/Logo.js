import Image from "next/image";
import Link from "next/link";
export default function Logo() {
  return (
    <Link href="/">
      <Image src={"/logo.png"} width={"156"} height={"32"} alt={"Xpacy Logo"} />
    </Link>
  );
}
