import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plane, Weight, Calendar, MapPin, ArrowRight, Eye, Trash2 } from "lucide-react";
import type { Listing } from "@/lib/types";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/my-listings")({
  head: () => ({
    meta: [
      { title: "رحلاتي | وزني معاك" },
      { name: "description", content: "إدارة الرحلات والعروض اللي نشرتها." },
      { property: "og:title", content: "رحلاتي | وزني معاك" },
      { property: "og:description", content: "إدارة الرحلات والعروض اللي نشرتها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyListingsPage,
});

const fetchMyListings = async (userId: string) => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Listing[];
};

function MyListingsPage() {
  const { user } = useAuth();
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: () => fetchMyListings(user!.id),
    enabled: !!user,
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم حذف العرض");
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">رحلاتي</h1>
          <p className="text-muted-foreground">إدارة عروض الوزن اللي نشرتها.</p>
        </div>
        <Button asChild>
          <Link to="/listings/new">
            <Plane className="ml-2 h-4 w-4" />
            عرض جديد
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Plane className="h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">ما عندك عروض</h3>
          <p className="mt-2 text-sm text-muted-foreground">أضف أول عرض وزن متاح.</p>
          <Button asChild className="mt-4">
            <Link to="/listings/new">أضف عرض</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {listing.from_city} <ArrowRight className="mx-1 inline h-4 w-4" /> {listing.to_city}
                  </CardTitle>
                  <Badge variant={listing.status === "active" ? "secondary" : "outline"}>
                    {listing.status === "active" ? "نشط" : "مغلق"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{listing.flight_date ? new Date(listing.flight_date).toLocaleDateString("ar-SA") : "غير محدد"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Weight className="h-4 w-4" />
                    <span>{listing.weight_kg} كجم</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.to_city}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/listings/$id" params={{ id: listing.id }}>
                      <Eye className="ml-2 h-4 w-4" />
                      عرض
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(listing.id)}>
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
