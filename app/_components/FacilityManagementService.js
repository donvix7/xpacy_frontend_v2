import Image from "next/image";
import Link from "next/link";

const facilityServcies = [
  {
    title: "Plumbing Services",
    message: "Our expert plumbers are available for all your plumbing needs, from repairs to installations. Whether it's a leaky faucet, a broken pipe, or a full bathroom remodel, we’ve got you covered.",
    imgSrc: "/facility-img1.jpg",
  },
  {
    title: "Cleaning Services",
    message: "Keep your property spotless with our professional cleaning services. From routine cleanings to deep cleans, we cater to residential and commercial spaces of all sizes.",
    imgSrc: "/facility-img2.jpg",
  },
  {
    title: "Electrical Repairs",
    message: "Need electrical work done? Our certified electricians can handle everything from minor repairs to full rewiring. We ensure your home’s electrical system is safe and up to code.",
    imgSrc: "/facility-img3.jpg",
  },
  {
    title: "Security Guard Services",
    message: "Ensure the safety of your property with our professional security guard services. We provide trained, reliable security personnel to monitor and protect your premises, offering peace of mind.",
    imgSrc: "/facility-img4.jpg",
  },
  {
    title: "Pest Control",
    message: "Protect your property from unwanted pests with our reliable pest control services. We handle infestations, prevention, and routine treatments for homes and businesses.",
    imgSrc: "/facility-img5.jpg",
  },
  {
    title: "Painting & Wall Care",
    message: "Refresh your property with our professional painting and wall repair services. Whether it’s a full paint job or minor touch-ups, we bring new life to your interiors and exteriors.",
    imgSrc: "/facility-img6.jpg",
  },
  {
    title: "Landscaping & Lawn Care",
    message: "Create a beautiful outdoor space with our landscaping and lawn care services. We provide lawn mowing, tree trimming, garden design, and seasonal maintenance for a lush, green property.",
    imgSrc: "/facility-img7.png",
  },
  {
    title: "Waste Management",
    message: "Ensure your property stays clean and eco-friendly with our waste management services. We provide scheduled trash collection for residential and commercial properties.",
    imgSrc: "/facility-img8.jpg",
  },
  {
    title: "Appliance Repairs",
    message: "Our skilled technicians offer quick and efficient appliance repair services. From refrigerators to washing machines, we’ll get your appliances back up and running in no time.",
    imgSrc: "/facility-img-9.jpg",
  },
]

const FacilityManagementService = () => {
  return (
    <section className="flex flex-col pt-12 lg:pt-0 lg:py-[120px] gap-16 ">
      <div className="flex flex-col gap-4">
        <h2 className="text-center lg:text-2xl text-lg text-primary font-bold ">Our Facility Management Services</h2>
        <p className="lg:text-lg text-base text-center">Comprehensive Care for Your Property, Tailored to Your Needs.</p>
      </div>
      <div className="grid lg:grid-cols-3 grid-cols-1 grid-rows-[auto] gap-x-6 lg:gap-y-12">
        {facilityServcies.map(({ title, message, imgSrc }, index) => (
          <div className="p-4 border border-neutral-100 flex flex-col gap-4 rounded-lg shadow-xs " key={index}>
            <div className="w-full h-[251px] relative">
              <Image src={imgSrc} className="object-cover rounded-lg" fill alt={`${title} photo`} />
            </div>
            <p className="text-lg text-center">{title}</p>
            <span className="font-mono text-center">{message}</span>
            <Link href={"/book-service"} className="text-white bg-primary rounded-lg p-4 font-bold font-mono text-center"> Book Now</Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FacilityManagementService;