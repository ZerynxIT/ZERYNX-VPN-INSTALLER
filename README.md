# ZERYNX-VPN-INSTALLER

نصاب مستقل برای استقرار آخرین نسخه‌ی مخزن عمومی [ZERYNX-VPN](https://github.com/ZerynxIT/ZERYNX-VPN) روی حساب Cloudflare هر کاربر. این نصاب GitHub را به Cloudflare متصل نمی‌کند و هیچ فایلی در مخزن اصلی تغییر نمی‌دهد.

## راهنمای سریع نصب

1. این مخزن را از مسیر **Settings → Pages → Deploy from a branch → main → /(root) → Save** روی GitHub Pages منتشر کنید.
2. آدرس GitHub Pages نصاب را باز کنید و توضیحات مجوزهای لازم را در صفحه بخوانید.
3. در داشبورد رسمی Cloudflare از بخش **My Profile → API Tokens** یک API Token بسازید و فقط سه مجوز جدول پایین را به آن بدهید.
4. توکن را کپی کنید و فقط در فیلد Cloudflare API Token نصاب قرار دهید.
5. روی **شروع نصب** بزنید. نام Worker به‌صورت خودکار **zerynx-vpn** است؛ نیازی به نام‌گذاری، Bridge یا URL اضافی نیست.
6. اگر چند حساب Cloudflare در دسترس باشد، حساب مقصد را از فهرست انتخاب کنید.
7. نصاب اعتبار توکن و دسترسی API را بررسی می‌کند، سورس رسمی را می‌گیرد، D1 را می‌سازد، Migrationها و Assets را اعمال می‌کند، Worker را Deploy می‌کند و Health Check نهایی را اجرا می‌کند.
8. در صورت موفقیت، آدرس پنل نمایش داده می‌شود. نصاب در هر اجرا آخرین Commit شاخه‌ی `main` را می‌خواند؛ برای دریافت تغییرات جدید، Update را اجرا کنید. برای Update بعدی، از همان مرورگر و دستگاه استفاده کنید و یک توکن تازه با همین مجوزها بسازید.

### نکته‌ی ارتباط و عیب‌یابی

این نسخه درخواست‌های Cloudflare را از مرورگر به Worker واسط ZERYNX با آدرس ثابت داخل کد نصاب می‌فرستد؛ Relay درخواست را به API رسمی Cloudflare منتقل می‌کند. بنابراین توکن به‌صورت هدر Authorization از مرورگر به Relay ارسال می‌شود و نباید در لاگ، دیتابیس یا Storage ذخیره شود. قبل از واردکردن توکن، کد Relay مستقرشده را بررسی کن و فقط در صورتی ادامه بده که به آن اعتماد داری. چون درخواست‌ها هدر Authorization و در بعضی مراحل Content-Type دارند، مرورگر برای برخی درخواست‌ها CORS preflight می‌فرستد. اگر خطای شبکه یا CORS دیدی، نصب موفق نشده است؛ متن کامل گزارش را نگه دار.

## دسترسی‌های API Token

برای نصب مستقیم، توکن باید سه دسترسی زیر را داشته باشد:

| Scope | Permission | کاربرد |
|---|---|---|
| Account | Account Settings — Read | شناسایی حساب مقصد |
| Account | D1 — Edit | ساخت دیتابیس و اجرای SQL Migrationها |
| Account | Workers Scripts — Edit | آپلود و انتشار Worker و Assets |

**دسترسی اختیاری:** Workers Builds Configuration — Edit فقط برای همگام‌سازی تنظیمات Build یک Worker که از قبل به همین ریپوی GitHub متصل شده باشد لازم است. این مجوز در لینک پیش‌فرض اجباری نیست؛ اگر آن را اضافه نکنی، نصب و انتشار مستقیم همچنان کار می‌کند و فقط همگام‌سازی تنظیمات Builds رد می‌شود.

نصاب هیچ دکمه یا لینک ساخت توکن ندارد؛ ساخت و تأیید توکن کاملاً در داشبورد Cloudflare انجام می‌شود. مجوز **Workers Scripts — Edit** برای انتشار مستقیم Worker استفاده می‌شود. دسترسی **Workers Builds Configuration — Edit** اختیاری است و برای نصب اولیه لازم نیست.

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

- API Token در GitHub، URL یا LocalStorage ذخیره نمی‌شود و پس از عملیات از فیلد و متغیر صفحه پاک می‌شود. برای انجام درخواست‌های Cloudflare، مرورگر آن را در هدر Authorization به Relay مدیریت‌شده ZERYNX می‌فرستد؛ کد Relay باید بدون ذخیره‌سازی توکن، درخواست را فقط به API رسمی Cloudflare منتقل کند.
- فقط اطلاعات غیرمحرمانه‌ی اتصال شامل Account ID، نام Worker، D1 ID و آخرین Commit در LocalStorage همان مرورگر ذخیره می‌شود تا Update دیتابیس قبلی را پیدا کند.
- برای Update باید از همان مرورگر/دستگاه استفاده کنید. پاک‌شدن LocalStorage باعث می‌شود نصاب دیگر D1 ID قبلی را نشناسد.
- درخواست‌های GET دارای timeout و retry محدود هستند. ساخت D1، اجرای Migration و Deploy خودکار تکرار نمی‌شوند تا از اجرای دوباره‌ی عملیات جلوگیری شود.
- اگر حساب workers.dev subdomain نداشته باشد، باید آن را از داشبورد Cloudflare فعال کنید.
- درخواست‌های Cloudflare API از طریق Relay مدیریت‌شده ZERYNX ارسال می‌شوند؛ GitHub source و Health Check همچنان از مرورگر دریافت می‌شوند. اگر Relay خاموش باشد، Origin/CORS یا allowlist مسیرها درست نباشد، درخواست پیش از دریافت پاسخ HTTP شکست می‌خورد.
- توکن را فقط در دامنه‌ی رسمی GitHub Pages خودتان وارد کنید. توکن از مرورگر به Relay ارسال می‌شود؛ بنابراین پیش از نصب، سورس Worker واسط را بررسی کنید و هرگز توکن را در گفتگو یا پیام برای شخص دیگری نفرستید.

## لینک‌ها

- Installer: https://github.com/ZerynxIT/ZERYNX-VPN-INSTALLER
- Main source: https://github.com/ZerynxIT/ZERYNX-VPN

ZERYNX VPN — Copyright (c) 2026 ZERYNX (ZerynxIT). All rights reserved.
