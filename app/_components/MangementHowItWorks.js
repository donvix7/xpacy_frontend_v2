

const howItWorks = [
  {
    title: "Choose a service",
    subTitle: "Select the service you need from our range of options.",
  },
  {
    title: "Schedule A Time",
    subTitle: "Pick a convenient date and time that works for you.",
  },
  {
    title: "Confirm And Manage Booking",
    subTitle: "Confirm your booking and track its progress easily.",
  },
]
const MangementHowItWorks = () => {
  return (
    <section className="flex flex-col lg:py-[120px] gap-16 ">
      <div className="flex flex-col gap-4">
        <h2 className="text-center lg:text-2xl text-lg text-primary font-bold ">How It Works</h2>
        <p className="lg:text-lg text-base text-center">Book our facility management services in these 3 simple steps.</p>
      </div>
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
        {howItWorks.map(({ title, subTitle }, index) => (
          <div className="flex flex-col p-12 rounded-lg bg-primary-900 gap-6" key={index}>
            <div className="w-16 h-16 rounded-full bg-white flex justify-center items-center text-center ">
              <p className="w-14 h-14 rounded-full flex justify-center items-center bg-primary-100">
                <span className="text-2xl font-bold text-center font-mono">0{index + 1}</span>
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-lg text-white">{title}</h3>
              <p className="text-white font-mono">{subTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MangementHowItWorks;