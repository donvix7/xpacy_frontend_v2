import AddNewPropertyForm from "@/app/_components/AddNewPropertyForm";
import BackBtn from "@/app/_components/BackBtn";
import Logo from "@/app/_components/Logo";
import { getCities, getPropertyOwner } from "@/app/_lib/data-services";
import { cookies } from "next/headers";


export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")
    const allOwners = await getPropertyOwner(token);
    const allCities = await getCities();
    return (
        <div className="flex-1 flex flex-col gap-4.5">
            {/* Navigation */}
            <nav className="   flex  pl-[7%] py-6 border-b border-primary-100">
                <div className="w-1/2 flex items-center justify-between">
                    <BackBtn />
                    <Logo />
                </div>
            </nav>
            {/* Form */}
            <div className="flex flex-col items-center justify-center">
                <AddNewPropertyForm allOwners={allOwners} allCities={allCities} token={token} />
            </div>
        </div>
    )
}