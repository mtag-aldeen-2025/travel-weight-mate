import { createFileRoute } from "@tanstack/react-router";

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

function BookingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">حجوزاتي</h1>
      <p className="text-muted-foreground">قريباً هتقدر تشوف كل الحجوزات وتدير حالتها.</p>
    </div>
  );
}
