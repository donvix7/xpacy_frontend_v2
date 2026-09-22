import { cookies } from "next/headers";
import { getSavedProperties } from "../_lib/data-services";
import SavedPropCard from "./SavedPropCard";
import EmptyState from "./EmptyState";

export default async function SavedPropCardList() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")
  const { data } = await getSavedProperties(token)
  if(!data || data.length <= 0) return <EmptyState message={"Oops!... You do not have any saved property yet."}/>
  
  return (
    <>
    <div className="lg:flex gap-6 items-center justify-center hidden" >
      {data?.toSpliced(3)?.map((property, index) => <SavedPropCard property={property?.propertySaved} key={index} />)}
    </div>
    <MobileCardList data={data}/>
    </>
  )
}

const MobileCardList = ({data}) => {
  return (
    <div className="w-max lg:hidden">
      <div className="flex gap-6 items-center justify-center w-max " >
        {data?.toSpliced(3)?.map((property, index) => <SavedPropCard property={property?.propertySaved} key={index} />)}
      </div>
    </div>
  )
} 