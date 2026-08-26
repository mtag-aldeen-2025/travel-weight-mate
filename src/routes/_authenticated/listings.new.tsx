import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { travelTypeLabels, currencySymbols, type TravelType, type Currency } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/listings/new")({
  head: () => ({
    meta: [
      { title: "أضف عرض وزن | وزني معاك" },
      { name: "description", content: "أضف رحلتك مع الوزن المتاح والسعر لكل كيلو." },
      { property: "og:title", content: "أضف عرض وزن | وزني معاك" },
      { property: "og:description", content: "أضف رحلتك مع الوزن المتاح والسعر لكل كيلو." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreateListingPage,
});

function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fromCity: "",
    toCity: "",
    flightDate: "",
    flightTime: "",
    weightKg: "",
    pricePerKg: "",
    currency: "USD" as Currency,
    travelType: "airplane" as TravelType,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("listings").insert({
      user_id: user.id,
      type: "offer",
      from_city: form.fromCity,
      to_city: form.toCity,
      flight_date: form.flightDate || null,
      flight_time: form.flightTime || null,
      weight_kg: Number(form.weightKg),
      price_per_kg: form.pricePerKg ? Number(form.pricePerKg) : null,
      currency: form.currency,
      travel_type: form.travelType,
      description: form.description || null,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("تم نشر عرض الوزن");
    router.navigate({ to: "/" });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">أضف عرض وزن متاح</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fromCity">مدينة المغادرة *</Label>
                <Input
                  id="fromCity"
                  placeholder="مثال: الخرطوم"
                  value={form.fromCity}
                  onChange={(e) => setForm((f) => ({ ...f, fromCity: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="toCity">مدينة الوصول *</Label>
                <Input
                  id="toCity"
                  placeholder="مثال: القاهرة"
                  value={form.toCity}
                  onChange={(e) => setForm((f) => ({ ...f, toCity: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="flightDate">تاريخ الرحلة</Label>
                <Input
                  id="flightDate"
                  type="date"
                  value={form.flightDate}
                  onChange={(e) => setForm((f) => ({ ...f, flightDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="flightTime">وقت الرحلة</Label>
                <Input
                  id="flightTime"
                  type="time"
                  value={form.flightTime}
                  onChange={(e) => setForm((f) => ({ ...f, flightTime: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weightKg">الوزن المتاح (كجم) *</Label>
                <Input
                  id="weightKg"
                  type="number"
                  min="1"
                  placeholder="مثال: 23"
                  value={form.weightKg}
                  onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pricePerKg">سعر الكيلو</Label>
                <Input
                  id="pricePerKg"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="اتركه فارغاً إذا مجاناً"
                  value={form.pricePerKg}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerKg: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>العملة</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm((f) => ({ ...f, currency: v as Currency }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencySymbols).map(([code, symbol]) => (
                      <SelectItem key={code} value={code}>
                        {symbol} {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>نوع وسيلة السفر</Label>
                <Select
                  value={form.travelType}
                  onValueChange={(v) => setForm((f) => ({ ...f, travelType: v as TravelType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(travelTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">ملاحظات إضافية</Label>
              <Textarea
                id="description"
                placeholder="تفاصيل عن الرحلة أو الشروط..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري النشر..." : "نشر العرض"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
