import { createFileRoute } from "@tanstack/react-router";

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

function MyListingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">رحلاتي</h1>
      <p className="text-muted-foreground">قريباً هتقدر تشوف وتدير كل العروض اللي نشرتها.</p>
    </div>
  );
}
