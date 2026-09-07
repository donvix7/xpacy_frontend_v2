
export default function LoadingPropertiesCard({lengths = 10}) {
    return (
        <div className="flex-1 flex flex-col gap-16">
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">

           {Array.from({length: lengths}, (_, i) => i).map(index => (
               <div className="block bg-white border border-neutral-100 rounded-lg shadow-md" key={index}>
                   <div className="w-full h-[280px] rounded-r-lg rounded-l-lg border border-neutral-100 animate-bg"></div>
                   <div className="p-4 space-y-2">
                       <div className="w-full rounded-lg h-[30px] animate-bg"></div>
                       <div className="w-full rounded-lg h-[30px] animate-bg"></div>
                       <div className="w-full rounded-lg h-[30px] animate-bg"></div>
                       <div className="w-full rounded-lg h-[30px] animate-bg"></div>
                   </div>
               </div>
           ))}
            </div>
        </div>
    )
}