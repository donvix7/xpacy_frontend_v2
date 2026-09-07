import { handleSearch } from "../_lib/action";


export default function FilterSidebar({search}){
    return (
        <div className="flex flex-col p-6 gap-4 border border-neutral-200 bg-white shadow-md rounded-lg">
            <h3 className="text-black font-normal text-md">Filter Options</h3>
            <form action={handleSearch} className="flex flex-col font-mono gap-6 text-base text-neutrals-900">
                <select name="purpose" defaultValue={search?.purpose} className="px-2 py-4 border border-neutral-200 rounded-lg bg-white">
                    <option value={""}>Purpose</option>
                    <option value={"buy"}>Buy</option>
                    <option value={"rent"}>Rent</option>
                    <option value={"shortlet"}>Shortlet</option>
                </select>
                <select name="location" defaultValue={search?.location} className="px-2 py-4 border border-neutral-200 rounded-lg bg-white">
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
                <select name="type" defaultValue={search?.type} className="px-2 py-4 border border-neutral-200 rounded-lg bg-white">
                    <option  value={""}>Type</option>
                    <option>All types</option>
                    <option value={"Commercial"}>Commercial</option>
                    <option value={"Residential"}>Residential</option>
                    <option value={"Terrace"}>Terrace</option>
                    <option value={"Flat/Apartment"}>Flat/Apartment</option>
                    <option value={"Duplex"}>Duplex</option>
                    <option value={"Semi-detached"}>Semi-detached</option>
                    <option value={"Fully-detached"}>Fully-detached</option>
                    <option value={"Villa"}>Villa</option>
                </select>
                <select name="minBedrooms" defaultValue={search?.minBedrooms}  className="px-2 py-4 border border-neutral-200 rounded-lg bg-white">
                    <option value={""}>Bedroom</option>
                    <option value={"1"}>1</option>
                    <option value={"2"}>2</option>
                    <option value={"3"}>3</option>
                    <option value={"4"}>4</option>
                    <option value={"5"}>5</option>
                    <option value={"6"}>6</option>
                </select>
                <select name="minPrice" defaultValue={search?.minPrice}  className="px-2 py-4 border border-neutral-200 rounded-lg bg-white">
                    <option value={""}>Minprice</option>
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
                <select name="maxPrice" defaultValue={search?.maxPrice} className="px-2 py-4 border border-neutral-200 rounded-lg bg-white">
                    <option value={""}>Maxprice</option>
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
                <button type="submit" className="p-4 bg-primary text-white font-mono rounded-lg cursor-pointer font-bold ">Apply Filter</button>
                <button type="reset" className="p-4 bg-white text-primary border border-primary font-mono rounded-lg cursor-pointer font-bold ">Clear Filter</button>
            </form>
        </div>
    )
}