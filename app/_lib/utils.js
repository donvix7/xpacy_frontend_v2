
import { parse } from "date-fns";

export const URL = process.env.BACKEND_URL;
export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const getBookingReason = (booking = {}) =>
  booking?.bookingReason || booking?.booking_reason || booking?.reason || booking?.purpose || "";

export const isInspectionBooking = (booking = {}) => {
  const reason = getBookingReason(booking)?.toLowerCase() || "";
  if (reason.includes("inspection")) return true;
  return Boolean(
    booking?.start_date &&
      booking?.end_date &&
      booking.start_date === booking.end_date &&
      !reason
  );
};

export const parseBookingDate = (value) => {
  if (!value) return null;
  const parsed = parse(value, "dd-MM-yyyy", new Date());
  return isNaN(parsed) ? (isNaN(new Date(value)) ? null : new Date(value)) : parsed;
};


export const progress = (
    progressEvent, 
    onOpenModal, 
    onSetProgress, 
    onSetTime, 
    startTime
  ) => {
  onOpenModal(true);
  const percent = Math.round(
    (progressEvent.loaded * 100) / progressEvent.total
  );
  onSetProgress(percent);
  const currentTime = new Date();
  const timeElapsed = (startTime - currentTime) / 1000;
  const uploadSpeed = progressEvent.loaded / timeElapsed;
  const remainingBytes = progressEvent.total - progressEvent.loaded;
  const estimatedTime = (remainingBytes / uploadSpeed).toFixed(1);
  onSetTime(estimatedTime)
}


export const checkDateInRange = (dateStr, range) => {
    if (!dateStr || !range) return true;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    switch (range) {
        case 'today':
            return targetDate.getTime() === today.getTime();
        case 'last_7_days': {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            return targetDate >= sevenDaysAgo;
        }
        case 'last_30_days': {
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return targetDate >= thirtyDaysAgo;
        }
        case 'this_month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case 'last_month': {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        }
        case 'last_3_months': {
            const threeMonthsAgo = new Date(today);
            threeMonthsAgo.setMonth(today.getMonth() - 3);
            return targetDate >= threeMonthsAgo;
        }
        case 'this_year':
            return date.getFullYear() === now.getFullYear();
        default:
            return true;
    }
};
