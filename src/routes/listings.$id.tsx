import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Package,
  Phone,
  Shield,
  User,
  Weight,
} from "lucide-react";
import type { Listing, Profile, TravelType } from "@/lib/types";
import { travelTypeLabels, currencySymbols } from "@/lib/types";
import { useState } from "react";

export const Route = createFileRoute("/listings/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل الرحلة | وزني معاك" },
      { name: "description", content: "شاهد تفاصيل عرض الوزن المتاح واحجز الآن." },
      { property: "og:title", content: "تفاصيل الرحلة | وزني معاك" },
      { property: "og:description", content: "شاهد تفاصيل عرض الوزن المتاح واحجز الآن." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ListingDetailPage,
});

const fetchListing = async (id: string) => {
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Listing;
};

const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
  if (error) throw error;
  return data as Profile;
};

function ListingDetailPage() {
  const { id } = useParams({ from: "/listings/$id" });
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bookingWeight, setBookingWeight] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemDescription, setItemDescription] = useState("");

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id),
  });
  const { data: profileData } = useQuery({
    queryKey: ["listing-profile", listing?.user_id],
    queryFn: () => fetchProfile(listing!.user_id),
    enabled: !!listing,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("يجب تسجيل الدخول");
      if (!listing) throw new Error("لا يوجد عرض");
      const weight = Number(bookingWeight);
      if (!weight || weight <= 0 || weight > listing.weight_kg) {
        throw new Error("الوزن غير صالح");
      }
      const priceTotal = listing.price_per_kg ? weight * listing.price_per_kg : 0;
      const { error } = await supabase.from("bookings").insert({
        listing_id: listing.id,
        sender_user_id: user.id,
        traveler_user_id: listing.user_id,
        weight_kg: weight,
        item_type: itemType,
        item_description: itemDescription,
        price_total: priceTotal,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال طلب الحجز");
      queryClient.invalidateQueries({ queryKey: ["listing", id] });
      setBookingWeight("");
      setItemType("");
      setItemDescription("");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "حدث خطأ"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">العرض غير موجود</h1>
        <Button asChild className="mt-4">
          <Link to="/">العودة للرئيسية</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === listing.user_id;
  const profile = listing.profiles ?? profileData;
  const priceLabel = listing.price_per_kg
    ? `${listing.price_per_kg} ${currencySymbols[listing.currency]} / كجم`
    : "مجاناً";

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{travelTypeLabels[listing.travel_type as TravelType]}</Badge>
                <Badge variant="outline">متاح {listing.weight_kg} كجم</Badge>
              </div>
              <CardTitle className="mt-3 text-2xl md:text-3xl">
                {listing.from_city} <ArrowRight className="mx-2 inline h-6 w-6" /> {listing.to_city}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{listing.flight_date ? new Date(listing.flight_date).toLocaleDateString("ar-SA") : "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{listing.flight_time ?? "غير محدد"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Weight className="h-5 w-5" />
                  <span>{listing.weight_kg} كجم متاح</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Package className="h-5 w-5" />
                  <span>{priceLabel}</span>
                </div>
              </div>
              <Separator />
              {listing.description && (
                <div>
                  <h3 className="font-semibold">ملاحظات</h3>
                  <p className="mt-1 text-muted-foreground">{listing.description}</p>
                </div>
              )}
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                ⚠️ ممنوع نقل مواد خطرة أو محظورة قانونياً. المسؤولية القانونية تقع على الطرفين.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>بيانات المسافر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{profile?.full_name ?? "مسافر"}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.is_phone_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <Phone className="h-3 w-3" /> هاتف موثّق
                      </Badge>
                    )}
                    {profile?.is_identity_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" /> هوية موثّقة
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>احجز وزن</CardTitle>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">سجّل دخولك لإرسال طلب حجز.</p>
                  <Button asChild className="w-full">
                    <Link to="/auth">تسجيل الدخول</Link>
                  </Button>
                </div>
              ) : isOwner ? (
                <p className="text-sm text-muted-foreground">هذا عرضك أنت، لا يمكنك حجزه.</p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    bookMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="bookWeight">الوزن المطلوب (كجم)</Label>
                    <Input
                      id="bookWeight"
                      type="number"
                      min="1"
                      max={listing.weight_kg}
                      placeholder={`بحد أقصى ${listing.weight_kg}`}
                      value={bookingWeight}
                      onChange={(e) => setBookingWeight(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="itemType">نوع الأغراض</Label>
                    <Input
                      id="itemType"
                      placeholder="مثال: ملابس، هدايا"
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="itemDesc">وصف الأغراض</Label>
                    <Textarea
                      id="itemDesc"
                      placeholder="تفاصيل إضافية عن الأغراض..."
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                    />
                  </div>
                  {bookingWeight && listing.price_per_kg && (
                    <p className="text-sm font-medium">
                      السعر المتوقع: {" "}
                      {Number(bookingWeight) * listing.price_per_kg} {currencySymbols[listing.currency]}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={bookMutation.isPending}>
                    {bookMutation.isPending ? "جاري الإرسال..." : "إرسال طلب حجز"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
