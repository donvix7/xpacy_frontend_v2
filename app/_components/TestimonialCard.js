import Image from "next/image";
import StarRating from "./StarRating";

export default function TestimonialCard({review}){
    const { clientImg, testimony, name, occupation, rating } = review;
    return (
      <div className="p-6 flex space-x-4 w-[547px] shadow-lg rounded-md">
        <Image
          src={clientImg}
          width={200}
          height={250}
          alt="client potrait"
          className="object-cover rounded-lg"
        />
        <div className="flex flex-col space-y-6 font-mono">
          <p>{testimony}</p>
          <p>
            {name}, <span className="text-xs">{occupation}</span>
          </p>
          <StarRating ratingNum={rating} />
        </div>
      </div>
    );
}