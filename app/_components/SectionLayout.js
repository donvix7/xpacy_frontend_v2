

export default function SectionLayout({children, heading, subheading, bgColor, featured = false}){

    return (
      <section
        className={`px-6 py-12 space-y-8 md:py-[120px] md:px-[7%] flex flex-col md:space-y-16 ${featured ? "relative": ""}  ${
          bgColor ? "bg-linear-180 from-primary-100 to-[#FCFCFC] overflow-hidden" : ""
        }`}
      >
        <div className="flex flex-col text-center space-y-4">
          <h2 className="font-bold text-primary md:text-4xl text-[28px] ">{heading}</h2>
          <p className="font-normal md:text-md text-black text-base font-mono md:font-sans">{subheading}</p>
        </div>
        {children}
      </section>
    );
}