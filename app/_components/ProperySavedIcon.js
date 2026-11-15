import { cookies } from "next/headers"
import { URL } from "../_lib/utils";
import PropertySaveBtn from "./PropertySaveBtn";
import { getSavedProperties } from "../_lib/data-services";

export default async function PropertySavedIcon({propertyId, isPropertyCard=false}){
    const cookiesStore = await cookies();
    const token =  cookiesStore.get("token");

    // This icon appears on public property cards, so a failed lookup should
    // only hide the saved state instead of taking down the page.
    let savedProperties = [];
    try {
        const { data } = await getSavedProperties(token);
        savedProperties = Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn("Unable to load saved properties for the save icon:", error?.message || error);
    }

    const isSaved = savedProperties.map((property) => property.property_id)?.includes(Number(propertyId)) ?? false;

    return (
        <PropertySaveBtn isSaved={isSaved} propertyId={propertyId} isPropertyCard={isPropertyCard} />
    )
}
