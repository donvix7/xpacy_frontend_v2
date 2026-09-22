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
              className="flex flex-col items-center cursor-pointer w-full"
            >
              {/* Circle + connector row */}
              <div className="relative flex w-full items-center ">
                {/* The circle is anchored to the LEFT of the column.
                    Its center is therefore at (circle-width / 2) from the left. */}
                <div
                  className={`left-1/2 relative z-10 flex w-7 h-7  rounded-full items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-primary-100 text-primary"
                  }`}
                >
                  <span>{isComplete ? <FaCheck /> : item.step}</span>
                </div>

                {/* Connector line: starts at THIS circle's center and
                    ends at the NEXT circle's center. Since the next circle
                    also sits at its column's left edge, the gap between
                    centers equals the column width. */}
                {!isLast && (
                  <div
                    className={`absolute top-1/2 left-1/2  h-[2px] w-full -translate-y-1/2 ${
                      isComplete ? "bg-primary" : "bg-primary-200"
                    }`}
                  />
                )}
              </div>

              {/* Label sits directly under the circle because the circle
                  is left-anchored and we want the label aligned to its center.
                  Use a fixed-width wrapper the same size as the circle. */}
              <p className="w-7 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap mt-2 ">
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