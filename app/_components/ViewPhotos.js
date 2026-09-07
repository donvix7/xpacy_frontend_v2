import Link from "next/link"
import { SlPicture } from "react-icons/sl"


export default function ViewPhotos({propertySlug}) {
    return (
        <Link href={`/view-photos/${propertySlug}`} className={`absolute border border-neutral-200 bottom-4 text-sm font-mono right-4 flex items-center py-1 px-2 bg-white rounded-lg gap-2`}>
            <span><SlPicture /></span>
            <span>View All Photos</span>
        </Link>
    )
}