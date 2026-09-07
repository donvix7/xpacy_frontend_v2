import { FaCheck } from "react-icons/fa6";

const progressBarSteps = [
    { step: 1, label: "Overview" },
    { step: 2, label: "Property Info" },
    { step: 3, label: "Media" },
    { step: 4, label: "Tenant Info" },
    { step: 5, label: "Service Request" },
    { step: 6, label: "Transaction History" },
];
const ProgressBar = ({activeStep, setActiveStep, steps}) => {
    const progressSteps = steps || progressBarSteps;
    return (
        <div className="flex justify-between text-center font-mono w-[800px] mx-auto overflow-x-auto pb-4 px-4 no-scrollbar">
            {progressSteps.map((item, index) => (
                <div onClick={() => setActiveStep(prev => prev === item.step ? prev : item.step)} key={index} className="flex cursor-pointer flex-col items-center justify-center min-w-[100px] gap-2">
                    <div className={`relative flex w-7 h-7 rounded-full items-center justify-center shrink-0 ${activeStep >= item.step ? 'bg-primary text-white' : 'bg-primary-100 text-primary'}`}>
                        <span>{activeStep > item.step ? <FaCheck /> : item.step}</span>
                        {index > 0 && <div className={` ${activeStep >= item.step ? 'bg-primary' : 'bg-primary-200'} h-[2px] w-[80px] absolute top-1/2 right-1/1 mr-3.5`} ></div>}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">{item.label}</p>
                </div>)
            )}
        </div>
    );
};

export default ProgressBar;