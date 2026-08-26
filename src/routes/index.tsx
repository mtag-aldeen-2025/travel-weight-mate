import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Plane } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { useState } from "react";
import type { Listing, Profile } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "وزني معاك | احجز وزن أمتعة مع مسافر" },
      { name: "description", content: "ابحث عن وزن أمتعة متاح مع مسافر إلى نفس الوجهة، أو أعرض وزنك الزايد للمسافرين." },
      { property: "og:title", content: "وزني معاك | احجز وزن أمتعة مع مسافر" },
      { property: "og:description", content: "ابحث عن وزن أمتعة متاح مع مسافر إلى نفس الوجهة، أو أعرض وزنك الزايد للمسافرين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const fetchListings = async (filters: {
  from: string;
  to: string;
  date: string;
  minWeight: string;
}) => {
  let query = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .eq("type", "offer")
    .order("created_at", { ascending: false });

  if (filters.from) query = query.ilike("from_city", `%${filters.from}%`);
  if (filters.to) query = query.ilike("to_city", `%${filters.to}%`);
  if (filters.date) query = query.eq("flight_date", filters.date);
  if (filters.minWeight) query = query.gte("weight_kg", Number(filters.minWeight));

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Listing[];
};

const fetchProfilesForListings = async (listings: Listing[]) => {
  const userIds = [...new Set(listings.map((l) => l.user_id))];
  if (userIds.length === 0) return new Map<string, Profile>();
  const { data, error } = await supabase.from("profiles").select("*").in("user_id", userIds);
  if (error) throw error;
  const map = new Map<string, Profile>();
  (data ?? []).forEach((p) => map.set(p.user_id, p as Profile));
  return map;
};

function HomePage() {
  const [filters, setFilters] = useState({ from: "", to: "", date: "", minWeight: "" });
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings", filters],
    queryFn: () => fetchListings(filters),
  });
  const { data: profiles = new Map<string, Profile>() } = useQuery({
    queryKey: ["listing-profiles", listings.map((l) => l.user_id)],
    queryFn: () => fetchProfilesForListings(listings),
    enabled: listings.length > 0,
  });

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Plane className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            وزني معاك
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            ابحث عن وزن أمتعة متاح مع مسافر، أو أعرض وزنك الزايد وساعد غيرك يوصل أغراضه بأمان.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/listings/new">
                <Plus className="ml-2 h-5 w-5" />
                أعرض وزنك
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/" onClick={() => document.getElementById("search")?.scrollIntoView({ behavior: "smooth" })}>
                <Search className="ml-2 h-5 w-5" />
                ابحث عن وزن
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="search" className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="from">مدينة المغادرة</Label>
              <Input
                id="from"
                placeholder="مثال: الخرطوم"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="to">مدينة الوصول</Label>
              <Input
                id="to"
                placeholder="مثال: القاهرة"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="date">تاريخ السفر</Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label htmlFor="weight">الوزن المطلوب (كجم)</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                placeholder="مثال: 10"
                value={filters.minWeight}
                onChange={(e) => setFilters((f) => ({ ...f, minWeight: e.target.value }))}
              />
            </div>
            <div className="flex items-end md:col-span-1">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setFilters({ from: "", to: "", date: "", minWeight: "" })}
              >
                مسح
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto flex-1 px-4 pb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">الرحلات المتاحة</h2>
          <span className="text-sm text-muted-foreground">{listings.length} عرض</span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">لا توجد رحلات متاحة</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              جرب تغيّر معايير البحث، أو كن أول من ينشر عرض وزن متاح.
            </p>
            <Button asChild className="mt-6">
              <Link to="/listings/new">أضف عرض وزن</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} profile={profiles.get(listing.user_id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
