import { eachDayOfInterval, isPast, parse, format, isSameDay } from "date-fns";
import toast from "react-hot-toast"
import { useEffect, useState, useTransition, useMemo } from "react"
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { createBooking } from "../_lib/action";
import { getProperty } from "../_lib/data-services";
import { useRouter } from "next/navigation";
import CustomCheckbox from "./CustomCheckbox";
import Link from "next/link";
import SpinnerMini from "./SpinnerMini";

const selectOptions = [
    { label: "Lodging" },
    { label: "House party" },
    { label: "Get together" },
    { label: "Photoshoot/Videoshoot" },
    { label: "Others" }
]

function BookDayPicker({ onClose, property_id, property_status }) {
    const isInspection = property_status === "Rent";
    const [selected, setSelected] = useState(isInspection ? undefined : { from: undefined, to: undefined });
    const [isPending, startTransition] = useTransition();
    const [isLoadingDates, setIsLoadingDates] = useState(true);
    const [bookedDates, setBookedDates] = useState([]);
    const [bookingReason, setBookingReason] = useState("");
    const router = useRouter();

    useEffect(() => {
        async function fetchBookedDates() {
            try {
                setIsLoadingDates(true);
                const property = await getProperty(property_id);
                
                if (property?.bookings?.length > 0) {
                    const allBookedDays = property.bookings.flatMap(booking => {
                        if (!booking.start_date || !booking.end_date) return [];
                        
                        // Parse dates using the format we send to the backend
                        const formatStr = "dd-MM-yyyy";
                        const start = parse(booking.start_date, formatStr, new Date());
                        const end = parse(booking.end_date, formatStr, new Date());
                        
                        if (isNaN(start) || isNaN(end)) {
                            // Fallback to standard Date constructor if parse fails
                            const fallbackStart = new Date(booking.start_date);
                            const fallbackEnd = new Date(booking.end_date);
                            if (isNaN(fallbackStart) || isNaN(fallbackEnd)) return [];
                            return eachDayOfInterval({ start: fallbackStart, end: fallbackEnd });
                        }
                        
                        return eachDayOfInterval({ start, end });
                    });
                    setBookedDates(allBookedDays);
                }
            } catch (error) {
                console.error("Error fetching booked dates:", error);
                // Non-blocking error, user can still try to book
            } finally {
                setIsLoadingDates(false);
            }
        }

        if (property_id) fetchBookedDates();
    }, [property_id]);

    const disabledDays = useMemo(() => {
        return [
            (currDate) => isPast(currDate),
            ...bookedDates
        ];
    }, [bookedDates]);
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isInspection) {
            if (!selected) return toast.error("Please choose an inspection date");
        } else {
            if(!selected?.from || !selected?.to) {
                return toast.error("Please choose booking dates")
            }
        }
        
        startTransition(async () => {
            try {
                let bookingData;
                if (isInspection) {
                    bookingData = {
                        property_id,
                        start_date: format(selected, "dd-MM-yyyy"),
                        end_date: format(selected, "dd-MM-yyyy"), // usually same day for single booking/inspection
                        bookingReason: bookingReason || "Inspection",
                    }
                } else {
                    bookingData = {
                        property_id,
                        start_date: format(selected.from, "dd-MM-yyyy"),
                        end_date: format(selected.to, "dd-MM-yyyy"),
                        bookingReason,
                    }
                }
                
                // Using a regular async call inside startTransition for more granular control
                const data = await createBooking(bookingData);
                
                if (data.success) {
                    toast.success(data.message || "Booking created successfully!");
                    router.push("/dashboard/user/my-properties");
                   // router.refresh();
                } else {
                    toast.error(data.message || "Failed to create booking. This date may already be taken.");
                }
            } catch (error) {
                toast.error(error.message || "An unexpected error occurred during booking.");
            }
        })
    }

    return (
        <div className="flex flex-col p-6 md:w-[450px] w-[350px] max-h-[600px] gap-6 font-mono ">
            <h3 className="text-primary md:text-xl text-md font-sans text-center font-bold lg:mb-4">{isInspection ? "Select inspection date" : "Select booking dates"}</h3>
            <form className="flex flex-col gap-6 overflow-y-auto" onSubmit={handleSubmit}>
                <div className="w-full flex justify-center min-h-[300px] items-center">
                    {isLoadingDates ? (
                        <SpinnerMini />
                    ) : (
                        <DayPicker
                            animate
                            mode={isInspection ? "single" : "range"}
                            selected={selected}
                            onSelect={(val) => {
                                if (isInspection) {
                                    if (val) {
                                        if (isPast(val)) return toast.error("You cannot select a past date.");
                                        if (bookedDates.some(booked => isSameDay(booked, val))) {
                                            toast.error("You cannot select a date that is already booked or taken.");
                                            return;
                                        }
                                    }
                                    setSelected(val);
                                } else {
                                    const range = val;
                                    if (range?.from && range?.to) {
                                        const days = eachDayOfInterval({ start: range.from, end: range.to });
                                        const isInvalid = days.some(day => {
                                            if (isPast(day)) return true;
                                            return bookedDates.some(booked => isSameDay(booked, day));
                                        });
                                        if (isInvalid) {
                                            toast.error("You cannot select a range that includes already booked dates.");
                                            return;
                                        }
                                    }
                                    setSelected(range);
                                }
                            }}
                            disabled={disabledDays}
                        />
                    )}
                </div>
                {!isInspection && <div className="flex-1 flex-col flex gap-2">
                    <label className="text-gray-700">Reason for booking</label>
                    <select name="bookingReason" className="px-3 py-3.5 border border-gray-300 rounded-lg placeholder:text-gray-500 " onChange={(e) => {setBookingReason(e.target.value)}}>
                        <option value="">Please choose the reason for booking</option>
                        {selectOptions.map(option => <option value={option.label} key={option.label}>{option.label}</option>)}
                    </select>
                </div>}
                <div className="mb-2">
                    <CustomCheckbox labelSize="text-md" label={<p>I agree to the <Link href={"#"} className="text-primary font-bold"> Terms and Conditions</Link> </p>}/> 
                </div>
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose} className="py-2 px-3.5 border border-gray-400 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={isPending || isLoadingDates} className="py-2 px-5 border border-primary rounded-lg bg-primary cursor-pointer text-white hover:bg-primary-700 transition-colors flex items-center gap-2">
                        {isPending && <SpinnerMini />}
                        <span>Book</span>
                    </button>
                </div>
            </form>
        </div>
    )
}

export default BookDayPicker
