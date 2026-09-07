import Image from "next/image";
import Link from "next/link";


export default function EmptyState({message, cta, link}) {

    return (
        <div className="flex flex-col gap-4 items-center justify-center font-mono">
            <div className="w-[300px] flex flex-col gap-2 items-center">
                <Image src={"/empty.svg"} alt="empty-svg" width={150} height={150} />
                <p>{message}</p>
            </div>
            {cta && (
                link ? 
                <Link href={link} className="flex items-center justify-center py-3 px-6 cursor-pointer rounded-lg bg-primary text-white font-bold">{cta}</Link>
                : <button className="flex items-center justify-center py-3 px-6 cursor-pointer rounded-lg bg-primary text-white font-bold">{cta}</button>
            )}
        </div>
    )
}