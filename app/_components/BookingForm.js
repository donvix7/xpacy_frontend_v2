"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, MapPin, Users, Building2, Tag } from "lucide-react";
import AdminHeader from "@/app/_components/AdminHeader";
import FormInput from "@/app/_components/FormInput";
import SpinnerMini from "@/app/_components/SpinnerMini";
import { createPropertyBooking } from "@/app/_lib/action";

const inputClass = (hasError) =>
    `rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink ${
        hasError ? "border-error" : "border-line"
    }`;

const selectClass =
    "rounded-lg border px-4 py-3 focus:outline-none focus:border-primary bg-card text-ink border-line";

function formatMoney(amount, currency = "NGN") {
    const num = Number(amount);
    if (!Number.isFinite(num)) return null;
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: (currency || "NGN").toUpperCase(),
            maximumFractionDigits: 0,
        }).format(num);
    } catch {
        return `${currency || "NGN"} ${num.toLocaleString()}`;
    }
}

function getTodayDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function BookingForm({
    listing = null,
    listings = [],
    units = [],
    defaultListingId = "",
    defaultUnitId = "",
    defaultPropertyId = "",
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams?.get("returnTo") || null;

    const listingsList = Array.isArray(listings) ? listings : [];
    const unitsList = Array.isArray(units) ? units : [];

    const [isPending, setIsPending] = useState(false);

    const todayStr = useMemo(() => getTodayDateString(), []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            listingId: defaultListingId || listing?.id || listing?._id || "",
            unitId:
                defaultUnitId ||
                listing?.unitId ||
                listing?.unit?.id ||
                (unitsList.length === 1
                    ? String(unitsList[0]?.id || unitsList[0]?._id || "")
                    : ""),
            checkIn: "",
            checkOut: "",
            numberOfAdults: 1,
            numberOfChildren: 0,
            specialRequests: "",
        },
    });

    const watchedListingId = watch("listingId");
    const watchedCheckIn = watch("checkIn");
    const watchedCheckOut = watch("checkOut");
    const watchedAdults = Number(watch("numberOfAdults") || 0);
    const watchedChildren = Number(watch("numberOfChildren") || 0);
    const totalGuests = Math.max(1, watchedAdults + watchedChildren);

    const activeListing = useMemo(() => {
        if (listing && (!watchedListingId || String(listing.id || listing._id) === String(watchedListingId))) {
            return listing;
        }
        if (watchedListingId && listingsList.length > 0) {
            return (
                listingsList.find(
                    (l) => String(l.id || l._id) === String(watchedListingId)
                ) || listing
            );
        }
        return listing;
    }, [listing, listingsList, watchedListingId]);

    const resolvedPropertyId =
        defaultPropertyId ||
        activeListing?.propertyId ||
        activeListing?.property?.id ||
        activeListing?.unit?.propertyId ||
        "";

    const backHref =
        returnTo ||
        (activeListing?.id || activeListing?._id
            ? `/listings/${encodeURIComponent(activeListing.id || activeListing._id)}`
            : "/listings");

    const nightsCount = useMemo(() => {
        if (!watchedCheckIn || !watchedCheckOut) return 0;
        const start = new Date(watchedCheckIn);
        const end = new Date(watchedCheckOut);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
        const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [watchedCheckIn, watchedCheckOut]);

    const handleListingChange = (e) => {
        const nextId = e.target.value;
        setValue("listingId", nextId);
        const found = listingsList.find(
            (l) => String(l.id || l._id) === String(nextId)
        );
        if (found) {
            const nextUnitId = found.unitId || found.unit?.id || "";
            if (nextUnitId) {
                setValue("unitId", nextUnitId);
            }
        }
    };

    const onSubmit = (data) => {
        const resolvedUnitId =
            (data.unitId || "").trim() ||
            activeListing?.unitId ||
            activeListing?.unit?.id ||
            "";

        const resolvedListingId =
            (data.listingId || "").trim() ||
            activeListing?.id ||
            activeListing?._id ||
            "";

        if (!resolvedUnitId || !resolvedListingId) {
            toast.error("Both a listing and a unit are required to create a booking.");
            return;
        }

        const checkInDate = new Date(data.checkIn);
        const checkOutDate = new Date(data.checkOut);
        if (
            Number.isNaN(checkInDate.getTime()) ||
            Number.isNaN(checkOutDate.getTime()) ||
            checkOutDate <= checkInDate
        ) {
            toast.error("Check-out date must be after check-in date.");
            return;
        }

        const adults = Math.max(1, Number(data.numberOfAdults || 1));
        const children = Math.max(0, Number(data.numberOfChildren || 0));

        const payload = {
            unitId: resolvedUnitId,
            listingId: resolvedListingId,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            numberOfGuests: adults + children,
            numberOfAdults: adults,
            numberOfChildren: children,
            ...(data.specialRequests?.trim()
                ? { specialRequests: data.specialRequests.trim() }
                : {}),
        };

        setIsPending(true);
        toast.promise(createPropertyBooking(payload, resolvedPropertyId || null), {
            loading: "Submitting booking...",
            success: (res) => {
                setIsPending(false);
                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.errors?.[0]?.message ||
                            "Failed to create booking."
                    );
                }
                reset();
                router.refresh();
                setTimeout(() => {
                    router.push("/dashboard/user/bookings");
                }, 700);
                return res?.message || "Booking submitted successfully!";
            },
            error: (error) => {
                setIsPending(false);
                return `${error?.message || "Failed to create booking."}`;
            },
        });
    };

    const listingLocation =
        activeListing?.location ||
        [
            activeListing?.property?.address,
            activeListing?.property?.city,
            activeListing?.property?.state,
        ]
            .filter(Boolean)
            .join(", ");

    const listingPriceFormatted = activeListing?.price
        ? formatMoney(activeListing.price, activeListing.currency || "NGN")
        : null;

    const isShortlet =
        String(activeListing?.listingType || "").toUpperCase() === "SHORTLET";

    const estimatedTotal =
        isShortlet && nightsCount > 0 && Number(activeListing?.price) > 0
            ? formatMoney(
                  nightsCount * Number(activeListing.price),
                  activeListing.currency || "NGN"
              )
            : null;

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-canvas text-ink">
            <AdminHeader title="New Booking" backHref={backHref} />

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 flex flex-col gap-6">
                <header className="flex flex-col items-center justify-center text-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold font-sans text-ink">
                        Book Listing
                    </h1>
                    <p className="font-mono text-sm text-mute">
                        Choose your dates, guest count, and any special requests to complete your booking.
                    </p>
                </header>

                {/* Active Listing Context Card */}
                {activeListing && (
                    <div className="rounded-2xl border border-line bg-card p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col gap-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase text-primary">
                                    <Tag className="h-3 w-3" />
                                    {activeListing.listingType || "Listing"}
                                </span>
                                {activeListing.unit?.unitNumber && (
                                    <span className="inline-flex items-center gap-1 text-xs font-mono text-mute">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Unit {activeListing.unit.unitNumber}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-ink truncate">
                                {activeListing.title || "Selected Listing"}
                            </h2>
                            {listingLocation && (
                                <p className="flex items-center gap-1.5 text-xs text-mute">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{listingLocation}</span>
                                </p>
                            )}
                        </div>
                        {listingPriceFormatted && (
                            <div className="shrink-0 sm:text-right">
                                <p className="text-[11px] uppercase tracking-wide text-mute font-semibold">
                                    {isShortlet ? "Rate / Night" : "Price"}
                                </p>
                                <p className="font-mono text-xl font-extrabold text-primary">
                                    {listingPriceFormatted}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <form
                    className="p-6 sm:p-8 flex flex-col gap-8 rounded-2xl border border-line bg-card shadow-sm"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* Section 1: Listing & Dates */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Booking Details
                        </p>

                        {!listing && listingsList.length > 0 && (
                            <FormInput label="Select Listing *" id="listingId">
                                <select
                                    {...register("listingId", {
                                        required: "Please select a listing",
                                    })}
                                    onChange={handleListingChange}
                                    id="listingId"
                                    className={selectClass}
                                >
                                    <option value="">Choose a published listing...</option>
                                    {listingsList.map((item) => {
                                        const itemId = item.id || item._id;
                                        const itemPrice = item.price
                                            ? ` — ${formatMoney(item.price, item.currency)}`
                                            : "";
                                        return (
                                            <option key={itemId} value={itemId}>
                                                {item.title || "Untitled Listing"}
                                                {item.listingType ? ` (${item.listingType})` : ""}
                                                {itemPrice}
                                            </option>
                                        );
                                    })}
                                </select>
                                {errors.listingId && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.listingId.message}
                                    </span>
                                )}
                            </FormInput>
                        )}

                        {!activeListing?.unitId && !activeListing?.unit?.id && unitsList.length > 0 && (
                            <FormInput label="Unit *" id="unitId">
                                <select
                                    {...register("unitId", {
                                        required: "Please select a unit",
                                    })}
                                    id="unitId"
                                    className={selectClass}
                                >
                                    <option value="">Select a unit...</option>
                                    {unitsList.map((u) => (
                                        <option key={u.id || u._id} value={u.id || u._id}>
                                            {u.unitNumber ? `Unit ${u.unitNumber}` : u.name || "Unit"}
                                            {u.unitType ? ` (${u.unitType})` : ""}
                                        </option>
                                    ))}
                                </select>
                                {errors.unitId && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.unitId.message}
                                    </span>
                                )}
                            </FormInput>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Check-In Date *" id="checkIn">
                                <input
                                    {...register("checkIn", {
                                        required: "Check-in date is required",
                                    })}
                                    type="date"
                                    id="checkIn"
                                    min={todayStr}
                                    className={inputClass(errors.checkIn)}
                                />
                                {errors.checkIn && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.checkIn.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Check-Out Date *" id="checkOut">
                                <input
                                    {...register("checkOut", {
                                        required: "Check-out date is required",
                                        validate: (val) => {
                                            if (!watchedCheckIn || !val) return true;
                                            return (
                                                new Date(val) > new Date(watchedCheckIn) ||
                                                "Check-out must be after check-in"
                                            );
                                        },
                                    })}
                                    type="date"
                                    id="checkOut"
                                    min={watchedCheckIn || todayStr}
                                    className={inputClass(errors.checkOut)}
                                />
                                {errors.checkOut && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.checkOut.message}
                                    </span>
                                )}
                            </FormInput>
                        </div>
                    </div>

                    {/* Section 2: Guests */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Guests
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormInput label="Adults *" id="numberOfAdults">
                                <input
                                    {...register("numberOfAdults", {
                                        required: "At least 1 adult is required",
                                        min: { value: 1, message: "Minimum 1 adult" },
                                    })}
                                    type="number"
                                    min="1"
                                    step="1"
                                    id="numberOfAdults"
                                    className={inputClass(errors.numberOfAdults)}
                                />
                                {errors.numberOfAdults && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.numberOfAdults.message}
                                    </span>
                                )}
                            </FormInput>

                            <FormInput label="Children" id="numberOfChildren">
                                <input
                                    {...register("numberOfChildren", {
                                        min: { value: 0, message: "Cannot be negative" },
                                    })}
                                    type="number"
                                    min="0"
                                    step="1"
                                    id="numberOfChildren"
                                    className={inputClass(errors.numberOfChildren)}
                                />
                                {errors.numberOfChildren && (
                                    <span className="-mt-2 text-xs text-error">
                                        {errors.numberOfChildren.message}
                                    </span>
                                )}
                            </FormInput>
                        </div>

                        {/* Live Summary Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas/70 px-4 py-3 text-xs font-mono text-mute">
                            <span className="inline-flex items-center gap-1.5 text-ink font-semibold">
                                <Users className="h-4 w-4 text-primary" />
                                {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                            </span>
                            {nightsCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 text-ink font-semibold">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    {nightsCount} {nightsCount === 1 ? "Night" : "Nights"}
                                </span>
                            )}
                            {estimatedTotal && (
                                <span className="text-primary font-bold text-sm">
                                    Est. Total: {estimatedTotal}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Special Requests */}
                    <div className="flex flex-col gap-6">
                        <p className="text-base font-semibold text-ink border-b border-line pb-3">
                            Special Requests
                        </p>

                        <FormInput label="Special Requests / Notes" id="specialRequests">
                            <textarea
                                {...register("specialRequests")}
                                id="specialRequests"
                                rows={4}
                                placeholder="Any arrival notes, inspection preferences, or special requests..."
                                className={`${inputClass(errors.specialRequests)} resize-y`}
                            />
                        </FormInput>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-line pt-6">
                        <Link
                            href={backHref}
                            className="w-full sm:w-auto text-center rounded-lg border border-line px-6 py-3 font-mono text-sm font-medium text-ink hover:bg-canvas transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-mono text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                            {isPending && <SpinnerMini />}
                            <span>{isPending ? "Submitting..." : "Submit Booking"}</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

