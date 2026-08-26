import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Phone, Shield, Camera, Save, LogOut } from "lucide-react";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "حسابي | وزني معاك" },
      { name: "description", content: "إدارة بيانات حسابك الشخصي." },
      { property: "og:title", content: "حسابي | وزني معاك" },
      { property: "og:description", content: "إدارة بيانات حسابك الشخصي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setProfile(data as Profile);
          setFullName(data.full_name ?? "");
          setPhone(data.phone ?? "");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      full_name: fullName,
      phone,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("تم حفظ البيانات");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-3xl text-primary">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="mt-4 text-2xl">{fullName || "مستخدم"}</CardTitle>
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {profile?.is_phone_verified ? (
              <Badge variant="secondary" className="gap-1">
                <Phone className="h-3 w-3" /> هاتف موثّق
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Phone className="h-3 w-3" /> هاتف غير موثّق
              </Badge>
            )}
            {profile?.is_identity_verified ? (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" /> هوية موثّقة
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" /> هوية غير موثّقة
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="ml-2 h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
          <Separator />
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
