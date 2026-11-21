# ZERYNX-VPN-INSTALLER

نصاب استقرار مستقیم ZERYNX VPN روی حساب Cloudflare کاربر. این پروژه هیچ تغییری در ریپوی اصلی `ZERYNX-VPN` ایجاد نمی‌کند.

## انتشار روی GitHub Pages
1. محتوای ZIP را در ریشه ریپوی `ZERYNX-VPN-INSTALLER` قرار دهید.
2. در GitHub وارد Settings → Pages شوید.
3. در بخش Build and deployment گزینه Deploy from a branch را انتخاب کنید.
4. Branch را روی `main` و پوشه را روی `/ (root)` قرار دهید و Save کنید.
5. پس از انتشار، آدرس GitHub Pages را باز کنید.

## مجوزهای API Token
یک Custom Token بسازید و فقط روی Account مقصد محدود کنید:
- Account → Account Settings → Read
- Account → D1 → Edit
- Account → Workers Scripts → Edit

نام دقیق گزینه‌ها ممکن است در رابط Cloudflare کمی متفاوت باشد. توکن را فقط در صفحه HTTPS نصاب وارد کنید.

## رفتار نصاب
- سورس Worker و فایل‌های پنل را مستقیماً از شاخه `main` مخزن رسمی ZERYNX-VPN می‌خواند.
- D1 را با نام `zerynx-<worker-name>` می‌سازد.
- Worker را از طریق Cloudflare Workers Script Upload API مستقر می‌کند.
- Bindingهای `DB` و `ASSETS` را در metadata استقرار تنظیم می‌کند.
- پس از Deploy مسیر `/api/health` را بررسی می‌کند.
- اطلاعات غیرمحرمانه نصب (Account ID، Worker name و D1 ID) را فقط در LocalStorage همان مرورگر نگه می‌دارد تا Update بتواند همان دیتابیس را حفظ کند.
- API Token در LocalStorage، URL، GitHub یا هیچ فایل ریپو نوشته نمی‌شود؛ بعد از عملیات از فیلد پاک و از متغیر حافظه پاک می‌شود.
- دکمه Update همان Worker را با آخرین سورس شاخه `main` جایگزین می‌کند و دیتابیس قبلی را دوباره استفاده می‌کند.

## نکات مهم
- این نسخه از Cloudflare API مستقیم از مرورگر استفاده می‌کند. اگر مرورگر یا شبکه درخواست‌های cross-origin به `api.cloudflare.com` را به‌علت CORS مسدود کند، نصب از GitHub Pages در آن محیط ممکن نیست؛ باید از یک مرورگر/شبکه سازگار استفاده شود یا بعداً یک API واسط اختصاصی اضافه شود.
- برای Update از همان مرورگر/دستگاه استفاده کنید؛ LocalStorage پاک‌شده باشد، اطلاعات اتصال قبلی در دسترس نیست.
- اگر حساب هنوز workers.dev subdomain نداشته باشد، نصاب برای ایجاد آن نام می‌پرسد.
- اگر نصب در میانه کار قطع شود، ممکن است D1 ساخته شده باشد. اطلاعات لازم برای Update پس از ساخت D1 ذخیره می‌شود؛ دوباره از Update استفاده کنید.
- پیش از انتشار عمومی، روی یک حساب آزمایشی Cloudflare تست end-to-end انجام دهید. تست واقعی API به حساب و توکن Cloudflare نیاز دارد و در محیط توسعه این بسته اجرا نشده است.
- این نصاب فقط استقرار را خودکار می‌کند؛ رفتار و محدودیت‌های خود Worker تابع سورس اصلی و شرایط Cloudflare است.

## منبع و مالکیت
ZERYNX VPN — Copyright (c) 2026 ZERYNX (ZerynxIT). All rights reserved.
سورس اصلی: https://github.com/ZerynxIT/ZERYNX-VPN
این نصاب مجوز اضافه‌ای برای تغییر یا بازبرندسازی پروژه اصلی ایجاد نمی‌کند.
