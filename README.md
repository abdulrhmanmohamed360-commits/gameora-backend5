# Gameora Backend (Firebase Cloud Functions)

سيرفر حقيقي لتطبيق Gameora، بيطبّق بالظبط نفس الـ endpoints الموجودة في
`ApiService.kt` بتاع الأندرويد. مبني بـ Node.js + TypeScript + Express،
شغال جوه Firebase Cloud Functions، والداتا محفوظة في Firestore.

**مش محتاج تلمس كود الأندرويد خالص** — بس هتغيّر سطر واحد فيه (API_BASE_URL) في الآخر.

---

## الخطوات (كلها ممكن تتعمل من الموبايل)

### 1) اعمل مشروع Firebase
1. روح [console.firebase.google.com](https://console.firebase.google.com) وسجل دخول بحساب Google
2. **Add project** → اختار اسم (مثلاً `gameora-app`) → كمّل الخطوات
3. من إعدادات المشروع، لازم تفعّل خطة **Blaze** (pay-as-you-go) — من غيرها الـ Cloud Functions اللي بتعمل استدعاءات خارجية مش هتشتغل. فيه حصة مجانية شهرية كبيرة، مش هتدفع حاجة في الاستخدام العادي لمشروع صغير.
4. من نفس الكونسول: فعّل **Firestore Database** (اختار وضع Production) و **Storage**

### 2) اعمل Service Account Key (عشان GitHub يقدر ينشر بدالك)
1. من Firebase Console: ⚙️ Project settings → **Service accounts**
2. دوس **Generate new private key** → هينزلّك ملف `.json`
3. افتح الملف وانسخ **محتواه بالكامل** (هتحتاجه في الخطوة الجاية)

### 3) اعمل ريبو جديد على GitHub لـ backend ده
- ريبو **منفصل تمامًا** عن ريبو الأندرويد (`GAMEORA.MM`) — ارفع مجلد `backend` ده فيه كملف مستقل

### 4) ضيف الأسرار (Secrets) في الريبو الجديد
من الريبو: **Settings → Secrets and variables → Actions → New repository secret**، وضيف الأربعة دول:

| اسم الـ Secret | القيمة |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | محتوى ملف الـ json اللي نزلته في خطوة 2 (الصقه كامل) |
| `FIREBASE_PROJECT_ID` | Project ID بتاع مشروع Firebase (موجود في إعدادات المشروع، مش نفس اسم المشروع بالضرورة) |
| `JWT_SECRET` | أي نص عشوائي طويل (مثلاً 40 حرف مخلوط) — ده اللي بيأمّن تسجيل الدخول |
| `ADMIN_SEED_KEY` | أي كلمة سر بسيطة هتستخدمها بعدين لإضافة بيانات تجريبية |

### 5) ارفع (push) — الباقي أوتوماتيك
بمجرد ما ترفع الكود على فرع `main`، الملف `.github/workflows/firebase-deploy.yml`
هيشتغل لوحده وينشر كل حاجة (Functions + Firestore + Hosting).
تابع النتيجة من تبويب **Actions** في الريبو، زي بالظبط ما عملنا مع الأندرويد.

### 6) هتلاقي رابط السيرفر بتاعك
بعد ما الـ deploy ينجح، رابط الـ API بتاعك هيبقى:
```
https://<FIREBASE_PROJECT_ID>.web.app/v1/
```
(بدّل `<FIREBASE_PROJECT_ID>` بالـ Project ID الحقيقي بتاعك)

### 7) ضيف ألعاب وفئات تجريبية (مرة واحدة)
افتح من متصفح الموبايل:
```
https://<FIREBASE_PROJECT_ID>.web.app/seed.html
```
حط قيمة `ADMIN_SEED_KEY` اللي حطيتها في خطوة 4، ودوس الزرار. كده هتتضاف ألعاب وفئات تجريبية (PUBG Mobile, Free Fire...إلخ) عشان التطبيق ميبقاش فاضي.

### 8) وصّل الأندرويد بالسيرفر الجديد
في ريبو الأندرويد، افتح `app/build.gradle` وابدّل السطرين دول:
```gradle
buildConfigField "String", "API_BASE_URL", "\"https://<FIREBASE_PROJECT_ID>.web.app/v1/\""
buildConfigField "String", "IMAGE_BASE_URL", "\"https://<FIREBASE_PROJECT_ID>.web.app/v1/\""
```
اعمل commit وpush — الـ workflow بتاع الأندرويد هيبني APK جديد أوتوماتيك زي المرة اللي فاتت، وده يكلم السيرفر الحقيقي دلوقتي.

---

## ملاحظات مهمة

- **مفيش endpoint لإضافة ألعاب/فئات من التطبيق نفسه** (مش موجود في العقد الأصلي `ApiService.kt`) — بتتضاف بس عن طريق صفحة `seed.html` أو مباشرة من Firestore Console. لو عايز شاشة أدمن كاملة تقدر تضيف/تعدّل بيها لاحقًا، قولّي.
- **زرار "تواصل مع البائع"** في شاشة تفاصيل المنتج حاليًا بيعمل بس رسالة toast — مفيش كود في الأندرويد بيفتح شات فعلي معاه (نفس الوضع من المشروع الأصلي، مش حاجة إحنا كسرناها). الشات شغال لو دخلت من قائمة المحادثات مباشرة.
- الأمان: `firestore.rules` و `storage.rules` مقفولين تمامًا للقراءة/الكتابة المباشرة — كل حاجة لازم تعدي من الـ Functions، مفيش وصول مباشر من برة.
- منطق الطلبات (orders): السيرفر بيتأكد من توفر المنتج، بيحسب السعر من قاعدة البيانات (مش من اللي بيبعته التطبيق)، وبيتحقق من رصيد المشتري قبل ما ينشئ أي أوردر.
