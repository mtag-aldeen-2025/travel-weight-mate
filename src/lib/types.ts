export type TravelType = "airplane" | "bus" | "car" | "train" | "ship";

export type ListingStatus = "active" | "closed";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "delivered"
  | "completed"
  | "cancelled"
  | "rejected";

export type Currency = "USD" | "EUR" | "GBP" | "SAR" | "AED" | "EGP" | "SDG";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  type: "offer" | "request";
  from_city: string;
  to_city: string;
  flight_date: string | null;
  flight_time: string | null;
  travel_type: TravelType;
  weight_kg: number;
  price_per_kg: number | null;
  currency: Currency;
  description: string | null;
  status: ListingStatus;
  created_at: string;
  profiles?: Profile | null;
}

export interface Booking {
  id: string;
  listing_id: string;
  sender_user_id: string;
  traveler_user_id: string;
  weight_kg: number;
  item_type: string | null;
  item_description: string | null;
  status: BookingStatus;
  price_total: number;
  created_at: string;
  updated_at: string;
  listings?: Listing | null;
}

export const travelTypeLabels: Record<TravelType, string> = {
  airplane: "طيران",
  bus: "حافلة",
  car: "سيارة",
  train: "قطار",
  ship: "باخرة",
};

export const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "ر.س",
  AED: "د.إ",
  EGP: "ج.م",
  SDG: "ج.س",
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "طلب جديد",
  accepted: "مقبول",
  delivered: "تم التسليم",
  completed: "مكتمل",
  cancelled: "ملغي",
  rejected: "مرفوض",
};
