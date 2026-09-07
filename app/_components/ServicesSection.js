import ServicesCard from "./ServicesCard";
import ic01 from "@/public/icon-1.svg";
import ic02 from "@/public/icon-2.svg";
import ic03 from "@/public/icon-3.svg";
import ic04 from "@/public/icon-4.svg";
import ic05 from "@/public/icon-5.svg";
import bg01 from "@/public/service-img01.jpeg"
import StarRating from "./StarRating";

const services = [
  {
    bg: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: ic01,
    title: "Property Sale",
    body: "Find your ideal home or investment property with ease. Our curated listings and expert guidance make the buying process smooth and secure.",
  },
  {
    bg: "https://images.unsplash.com/photo-1668911493514-2aeed8439227?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: ic02,
    title: "Property Rental",
    body: "Discover rental properties that fit your lifestyle and budget. From short stays to long leases, we make finding your next home effortless.",
  },
  {
    bg: "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: ic03,
    title: "Property Listing",
    body: "Showcase your property to the right audience. Our end-to-end list services handles everything from marketing to management, making it easy to sell or rent your property.",
  },
  {
    bg: "https://cdn.pixabay.com/photo/2024/03/22/21/32/ai-generated-8650513_1280.jpg",
    icon: ic04,
    title: "Facility Management",
    body: "Keep your property in top shape with our reliable facility management services. From maintenance to security, we handle the details so you can enjoy peace of mind",
  },
  {
    bg: "https://cdn.pixabay.com/photo/2023/06/09/15/29/bedroom-8052036_1280.png",
    icon: ic05,
    title: "Space-Planning & Design",
    body: "Transform your space with our expert planning and design services. We create functional, beautiful enviroments tailored to your unique vision",
  },
];
export default function ServicesSection() {

  return (
    <div className="md:h-80 flex md:space-x-2.5 md:flex-row flex-col space-y-6 md:space-y-0 ">
      {services.map((service, i) => (
        <ServicesCard key={i} service={service} />
      ))}
    </div>
  );
}
