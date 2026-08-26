import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  Shield,
  Star,
  User,
  Weight,
} from "lucide-react";
import type { Listing, Profile, TravelType } from "@/lib/types";
import { travelTypeLabels, currencySymbols } from "@/lib/types";

export function ListingCard({ listing, profile }: { listing: Listing; profile?: Profile | null | undefined }) {
  const priceLabel = listing.price_per_kg
    ? `${listing.price_per_kg} ${currencySymbols[listing.currency]} / كجم`
    : "مجاناً";

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">{profile?.full_name ?? "مسافر"}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {profile?.is_phone_verified && (
                  <Badge variant="secondary" className="h-5 gap-1 text-[10px]">
                    <Phone className="h-3 w-3" /> هاتف
                  </Badge>
                )}
                {profile?.is_identity_verified && (
                  <Badge variant="secondary" className="h-5 gap-1 text-[10px]">
                    <Shield className="h-3 w-3" /> هوية
                  </Badge>
                )}
                <Badge variant="outline" className="h-5 text-[10px]">
                  {travelTypeLabels[listing.travel_type as TravelType]}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-semibold">جديد</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-lg font-bold">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{listing.from_city}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{listing.to_city}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{listing.flight_date ? new Date(listing.flight_date).toLocaleDateString("ar-SA") : "غير محدد"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4" />
            <span>{listing.weight_kg} كجم</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="font-semibold text-primary">{priceLabel}</p>
          <Button asChild size="sm">
            <Link to="/listings/$id" params={{ id: listing.id }}>
              التفاصيل
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
