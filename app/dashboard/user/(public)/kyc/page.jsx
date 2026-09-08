"use server"

import KycForm from '@/app/_components/KycForm';
import { cookies } from 'next/headers';

const PropertyApplication = async () => {

    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    return (
        <div className="p-2">
            <KycForm token = {token}/>
        </div>
    )
};

export default PropertyApplication;