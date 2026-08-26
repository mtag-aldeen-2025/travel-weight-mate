import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MapPin, Calendar, Weight, ArrowRight, User, MessageSquare, AlertTriangle, CheckCircle2, Package, Phone } from "lucide-react";
import type { Booking, BookingStatus, Listing, Profile } from "@/lib/types";
import { bookingStatusLabels } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "حجوزاتي | وزني معاك" },
      { name: "description", content: "تابع حجوزاتك كمسافر أو كمرسل." },
      { property: "og:title", content: "حجوزاتي | وزني معاك" },
      { property: "og:description", content: "تابع حجوزاتك كمسافر أو كمرسل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookingsPage,
});

const fetchBookings = async (userId: string) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .or(`sender_user_id.eq.${userId},traveler_user_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Booking[];
};

const fetchListing = async (id: string): Promise<Listing | null> => {
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).single();
  if (error) return null;
  return data as Listing;
};

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
  if (error) return null;
  return data as Profile;
};

function BookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: () => fetchBookings(user!.id),
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: BookingStatus }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("تم تحديث حالة الحجز");
    },
    onError: () => toast.error("فشل تحديث الحالة"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">حجوزاتي</h1>
      <p className="text-muted-foreground">كل طلبات الحجز اللي شاركت فيها كمسافر أو مرسل.</p>

      <div className="mt-6 grid gap-4">
        {bookings.length === 0 ? (
          <EmptyBookings />
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              currentUserId={user!.id}
              onUpdateStatus={(status) => updateStatus.mutate({ bookingId: booking.id, status })}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyBookings() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">لا توجد حجوزات</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        ابحث عن رحلة متاحة واحجز وزن، أو أضف عرض وزن وانتظر الطلبات.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link to="/">البحث</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/listings/new">أضف عرض</Link>
        </Button>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  currentUserId,
  onUpdateStatus,
}: {
  booking: Booking;
  currentUserId: string;
  onUpdateStatus: (status: BookingStatus) => void;
}) {
  const { data: listing } = useQuery({
    queryKey: ["booking-listing", booking.listing_id],
    queryFn: () => fetchListing(booking.listing_id),
    enabled: !!booking.listing_id,
  });
  const otherUserId = currentUserId === booking.sender_user_id ? booking.traveler_user_id : booking.sender_user_id;
  const { data: otherProfile } = useQuery({
    queryKey: ["booking-profile", otherUserId],
    queryFn: () => fetchProfile(otherUserId),
    enabled: !!otherUserId,
  });

  const isTraveler = currentUserId === booking.traveler_user_id;
  const isSender = currentUserId === booking.sender_user_id;

  const statusColor: Record<BookingStatus, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    delivered: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-primary/10 text-primary",
    cancelled: "bg-muted text-muted-foreground",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{otherProfile?.full_name ?? "مستخدم"}</p>
              <p className="text-xs text-muted-foreground">
                {isTraveler ? "المرسل" : "المسافر"}
                {otherProfile?.phone && (
                  <span className="me-2 flex items-center gap-1 inline-flex">
                    <Phone className="h-3 w-3" /> {otherProfile.phone}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Badge className={statusColor[booking.status as BookingStatus]}>
            {bookingStatusLabels[booking.status as BookingStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {listing && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{listing.from_city}</span>
            <ArrowRight className="h-4 w-4" />
            <span>{listing.to_city}</span>
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Calendar className="h-4 w-4" />
            <span>{listing.flight_date ? new Date(listing.flight_date).toLocaleDateString("ar-SA") : "غير محدد"}</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Weight className="h-4 w-4 text-muted-foreground" />
            <span>{booking.weight_kg} كجم</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>{booking.item_type ?? "غير محدد"}</span>
          </div>
        </div>
        {booking.item_description && (
          <p className="text-sm text-muted-foreground">{booking.item_description}</p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {isTraveler && booking.status === "pending" && (
            <>
              <Button size="sm" onClick={() => onUpdateStatus("accepted")}>
                <CheckCircle2 className="ml-2 h-4 w-4" />
                قبول
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateStatus("rejected")}>
                رفض
              </Button>
            </>
          )}
          {isTraveler && booking.status === "accepted" && (
            <Button size="sm" variant="secondary" onClick={() => onUpdateStatus("delivered")}>
              تم التسليم
            </Button>
          )}
          {isSender && booking.status === "delivered" && (
            <Button size="sm" variant="secondary" onClick={() => onUpdateStatus("completed")}>
              <CheckCircle2 className="ml-2 h-4 w-4" />
              تأكيد الاستلام
            </Button>
          )}
          <Button asChild size="sm" variant="outline">
            <Link to="/">التواصل</Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {}}>
            <AlertTriangle className="ml-2 h-4 w-4" />
            بلاغ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
