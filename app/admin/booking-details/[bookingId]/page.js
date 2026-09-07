import BackBtn from "@/app/_components/BackBtn";
import Logo from "@/app/_components/Logo";
import { getAdminBooking } from "@/app/_lib/data-services";
import { cookies } from "next/headers";
import { formatCurrency } from "@/app/_lib/utils";
import { format } from "date-fns";
import StatusChips from "@/app/_components/StatusChips";
import FormInput from "@/app/_components/FormInput";

export default async function ViewBookingPage({ params }) {
    const { bookingId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    // Fetch all bookings and filter down to the specific one, 
    // unless an endpoint to fetch a single booking explicitly exists.
    const allBookings = await getAdminBooking(token);
    const booking = allBookings?.find(b => String(b.id || b._id) === String(bookingId));

    if (!booking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
                <BackBtn />
                <h1 className="text-2xl font-bold mt-4 text-gray-800">Booking Not Found</h1>
                <p className="text-gray-500 mt-2 text-center max-w-md">The booking you are looking for does not exist or has been deleted.</p>
            </div>
        );
    }

    const { user, property, amount, payment_status, status, start_date, end_date, created_at, id, _id } = booking;
    const bookingStatus = payment_status || status || "pending";

    return (
        <div className="flex-1 flex flex-col gap-8 min-h-screen bg-neutrals-50">
            {/* Header Navigation */}
            <nav className="flex items-center justify-between px-[7%] py-6 bg-white border-b border-primary-100 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-8">
                    <BackBtn />
                    <div className="h-8 w-px bg-primary-100"></div>
                    <h2 className="text-xl font-bold text-primary">Booking Details</h2>
                </div>
                <Logo />
            </nav>

            <main className="flex-1 px-[7%] py-8">
                <div className="flex flex-col gap-12 w-full max-w-[796px] mx-auto pb-12">
                    {/* Content Area */}
                    <div className="p-8 flex flex-col gap-10 bg-white rounded-xl shadow-sm">
                        
                        {/* 1. Tenant Info Section */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-lg font-bold text-primary border-b border-gray-100 pb-2">Tenant Information</h3>
                            <div className="flex flex-col gap-6">
                                <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                    <FormInput label="First Name" id="tenant_firstname">
                                        <input 
                                            disabled 
                                            value={user?.firstname || user?.first_name || "Guest"}
                                            className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                        />
                                    </FormInput>
                                    <FormInput label="Last Name" id="tenant_lastname">
                                        <input 
                                            disabled 
                                            value={user?.lastname || user?.last_name || "User"}
                                            className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                        />
                                    </FormInput>
                                </div>
                                <FormInput label="Email address" id="tenant_email">
                                    <input 
                                        disabled 
                                        value={user?.email || "N/A"} 
                                        className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                    />
                                </FormInput>
                                <FormInput label="Phone number" id="tenant_phone">
                                    <input 
                                        disabled 
                                        value={user?.phone || "N/A"} 
                                        className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                    />
                                </FormInput>
                            </div>
                        </div>

                        {/* 2. Property & Booking Info Section */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-lg font-bold text-primary border-b border-gray-100 pb-2">Property & Booking Details</h3>
                            <div className="flex flex-col gap-6">
                                <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                    <FormInput label="Property Name" id="property_name">
                                        <input 
                                            disabled 
                                            value={property?.property_name || "Unknown Property"}
                                            className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                        />
                                    </FormInput>
                                    <FormInput label="Status" id="booking_status">
                                        <div className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-2.5 focus:outline-none w-full">
                                            <span className="capitalize text-sm font-bold px-3 py-1 bg-primary-100 text-primary rounded-full">
                                                {bookingStatus}
                                            </span>
                                        </div>
                                    </FormInput>
                                </div>

                                <FormInput label="Property Address" id="property_address">
                                    <input 
                                        disabled 
                                        value={property?.address || "No address provided"}
                                        className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                    />
                                </FormInput>

                                <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                    <FormInput label="Start Date" id="start_date">
                                        <input 
                                            disabled 
                                            value={start_date ? format(new Date(start_date), "MMMM dd, yyyy") : "Not Specified"}
                                            className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                        />
                                    </FormInput>
                                    <FormInput label="End Date" id="end_date">
                                        <input 
                                            disabled 
                                            value={end_date ? format(new Date(end_date), "MMMM dd, yyyy") : "Not Specified"}
                                            className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                        />
                                    </FormInput>
                                </div>

                                <div className="flex md:items-center items-start gap-6 flex-col md:flex-row">
                                    <FormInput label="Amount Paid" id="amount_paid">
                                        <div className="rounded-lg border border-primary-400 bg-primary-50 px-4.5 py-3 focus:outline-none w-full">
                                            <span className="font-bold text-primary-900">
                                                {amount || property?.property_price ? formatCurrency(amount || property?.property_price) : "N/A"}
                                            </span>
                                        </div>
                                    </FormInput>
                                    <FormInput label="Booking Date" id="booking_date">
                                        <input 
                                            disabled 
                                            value={created_at ? format(new Date(created_at), "MMM dd, yyyy - hh:mm a") : "Unknown"}
                                            className="rounded-lg border border-primary-200 bg-gray-50 px-4.5 py-3 focus:outline-none w-full text-gray-700 font-mono" 
                                        />
                                    </FormInput>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
