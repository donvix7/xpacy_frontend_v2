import LinkBtn from "./LinkBtn";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import {handleSearch} from "@/app/_lib/action"

export default function Filter() {
  return (
    <form action={handleSearch} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-2 md:flex-row flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
        <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full" name="purpose">
          <option value={""}>Purpose</option>
          <option value={"buy"}>Buy</option>
          <option value={"rent"}>Rent</option>
          <option value={"shortlet"}>Shortlet</option>
        </select>
        
        <select name="location" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full">
          <option value={""}>Location</option>
          <option value={"Abuja"}>Abuja</option>
          <option value={"Aba"}>Aba</option>
          <option value={"Benin"}>Benin</option>
          <option value={"Calabar"}>Calabar</option>
          <option value={"Enugu"}>Enugu</option>
          <option value={"Ibadan"}>Ibadan</option>
          <option value={"Ilorin"}>Ilorin</option>
          <option value={"Lagos"}>Lagos</option>
          <option value={"Minna"}>Minna</option>
          <option value={"Port Harcourt"}>Port Harcourt</option>
          <option value={"Uyo"}>Uyo</option>
          <option value={"Warri"}>Warri</option>
        </select>

        <select name="type" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full">
          <option value={""}>Type</option>
          <option value={"All types"}>All types</option>
          <option value={"Commercial"}>Commercial</option>
          <option value={"Residential"}>Residential</option>
          <option value={"Terrace"}>Terrace</option>
          <option value={"Flat/Apartment"}>Flat/Apartment</option>
          <option value={"Duplex"}>Duplex</option>
          <option value={"Semi-detached"}>Semi-detached</option>
          <option value={"Fully-detached"}>Fully-detached</option>
          <option value={"Villa"}>Villa</option>
          <option value={"Office Space"}>Office Space</option>
          <option value={"Conference room"}>Conference room</option>
          

        </select>

        <select name="minBedrooms" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full">
          <option value={""}>Bedrooms</option>
          <option value={"1"}>1</option>
          <option value={"2"}>2</option>
          <option value={"3"}>3</option>
          <option value={"4"}>4</option>
          <option value={"5"}>5</option>
          <option value={"6"}>6</option>
        </select>

        <select name="minPrice" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full">
          <option value={""}>Min Price</option>
          <option value={45000}>{"N45k"}</option>
          <option value={50000}>{"N50k"}</option>
          <option value={100000}>{"N100k"}</option>
          <option value={200000}>{"N200k"}</option>
          <option value={500000}>{"N500k"}</option>
          <option value={1000000}>{"N1m"}</option>
          <option value={2000000}>{"N2m"}</option>
          <option value={3000000}>{"N3m"}</option>
          <option value={4000000}>{"N4m"}</option>
          <option value={5000000}>{"N5m"}</option>
          <option value={6000000}>{"N6m"}</option>
          <option value={7000000}>{"N7m"}</option>
          <option value={8000000}>{"N8m"}</option>
          <option value={9000000}>{"N9m"}</option>
          <option value={10000000}>{"N10m"}</option>
          <option value={20000000}>{"N20m"}</option>
          <option value={30000000}>{"N30m"}</option>
          <option value={40000000}>{"N40m"}</option>
          <option value={50000000}>{"N50m"}</option>
          <option value={100000000}>{"N100m"}</option>
        </select>

        <select name="maxPrice" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full">
          <option value={""}>Max Price</option>
          <option value={100000}>{"N100k"}</option>
          <option value={200000}>{"N200k"}</option>
          <option value={500000}>{"N500k"}</option>
          <option value={1000000}>{"N1m"}</option>
          <option value={2000000}>{"N2m"}</option>
          <option value={3000000}>{"N3m"}</option>
          <option value={4000000}>{"N4m"}</option>
          <option value={5000000}>{"N5m"}</option>
          <option value={6000000}>{"N6m"}</option>
          <option value={7000000}>{"N7m"}</option>
          <option value={8000000}>{"N8m"}</option>
          <option value={9000000}>{"N9m"}</option>
          <option value={10000000}>{"N10m"}</option>
          <option value={20000000}>{"N20m"}</option>
          <option value={30000000}>{"N30m"}</option>
          <option value={40000000}>{"N40m"}</option>
          <option value={50000000}>{"N50m"}</option>
          <option value={100000000}>{"N100m"}</option>
          <option value={200000000}>{"200m"}</option>
        </select>

        
      </div>
      <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-1 flex justify-center">
          <LinkBtn className="w-full justify-center">
            <MagnifyingGlassIcon className="size-5 mr-2" />
            <span>Search</span>
          </LinkBtn>
        </div>
    </form>
  );
}