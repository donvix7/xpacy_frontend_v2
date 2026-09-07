"use client"
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

function ScheduleInspectionForm({ onClose, properties = [] }) {
    const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || properties[0]?._id || "");
    const [selected, setSelected] = useState(undefined);
    const [isPending, startTransition] = useTransition();
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function fetchBookedDates() {
            if (!selectedPropertyId) {
                setIsLoadingDates(false);
                setBookedDates([]);
                return;
            }
            try {
                setIsLoadingDates(true);
                const property = await getProperty(selectedPropertyId);

                if (property?.bookings?.length > 0) {
                    const allBookedDays = property.bookings.flatMap(booking => {
                        if (!booking.start_date || !booking.end_date) return [];

                        const formatStr = "dd-MM-yyyy";
                        const start = parse(booking.start_date, formatStr, new Date());
                        const end = parse(booking.end_date, formatStr, new Date());

                        if (isNaN(start) || isNaN(end)) {
                            const fallbackStart = new Date(booking.start_date);
                            const fallbackEnd = new Date(booking.end_date);
                            if (isNaN(fallbackStart) || isNaN(fallbackEnd)) return [];
                            return eachDayOfInterval({ start: fallbackStart, end: fallbackEnd });
                        }

                        return eachDayOfInterval({ start, end });
                    });
                    setBookedDates(allBookedDays);
                } else {
                    setBookedDates([]);
                }
            } catch (error) {
                console.error("Error fetching booked dates:", error);
            } finally {
                setIsLoadingDates(false);
            }
        }

        fetchBookedDates();
    }, [selectedPropertyId]);

    const disabledDays = useMemo(() => {
        return [
            (currDate) => isPast(currDate),
            ...bookedDates
        ];
    }, [bookedDates]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedPropertyId) return toast.error("Please select a property to inspect");
        if (!selected) return toast.error("Please choose an inspection date");

        startTransition(async () => {
            try {
                const bookingData = {
                    property_id: selectedPropertyId,
                    start_date: format(selected, "dd-MM-yyyy"),
                    end_date: format(selected, "dd-MM-yyyy"),
                    bookingReason: "Inspection",
                }

                const data = await createBooking(bookingData);

                if (data.success) {
                    toast.success(data.message || "Inspection scheduled successfully!");
                    onClose();
                    router.refresh();
                } else {
                    toast.error(data.message || "Failed to schedule inspection. This date may already be taken.");
                }
            } catch (error) {
                toast.error(error.message || "An unexpected error occurred while scheduling the inspection.");
            }
        })
    }

    return (
        <div className="flex flex-col p-6 w-[350px] md:w-[480px] max-h-[600px] gap-6 font-mono">
            <h3 className="text-primary md:text-xl text-md font-sans text-center font-bold lg:mb-4">Schedule an inspection</h3>
            <form className="flex flex-col gap-6 overflow-y-auto" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label className="text-gray-700 text-sm">Property to inspect</label>
                    <select
                        name="property_id"
                        value={selectedPropertyId}
                        onChange={(e) => { setSelectedPropertyId(e.target.value); setSelected(undefined); }}
                        className="px-3 py-3 border border-gray-300 rounded-lg placeholder:text-gray-500"
                    >
                        {properties.length === 0 && <option value="">No properties available</option>}
                        {properties.map(property => (
                            <option key={property.id || property._id} value={property.id || property._id}>
                                {property.property_name || "Untitled property"}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full flex justify-center min-h-[300px] items-center">
                    {isLoadingDates ? (
                        <SpinnerMini />
                    ) : (
                        <DayPicker
                            animate
                            mode="single"
                            selected={selected}
                            onSelect={(val) => {
                                if (val) {
                                    if (isPast(val)) return toast.error("You cannot select a past date.");
                                    if (bookedDates.some(booked => isSameDay(booked, val))) {
                                        toast.error("You cannot select a date that is already booked or taken.");
                                        return;
                                    }
                                }
                                setSelected(val);
                            }}
                            disabled={disabledDays}
                        />
                    )}
                </div>
                <div className="mb-2">
                    <CustomCheckbox labelSize="text-md" label={<p>I agree to the <Link href={"#"} className="text-primary font-bold"> Terms and Conditions</Link> </p>} />
                </div>
                <div className="flex items-center justify-between">
                    <button type="button" onClick={onClose} className="py-2 px-3.5 border border-gray-400 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={isPending || isLoadingDates} className="py-2 px-5 border border-primary rounded-lg bg-primary cursor-pointer text-white hover:bg-primary-700 transition-colors flex items-center gap-2">
                        {isPending && <SpinnerMini />}
                        <span>Schedule Inspection</span>
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ScheduleInspectionForm