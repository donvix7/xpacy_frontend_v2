import Image from "next/image";
export default function ServicesCard({service}){
    const {bg, icon, title, body} = service;
    return (
      <div className="group md:flex-1 md:h-full h-[435px] relative hover:flex-2 transition-all duration-300">
        <div
          className={` h-full rounded-md  bg-cover flex flex-col items-center justify-center gap-2 `}
          style={{ backgroundImage: `url(${bg})` }}
        >
          <Image src={icon} alt="Naira bag" width={160} height={160} />
        <div className="md:hidden  flex flex-col gap-8">
          <p className="text-lg text-white">{title}</p>
            <div className="flex items-center justify-center">
           <button className="px-3.5 py-2 flex items-center justify-center font-mono rounded-lg font-bold bg-secondary text-black">Learn More</button>

            </div>
        </div>
        </div>
        <div className="hidden h-full bg-primary absolute left-0 right-0 bottom-0 top-0 group-active:flex group-active:flex-col group-active:items-center group-active:justify-center group-hover:flex group-hover:flex-col group-hover:items-center group-hover:justify-center space-y-4 text-white text-center p-4 font-mono">
          <h3 className="text-md font-semibold rounded-md">{title}</h3>
          <p className="text-base">{body}</p>
        </div>
      </div>
    );
}