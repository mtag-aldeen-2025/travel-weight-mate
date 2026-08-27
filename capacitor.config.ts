import type { CapacitorConfig } from "@capacitor/cli";

/**
 * إعداد Capacitor لتطبيق "وزني معاك".
 *
 * التطبيق يعمل بتقنية SSR (TanStack Start) لذلك يتم تحميل الواجهة
 * من الموقع المنشور داخل WebView، مما يضمن عمل جميع الصفحات والروابط
 * وتسجيل الدخول بدون أي تغيير في التصميم أو الوظائف.
 *
 * بعد نشر التطبيق من Lovable، حدّث server.url إذا استخدمت دومين مخصص.
 */
const config: CapacitorConfig = {
  appId: "app.lovable.wazni_maak",
  appName: "وزني معاك",
  webDir: "dist/client",
  server: {
    url: "https://project--8a57e2d2-57af-4f93-8b99-d4a84cce8074.lovable.app",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0f766e",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
