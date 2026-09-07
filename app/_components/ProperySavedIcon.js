import { cookies } from "next/headers"
import { URL } from "../_lib/utils";
import PropertySaveBtn from "./PropertySaveBtn";
import { getSavedProperties } from "../_lib/data-services";

export default async function PropertySavedIcon({propertyId, isPropertyCard=false}){
    const cookiesStore = await cookies();
    const token =  cookiesStore.get("token");

    const {data} = await getSavedProperties(token)

    const isSaved = data?.map((property) => property.property_id)?.includes(Number(propertyId)) ?? false;

    return (
        <PropertySaveBtn isSaved={isSaved} propertyId={propertyId} isPropertyCard={isPropertyCard} />
    )
}