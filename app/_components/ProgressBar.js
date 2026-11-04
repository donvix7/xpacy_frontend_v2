import { FaCheck } from "react-icons/fa6";

const progressBarSteps = [
  { step: 1, label: "Owner Info" },
  { step: 2, label: "Property Info" },
  { step: 3, label: "Location" },
];

const ProgressBar = ({ activeStep, setActiveStep, steps }) => {
  const progressSteps = steps || progressBarSteps;

  return (
    <div className="font-mono w-full max-w-[800px] mx-auto overflow-x-auto pb-4 px-4 no-scrollbar">
      <div className="flex w-full items-start">
        {progressSteps.map((item, index) => {
          const isLast = index === progressSteps.length - 1;
          const isComplete = activeStep > item.step;
          const isActive = activeStep >= item.step;

          return (
            <div
              key={item.step}
              onClick={() =>
                setActiveStep((prev) => (prev === item.step ? prev : item.step))
              }
              className="flex flex-col items-center cursor-pointer flex-1 min-w-0"
            >
              {/* Circle + connector row */}
              <div className="relative flex w-full items-center justify-center">
                {/* Connector line — sits behind the circle, spans from this circle's center to the next */}
                {!isLast && (
                  <div
                    className={`absolute top-1/2 left-1/2 h-[2px] w-full -translate-y-1/2 ${
                      isComplete ? "bg-primary" : "bg-primary-200"
                    }`}
                  />
                )}

                {/* Circle — centered in its column, on top of the line */}
                <div
                  className={`relative z-10 flex w-7 h-7 rounded-full items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-primary-100 text-primary"
                  }`}
                >
                  <span>{isComplete ? <FaCheck /> : item.step}</span>
                </div>
              </div>

              {/* Label centered under the circle */}
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap mt-2 text-center">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;