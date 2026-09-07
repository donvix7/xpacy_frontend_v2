import { IoStar, IoStarHalf } from "react-icons/io5";

export default function StarRating({ ratingNum = 5.0, showNum = true, starSize="text-md" }) {
  let ratingArray = [];
  if (ratingNum % 1 === 0) {
    ratingArray = Array.from({ length: ratingNum }, (_, i) => i);
  }
  if (ratingNum % 1 === 0.5) {
    ratingArray = Array.from(
      { length: Math.floor(ratingNum) },
      (_, i) => i
    ).concat([0.5]);
  }
  return (
    <div className="flex items-center space-x-0.5">
        {showNum && <span className="font-mono text-sm">{ratingNum}:</span>}
      {ratingArray.map((num, index) => {
        if (num === 0.5){ return <span key={index} className={`text-secondary-500 ${starSize}`}><IoStarHalf/></span>}else{
            return <span key={index} className={`text-secondary-500 ${starSize}`}><IoStar /></span>
        };
      })}
    </div>
  );
}
