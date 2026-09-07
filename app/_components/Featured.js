
import FeaturedCard from "./FeaturedCard";
import FeaturedListBtns from "./FeaturedListBtns";


export default function Featured({ properties }) {

  return (
    <>
      <FeaturedListBtns>
        <div className="min-w-fit flex space-x-6 py-5 px-2.5 ">
          {properties?.map((property, index) => (
            <FeaturedCard property={property} key={index} />
          ))}
        </div>
      </FeaturedListBtns>
    </>
  );
}
