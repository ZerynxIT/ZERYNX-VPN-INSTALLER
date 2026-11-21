# ZERYNX-VPN-INSTALLER

نصاب مستقل برای استقرار آخرین نسخه‌ی مخزن عمومی [ZERYNX-VPN](https://github.com/ZerynxIT/ZERYNX-VPN) روی حساب Cloudflare هر کاربر. این نصاب GitHub را به Cloudflare متصل نمی‌کند و هیچ فایلی در مخزن اصلی تغییر نمی‌دهد.

## راهنمای سریع نصب

1. این مخزن را از مسیر **Settings → Pages → Deploy from a branch → main → /(root) → Save** روی GitHub Pages منتشر کنید.
2. یک‌بار **Cloudflare API Bridge** شخصی خودتان را طبق بخش بعدی Deploy کنید. این مرحله ارتباط مرورگر با API رسمی Cloudflare را از مسیر Worker خودتان عبور می‌دهد.
3. آدرس GitHub Pages نصاب را باز کنید و URL مربوط به Bridge را در فیلد **Cloudflare API Bridge URL** قرار دهید.
4. روی دکمه‌ی ساخت API Token بزنید. فرم رسمی Cloudflare با دسترسی‌های لازم از قبل پر می‌شود.
5. وارد Cloudflare شوید، مجوزها را بررسی کنید، **Continue to summary** و سپس **Create Token** را بزنید.
6. توکن را کپی کنید، به نصاب برگردید و در فیلد Cloudflare API Token قرار دهید.
7. نام Worker را وارد کنید و **Start installation** را بزنید. در نصب اولیه، نصاب ابتدا بررسی می‌کند این نام از قبل وجود نداشته باشد؛ اگر وجود داشته باشد، برای جلوگیری از بازنویسی Worker قبلی متوقف می‌شود. نام دیگری انتخاب کنید یا اگر همین نصاب قبلاً آن را نصب کرده، از **Update existing installation** استفاده کنید.
8. اگر چند حساب Cloudflare دارید، حساب مقصد را انتخاب کنید.
9. نصاب D1 را می‌سازد، آخرین سورس را می‌خواند، Migrationهای دیتابیس را اجرا می‌کند و Worker را منتشر می‌کند.
10. پس از Health Check، آدرس Worker نمایش داده می‌شود. پنل را باز کنید و راه‌اندازی اولیه‌ی حساب مدیر را انجام دهید.

## Cloudflare API Bridge setup

راهنمای فارسی: یک‌بار Bridge شخصی خودتان را مطابق مراحل زیر راه‌اندازی کنید.

در بعضی مرورگرها یا شبکه‌ها، درخواست مستقیم از GitHub Pages به api.cloudflare.com با خطای عمومی Load failed متوقف می‌شود؛ مرورگر جزئیات دقیق CORS یا قطع اتصال را به JavaScript نمی‌دهد. برای حذف وابستگی به درخواست مستقیم مرورگر، یک Worker واسط در **حساب Cloudflare خودتان** اجرا می‌شود.

1. وارد Cloudflare Dashboard شوید و به **Workers & Pages** بروید.
2. یک Worker جدید با نامی مثل zerynx-api-bridge بسازید و Deploy اولیه را انجام دهید.
3. گزینه‌ی **Edit code** را باز کنید، کد کامل فایل [cloudflare-api-bridge.js](./cloudflare-api-bridge.js) همین مخزن را جایگزین کنید و دوباره Deploy بزنید.
4. آدرس workers.dev همان Worker را کپی کنید؛ فقط دامنه‌ی اصلی را بردارید، مثلاً https://zerynx-api-bridge.example.workers.dev.
5. این آدرس را در فیلد **Cloudflare API Bridge URL** نصاب قرار دهید. آدرس Bridge در LocalStorage همان مرورگر ذخیره می‌شود و برای Updateهای بعدی باقی می‌ماند.

Bridge فقط درخواست‌های مسیر Cloudflare API v4 را به api.cloudflare.com می‌فرستد، Origin را به دامنه‌ی رسمی GitHub Pages محدود می‌کند و هیچ API Token یا محتوای درخواست را ذخیره یا لاگ نمی‌کند. توکن در مرورگر وارد می‌شود و فقط برای همان درخواست از طریق HTTPS به Worker شخصی شما فرستاده می‌شود. اگر این مخزن را Fork کرده‌اید یا دامنه‌ی Pages را تغییر داده‌اید، مقدار ALLOWED_ORIGIN در ابتدای فایل Bridge را به Origin دقیق سایت خودتان تغییر دهید.

این Bridge یک پراکسی عمومیِ دلخواه نیست: مقصد upstream ثابت است و فقط مسیر /client/v4/ پذیرفته می‌شود. اگر خود دامنه‌ی workers.dev یا api.cloudflare.com در شبکه مسدود باشد، Bridge به‌تنهایی محدودیت شبکه را رفع نمی‌کند؛ در آن حالت باید اتصال شبکه بررسی شود.

## دسترسی‌های API Token

لینک ساخت توکن، سه دسترسی لازم برای نصب مستقیم را در فرم Cloudflare از قبل انتخاب می‌کند:

| Scope | Permission | کاربرد |
|---|---|---|
| Account | Account Settings — Read | شناسایی حساب مقصد |
| Account | D1 — Edit | ساخت دیتابیس و اجرای SQL Migrationها |
| Account | Workers Scripts — Edit | آپلود و انتشار Worker و Assets |

**دسترسی اختیاری:** Workers Builds Configuration — Edit فقط برای همگام‌سازی تنظیمات Build یک Worker که از قبل به همین ریپوی GitHub متصل شده باشد لازم است. این مجوز در لینک پیش‌فرض اجباری نیست؛ اگر آن را اضافه نکنی، نصب و انتشار مستقیم همچنان کار می‌کند و فقط همگام‌سازی تنظیمات Builds رد می‌شود.

Cloudflare پس از ورود، فرم را به کاربر نشان می‌دهد. کاربر باید خودش دسترسی‌ها را بررسی و تأیید کند و توکن را بسازد. لینک به‌تنهایی توکن ایجاد نمی‌کند و هیچ دسترسی‌ای بدون تأیید کاربر اعطا نمی‌شود. برای استفاده از API مربوط به Workers Builds، توکن باید از بخش **My Profile → API Tokens** ساخته شود (User-scoped؛ نه Account-owned API Token) و مجوز **Workers Builds Configuration — Edit** نیز در آن باشد. مجوز **Workers Scripts — Edit** نصاب برای انتشار مستقیم Worker استفاده می‌شود.

## راهنمای به‌روزرسانی

دکمه‌ی **Update existing installation** از همان مرورگر و دستگاهی استفاده می‌کند که نصب اولیه در آن انجام شده است:

1. یک API Token تازه با همان مجوزها بسازید؛ اگر توکن قبلی را لغو کرده‌اید، همان توکن لغوشده قابل استفاده نیست.
2. توکن تازه را در نصاب وارد کنید و Update را بزنید.
3. نصاب آخرین Commit شاخه‌ی `main` را از GitHub API دریافت می‌کند.
4. درخت کامل فایل‌های مخزن را می‌خواند و تنظیمات اصلی را از `wrangler.toml` استخراج می‌کند.
5. تمام ماژول‌های پشتیبانی‌شده‌ی کنار Worker entry point و تمام فایل‌های پوشه‌ی Assets معرفی‌شده در `wrangler.toml` دریافت می‌شوند؛ مسیر چهار فایل ثابت و قدیمی وجود ندارد.
6. Migrationهای جدید SQL روی همان D1 اجرا می‌شوند.
7. Worker با ماژول‌ها، Bindingهای D1/Assets و Assets جدید منتشر می‌شود.
8. Health Check اتصال واقعی Worker به D1 را بررسی می‌کند.

### همگام‌سازی Cloudflare Workers Builds

در هر نصب و Update، نصاب محل فایل `wrangler.toml` را در ریپوی اصلی پیدا می‌کند و از مسیر آن، مقدار **Root directory** را محاسبه می‌کند؛ اگر فایل در ریشه باشد مقدار Cloudflare برابر `/` است، و اگر در پوشه‌ای مانند `worker/` باشد همان مسیر پوشه استفاده می‌شود.

دستور Deploy نیز از `package.json` تشخیص داده می‌شود: اگر اسکریپت `deploy` وجود داشته باشد، نصاب Package Manager پروژه را از `packageManager` یا lockfile تشخیص می‌دهد و دستور اجرای آن اسکریپت را تنظیم می‌کند. اگر اسکریپت Deploy وجود نداشته باشد، مقدار پیش‌فرض `npx wrangler deploy` است. برای مخزن فعلی ZERYNX-VPN، چون `wrangler.toml` در ریشه است و `package.json` با اسکریپت Deploy وجود ندارد، مقادیر مورد انتظار این‌ها هستند:

- **Root directory:** `/`
- **Deploy command:** `npx wrangler deploy`

اگر Worker در Cloudflare از قبل به همین ریپوی GitHub و Workers Builds متصل شده باشد، نصاب با Builds API تنظیمات Production را به‌روزرسانی می‌کند و در صورت وجود Preview، Root directory آن را هم هماهنگ می‌کند. سایر تنظیمات موجود مثل Git branch و Build token حفظ می‌شوند.

**محدودیت اتصال اولیه:** اگر Worker هنوز به GitHub Builds وصل نشده باشد، نصاب به‌تنهایی نمی‌تواند GitHub App را به‌جای کاربر نصب/مجاز کند یا Build token بسازد. اتصال اولیه باید یک‌بار از Cloudflare Dashboard انجام شود: Worker → Settings → Builds → Connect؛ پس از آن نصاب می‌تواند تنظیمات موجود را خودکار اصلاح کند. اگر مجوز Builds در API Token وجود نداشته باشد، Deploy مستقیم همچنان انجام می‌شود، اما همگام‌سازی Build settings گزارش خطا می‌دهد و تنظیمات را تغییر نمی‌دهد.

Cloudflare Builds API به توکن User-scoped نیاز دارد و Account-owned API Token را نمی‌پذیرد. مجوز اضافه‌شده برای این بخش **Workers Builds Configuration — Edit** است; نصاب برای پیدا کردن Worker tag از مجوز موجود **Workers Scripts — Edit** استفاده می‌کند.

**Update دیتابیس قبلی را حذف یا دوباره ایجاد نمی‌کند.** همان D1 ID ذخیره‌شده در مرورگر استفاده می‌شود؛ داده‌های کاربران و تنظیمات باقی می‌مانند، مگر اینکه یک Migration عمداً آن‌ها را تغییر یا حذف کند.

## تغییر ساختار دیتابیس؛ این قسمت مهم است

Deploy کردن JavaScript جدید به‌تنهایی ساختار جدول‌های D1 موجود را تغییر نمی‌دهد. دستور `CREATE TABLE IF NOT EXISTS` فقط جدولِ غایب را ایجاد می‌کند؛ ستون‌ها و ایندکس‌های جدول موجود را با کد جدید هماهنگ نمی‌کند.

برای همین، هر تغییر Schema باید با یک Migration نسخه‌دار در مخزن اصلی ثبت شود. نصاب در هر Update فایل‌های SQL جدید را پیدا می‌کند، آن‌ها را به‌ترتیب نام روی D1 اجرا می‌کند و نام و checksum هر Migration را در جدول داخلی `__zerynx_installer_migrations` ثبت می‌کند.

### ساختار پوشه در مخزن اصلی ZERYNX-VPN

در ریشه‌ی مخزن اصلی یک پوشه‌ی `migrations/` بسازید:

```
migrations/
  0001_add_user_status.sql
  0002_add_subscription_index.sql
  0003_expand_settings.sql
```

قواعد:

- برای هر تغییر جدید یک فایل با شماره‌ی افزایشی بسازید؛ مثلاً `0004_add_user_note.sql`.
- فایل Migration اجراشده را ویرایش، حذف یا دوباره نام‌گذاری نکنید. نصاب checksum را بررسی می‌کند و اگر فایل اجراشده تغییر کرده باشد، Update را متوقف می‌کند.
- برای تغییر بعدی همیشه Migration تازه بسازید.
- Migrationها قبل از انتشار Worker جدید اجرا می‌شوند.
- Migration باید با نسخه‌ی قبلی Worker تا حد ممکن سازگار باشد؛ اگر Migration موفق شود ولی Deploy بعدی شکست بخورد، Worker قبلی هنوز فعال است.
- از `DROP TABLE`، حذف ستون یا بازسازی جدول دارای داده پرهیز کنید، مگر اینکه انتقال و حفظ داده‌ها را دقیق طراحی کرده باشید.
- پیش از Migrationهای مهم از D1 خروجی پشتیبان بگیرید و SQL را ابتدا روی دیتابیس آزمایشی امتحان کنید.

نمونه‌ی افزودن ستون:

```sql
ALTER TABLE zx_users ADD COLUMN note TEXT NOT NULL DEFAULT '';
```

نمونه‌ی افزودن ایندکس:

```sql
CREATE INDEX IF NOT EXISTS idx_zx_users_enabled
ON zx_users(enabled);
```

برای دیتابیس فعلی که پیش از اضافه‌شدن Migration Runner ساخته شده، اولین Migration باید فقط تغییر جدید موردنیاز را اعمال کند؛ لازم نیست جدول‌های فعلی را از اول بسازید. اگر Migration قبلی ندارید، از شماره‌ی `0001` شروع کنید.

## چه فایل‌هایی Deploy می‌شوند؟

- فایل‌های ماژولی پشتیبانی‌شده در پوشه‌ی کنار مسیر `main` در `wrangler.toml`: JavaScript، MJS، JSON، WASM، Text، HTML و Binary.
- تمام فایل‌های داخل پوشه‌ی Assets معرفی‌شده در `wrangler.toml`.
- تاریخ سازگاری `compatibility_date` و نام Bindingهای D1 و Assets از `wrangler.toml`.
- فایل‌های SQL در مسیر ریشه‌ی `migrations/*.sql`.

### محدودیت‌های واقعی

این نصاب یک جایگزین کامل برای تمام قابلیت‌های Wrangler و Build Pipeline نیست. پروژه‌هایی که برای Deploy به npm dependencies، نصب packageها، TypeScript compilation، bundler، چند D1، Durable Objects، KV/R2، Secrets، Environment Variables یا Bindingهای سفارشی نیاز دارند، باید برای آن‌ها مرحله‌ی Build/Binding جداگانه اضافه شود. تغییرات معمول سورس Worker، ماژول‌های همراه، فایل‌های Assets و Migrationهای SQL به‌صورت پویا از Commit جدید خوانده می‌شوند؛ اما نمی‌توان هر نوع فایل دلخواه یا هر سیستم Build را بدون پیکربندی مخصوص به Worker تبدیل کرد.

## حریم خصوصی و نکات اجرایی

- API Token فقط در حافظه‌ی صفحه استفاده می‌شود و بعد از عملیات از فیلد و متغیر حافظه پاک می‌شود؛ در GitHub، URL یا LocalStorage ذخیره نمی‌شود.
- فقط اطلاعات غیرمحرمانه‌ی اتصال شامل Account ID، نام Worker، D1 ID و آخرین Commit در LocalStorage همان مرورگر ذخیره می‌شود تا Update دیتابیس قبلی را پیدا کند.
- برای Update باید از همان مرورگر/دستگاه استفاده کنید. پاک‌شدن LocalStorage باعث می‌شود نصاب دیگر D1 ID قبلی را نشناسد.
- درخواست‌های GET دارای timeout و retry محدود هستند. ساخت D1، اجرای Migration و Deploy خودکار تکرار نمی‌شوند تا از اجرای دوباره‌ی عملیات جلوگیری شود.
- اگر حساب workers.dev subdomain نداشته باشد، باید آن را از داشبورد Cloudflare فعال کنید.
- درخواست‌های Cloudflare API از طریق API Bridge شخصی عبور می‌کنند؛ GitHub source و Health Check همچنان باید از مرورگر قابل دسترسی باشند. اگر خود شبکه دسترسی به GitHub یا workers.dev را مسدود کند، نصاب نمی‌تواند آن محدودیت بیرونی را حذف کند.
- توکن را فقط در دامنه‌ی رسمی GitHub Pages خودتان وارد کنید؛ کد صفحه به توکن دسترسی موقت دارد.

## لینک‌ها

- Installer: https://github.com/ZerynxIT/ZERYNX-VPN-INSTALLER
- Main source: https://github.com/ZerynxIT/ZERYNX-VPN

ZERYNX VPN — Copyright (c) 2026 ZERYNX (ZerynxIT). All rights reserved.
