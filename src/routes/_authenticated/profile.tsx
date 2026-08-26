import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">حسابي</h1>
      <p className="text-muted-foreground">قريباً هتقدر تعدّل بياناتك وصورتك الشخصية.</p>
    </div>
  );
}
