# تطبيق Android باستخدام Capacitor — وزني معاك

تم تجهيز المشروع للعمل كتطبيق Android بدون أي تغيير في التصميم أو الوظائف.
التطبيق يحمّل الواجهة المنشورة داخل WebView أصلي، لذلك كل الصفحات والروابط
(الرحلات، الحجوزات، الحساب، تسجيل الدخول بالبريد وGoogle) تعمل كما هي.

## المتطلبات على جهازك

- Node.js 20+
- Android Studio (مع Android SDK وJDK 21)

## 1) تحميل المشروع وتثبيت الحزم

```bash
git clone <رابط مستودع مشروعك>
cd <مجلد المشروع>
npm install
```

## 2) نشر التطبيق من Lovable

اضغط زر **Publish** في Lovable مرة واحدة على الأقل. رابط الإنتاج المستخدم في
`capacitor.config.ts` هو:

```
https://project--8a57e2d2-57af-4f93-8b99-d4a84cce8074.lovable.app
```

إذا ربطت دومين مخصص، غيّر `server.url` في `capacitor.config.ts` إلى دومينك.

## 3) إنشاء مشروع Android

```bash
npm run build
npx cap add android
npx cap sync android
```

## 4) تجربة التطبيق على جهاز/محاكي

```bash
npx cap run android
```
أو افتح المشروع في Android Studio:
```bash
npx cap open android
```

## 5) تجهيز مفتاح التوقيع (مرة واحدة فقط)

```bash
keytool -genkey -v -keystore wazni-release.keystore \
  -alias wazni -keyalg RSA -keysize 2048 -validity 10000
```

أنشئ ملف `android/key.properties`:

```properties
storeFile=../wazni-release.keystore
storePassword=كلمة_المرور
keyAlias=wazni
keyPassword=كلمة_المرور
```

وفي `android/app/build.gradle` أضف داخل `android { }`:

```gradle
def keyProps = new Properties()
def keyPropsFile = rootProject.file("key.properties")
if (keyPropsFile.exists()) { keyProps.load(new FileInputStream(keyPropsFile)) }

signingConfigs {
    release {
        storeFile file(keyProps['storeFile'])
        storePassword keyProps['storePassword']
        keyAlias keyProps['keyAlias']
        keyPassword keyProps['keyPassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
    }
}
```

> احتفظ بملف الـ keystore وكلمات المرور في مكان آمن — بدونه لا يمكن تحديث
> التطبيق على Google Play لاحقاً.

## 6) إخراج ملف AAB للنشر

```bash
cd android
./gradlew bundleRelease
```

الملف الناتج:

```
android/app/build/outputs/bundle/release/app-release.aab
```

## 7) النشر على Google Play

1. أنشئ حساب Google Play Console (رسوم لمرة واحدة 25$).
2. Create app → اسم التطبيق: **وزني معاك**، اللغة: العربية.
3. ارفع ملف `app-release.aab` في مسار Internal testing أو Production.
4. أكمل: وصف التطبيق، أيقونة 512×512، صور الشاشة، سياسة الخصوصية،
   استبيان محتوى التطبيق وتصنيف المحتوى.
5. أرسل للمراجعة.

## ملاحظات

- رقم النسخة: عدّل `versionCode` و`versionName` في `android/app/build.gradle`
  قبل كل رفع جديد.
- تحديثات الواجهة تظهر فوراً في التطبيق بعد الضغط على Publish في Lovable
  (لا تحتاج رفع نسخة جديدة إلا عند تغيير الإعدادات الأصلية).
- `appId` الحالي: `app.lovable.wazni_maak` — يمكن تغييره قبل أول رفع فقط.
