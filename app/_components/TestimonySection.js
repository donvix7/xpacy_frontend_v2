import TestimonialCard from "./TestimonialCard";
import { clientImg } from '@/public/review-img01.png';

 const clientReview = [
   {
     clientImg:
       "https://images.unsplash.com/photo-1611432579699-484f7990b127?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGVhZHNob3R8ZW58MHx8MHx8fDA%3D",
     testimony:
       "“Listing my property with Xpacy was the best decision I made. Their team handled everything, from photos to tenant management, giving me peace of mind and steady income!”",
     name: "Deola Alade",
     occupation: "Property owner",
     rating: 5,
   },
   {
     clientImg:
       "https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
     testimony:
       '"I am so glad I found my place through Xpacy. The whole process was easy, the team was super helpful, and I’ve been really happy and comfortable ever since!"',
     name: "Dami Adeola",
     occupation: "Property owner",
     rating: 5,
   },
   {
     clientImg:
       "https://images.unsplash.com/photo-1611432579699-484f7990b127?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGVhZHNob3R8ZW58MHx8MHx8fDA%3D",
     testimony:
       '"Renting through Xpacy has been a fantastic experience. Their team made everything smooth and stress-free, and I’ve felt well taken care of from the start!"',
     name: "Dara Ojo",
     occupation: "Property owner",
     rating: 4.5,
   },
 ];
export default function TestimonySection(){
    return (
      <div className="w-full overflow-hidden">
        <div className="flex w-fit animate-scroll space-x-12 py-4">
          {clientReview.map((review, i) => (
            <TestimonialCard review={review} key={i} />
          ))}
          {/* Duplicated for seamless scrolling */}
          {clientReview.map((review, i) => (
            <TestimonialCard review={review} key={i} />
          ))}
        </div>
      </div>
    );
}