# ZERYNX-VPN-INSTALLER

نصاب مستقل برای استقرار آخرین نسخه‌ی مخزن عمومی [ZERYNX-VPN](https://github.com/ZerynxIT/ZERYNX-VPN) روی حساب Cloudflare هر کاربر. این نصاب GitHub را به Cloudflare متصل نمی‌کند و هیچ فایلی در مخزن اصلی تغییر نمی‌دهد.

## راهنمای سریع نصب

1. این مخزن را از مسیر **Settings → Pages → Deploy from a branch → main → /(root) → Save** روی GitHub Pages منتشر کنید.
2. آدرس GitHub Pages را باز کنید.
3. روی دکمه‌ی ساخت API Token بزنید. فرم رسمی Cloudflare با دسترسی‌های لازم از قبل پر می‌شود.
4. وارد Cloudflare شوید، مجوزها را بررسی کنید، **Continue to summary** و سپس **Create Token** را بزنید.
5. توکن را کپی کنید، به نصاب برگردید و در فیلد Cloudflare API Token قرار دهید.
6. نام Worker را وارد کنید و **Start installation** را بزنید.
7. اگر چند حساب Cloudflare دارید، حساب مقصد را انتخاب کنید.
8. نصاب D1 را می‌سازد، آخرین سورس را می‌خواند، Migrationهای دیتابیس را اجرا می‌کند و Worker را منتشر می‌کند.
9. پس از Health Check، آدرس Worker نمایش داده می‌شود. پنل را باز کنید و راه‌اندازی اولیه‌ی حساب مدیر را انجام دهید.

## دسترسی‌های API Token

لینک ساخت توکن، این دسترسی‌ها را در فرم Cloudflare از قبل انتخاب می‌کند:

| Scope | Permission | کاربرد |
|---|---|---|
| Account | Account Settings — Read | شناسایی حساب مقصد |
| Account | D1 — Edit | ساخت دیتابیس و اجرای SQL Migrationها |
| Account | Workers Scripts — Edit | آپلود و انتشار Worker و Assets |

Cloudflare پس از ورود، فرم را به کاربر نشان می‌دهد. کاربر باید خودش دسترسی‌ها را بررسی و تأیید کند و توکن را بسازد. لینک به‌تنهایی توکن ایجاد نمی‌کند و هیچ دسترسی‌ای بدون تأیید کاربر اعطا نمی‌شود.

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
- اگر CORS یا محدودیت شبکه درخواست مستقیم مرورگر به Cloudflare/GitHub را مسدود کند، retry به‌تنهایی مشکل را برطرف نمی‌کند.
- توکن را فقط در دامنه‌ی رسمی GitHub Pages خودتان وارد کنید؛ کد صفحه به توکن دسترسی موقت دارد.

## لینک‌ها

- Installer: https://github.com/ZerynxIT/ZERYNX-VPN-INSTALLER
- Main source: https://github.com/ZerynxIT/ZERYNX-VPN

ZERYNX VPN — Copyright (c) 2026 ZERYNX (ZerynxIT). All rights reserved.
